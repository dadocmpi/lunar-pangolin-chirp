// ============================================================================
// Bounded, in-memory conversation state for the support chatbot.
//
// The chatbot is stateless on the server: the browser sends the visible turns
// with each request. This module derives a small, deterministic summary of
// THAT request so the assistant can behave like a first-line support agent:
// what the customer is trying to do, which topic is in play, whether they are
// confused, frustrated or ready to start, and what the previous answer covered.
//
// Nothing here is stored, logged or sent to a database. The state lives for one
// request and is derived only from the caller-supplied message + history.
//
// Pure functions only: no I/O, no model call, no randomness, no persistence.
// ============================================================================

import {
  detectPlanReference,
  MIN_INTENT_SCORE,
  type IntentResult,
} from "./intent.ts";
import type { ConversationResult } from "./conversation.ts";
import {
  detectMessageLanguage,
  type SupportedLocale,
} from "./language.ts";
import { normalizeQuery } from "./normalize.ts";
import { redactSecrets } from "./policy.ts";
import { KNOWLEDGE_INDEX } from "./knowledge.ts";
import { rankEntries } from "./match.ts";
import type { ChatTurn } from "./types.ts";

/** What the customer appears to be trying to do right now. */
export type UserGoal =
  | "greeting"
  | "learn"
  | "compare_plans"
  | "start"
  | "pay"
  | "activate"
  | "use_dashboard"
  | "get_help"
  | "smalltalk"
  | "unclear"
  | "none";

/** Where the customer is in the documented customer journey. */
export type JourneyStage =
  | "visitor"
  | "interested"
  | "account"
  | "checkout"
  | "onboarding"
  | "active"
  | "support"
  | "unknown";

export interface ConversationState {
  /** Language of this reply (latest clear message, then conversation, then locale). */
  language: SupportedLocale;
  /** Language the customer used before this message, when there is one. */
  previousLanguage: SupportedLocale | null;
  /** Approved topic id in play after this message. */
  activeTopic: string | null;
  /** Approved topic that was in play before this message. */
  previousTopic: string | null;
  /** Topic of the most recent assistant answer, when there is one. */
  lastAnswerTopic: string | null;
  /** Truncated, redacted text of the most recent assistant answer. */
  lastAnswer: string | null;
  goal: UserGoal;
  stage: JourneyStage;
  /** Plan named by price, capital tier or name. */
  planId: string | null;
  /** Last question the assistant asked, if any. */
  previousAssistantQuestion: string | null;
  /** Last customer question that has not been answered yet. */
  unresolvedQuestion: string | null;
  /** The customer appears interested in starting. */
  interested: boolean;
  /** The customer appears confused or asks for a simpler explanation. */
  confused: boolean;
  /** The customer appears frustrated or is complaining. */
  frustrated: boolean;
  /** The customer appears ready to take the next step now. */
  readyToStart: boolean;
  /** The message asks for a factual explanation. */
  asksFact: boolean;
  /** The message asks for an action ("how do I…", "reset…", "I want…"). */
  asksAction: boolean;
  /** The message clearly moved to a different topic. */
  topicChanged: boolean;
  /** Retained conversation turns considered. */
  turnCount: number;
}

const TOPIC_STAGE: Record<string, JourneyStage> = {
  public_routes: "visitor",
  getting_started: "interested",
  how_it_works: "interested",
  company_overview: "visitor",
  accounts_prop_firms: "interested",
  requirements_and_eligibility: "interested",
  benefits_and_features: "interested",
  plans: "interested",
  account_creation: "account",
  email_confirmation: "account",
  password_recovery: "account",
  profile_and_signup: "account",
  login_problem: "account",
  checkout: "checkout",
  payment_methods: "checkout",
  card_payment: "checkout",
  crypto_payment: "checkout",
  bank_transfer: "checkout",
  payment_status: "checkout",
  payment_failures: "checkout",
  refunds_cancellation: "support",
  onboarding: "onboarding",
  activation: "onboarding",
  dashboard_usage: "active",
  tradovate_connection: "active",
  read_only_limits: "active",
  withdrawal_kyc: "support",
  support_procedures: "support",
  contact_and_company: "visitor",
  faq_help: "support",
  account_actions: "account",
  security_privacy: "support",
  languages: "visitor",
  legal_documents: "support",
};

const CONFUSION_PHRASES = [
  "nao entendi", "nao entendi nada", "nao entendi nada disso", "ficou confuso",
  "estou confuso", "estou confusa", "confuso", "confusa", "nao ficou claro",
  "i dont understand", "i do not understand", "i dont get it", "i did not get it",
  "confusing", "confused", "not clear", "that makes no sense",
  "no entiendo", "no lo entiendo", "no me quedo claro", "estoy confundido",
  "estoy confundida", "confuso", "non ho capito", "ich verstehe nicht",
  "je ne comprends pas", "не понимаю", "не понял", "没看懂", "不明白", "わからない",
  "لا أفهم", "לא מבין", "לא הבנתי",
];

const FRUSTRATION_PHRASES = [
  "estou frustrado", "estou frustrada", "isso e frustrante", "que raiva",
  "estou irritado", "estou irritada", "nada funciona", "nao funciona nada",
  "pessimo atendimento", "atendimento pessimo", "uma vergonha", "isso e um golpe",
  "i am frustrated", "im frustrated", "this is frustrating", "so frustrating",
  "i am angry", "im angry", "nothing works", "this is a scam", "terrible service",
  "estoy frustrado", "estoy frustrada", "esto es frustrante", "nada funciona",
  "esto es una estafa", "ich bin frustriert", "das ist eine frechheit",
  "je suis frustre", "cest une arnaque", "я расстроен", "это мошенничество",
  "很沮丧", "这是骗局", "イライラ", "これは詐欺です", "محبط", "هذا احتيال",
  "מתוסכל", "זו הונאה",
];

const INTEREST_PHRASES = [
  "tenho interesse", "estou interessado", "estou interessada", "quero comecar",
  "quero entrar", "quero participar", "quero investir", "quero ser cliente",
  "quero aderir", "quero contratar", "como viro cliente", "como me torno cliente",
  "i am interested", "im interested", "i want to get started", "i want to start",
  "i want to join", "i want to become a customer", "how do i become a customer",
  "estoy interesado", "estoy interesada", "quiero empezar", "quiero comenzar",
  "quiero entrar", "quiero participar", "quiero ser cliente", "como me hago cliente",
];

const COMMITMENT_PHRASES = [
  "vamos", "bora", "quero agora", "quero comecar agora", "pode comecar",
  "sim quero", "sim por favor", "quero sim", "vamos la",
  "lets go", "sign me up", "yes please", "i am ready", "im ready", "start now",
  "vamos", "dale", "quiero ahora", "quiero empezar ya", "si quiero", "por favor",
];

const ACTION_PHRASES = [
  "como faco", "como faço", "como eu faco", "como pago", "como pagar",
  "quero ", "preciso ", "me ajuda", "me ajude", "reset", "redefinir",
  "recuperar", "cancelar", "ativar", "enviar", "abrir",
  "how do i", "how can i", "help me", "i want to", "i need to", "reset",
  "recover", "cancel", "activate", "send", "open",
  "como hago", "como puedo", "ayudame", "quiero ", "necesito ",
];

const QUESTION_WORDS = [
  "what", "how", "why", "when", "where", "which", "who", "can", "could", "does", "do",
  "o que", "como", "porque", "quando", "onde", "qual", "quais", "quem", "posso",
  "que", "como", "porque", "cuando", "donde", "cual", "quien", "puedo",
  "was", "wie", "warum", "wann", "wo", "welche", "konnen",
];

function normalizedHas(text: string, phrases: string[]): boolean {
  const padded = ` ${text} `;
  return phrases.some((phrase) => padded.includes(` ${phrase} `) || padded.includes(` ${phrase}`));
}

function lastTurn(history: ChatTurn[], role: ChatTurn["role"]): ChatTurn | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === role) return history[i];
  }
  return null;
}

function turnTopic(content: string): string | null {
  const ranked = rankEntries(content, KNOWLEDGE_INDEX);
  const top = ranked[0];
  return top && top.score >= MIN_INTENT_SCORE ? top.id : null;
}

function previousLanguage(history: ChatTurn[]): SupportedLocale | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== "user") continue;
    const detection = detectMessageLanguage(history[i].content);
    if (detection.locale && (!detection.short || detection.confidence >= 0.8)) {
      return detection.locale;
    }
  }
  return null;
}

function previousTopic(history: ChatTurn[], activeTopic: string | null): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const topic = turnTopic(history[i].content);
    if (topic && topic !== activeTopic) return topic;
  }
  return null;
}

function lastAssistantQuestion(history: ChatTurn[]): string | null {
  const turn = lastTurn(history, "assistant");
  if (!turn) return null;
  return /[?¿؟]/.test(turn.content) ? turn.content.slice(0, 240) : null;
}

function unresolvedQuestion(history: ChatTurn[]): string | null {
  const lastUserIndex = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "user") return i;
    }
    return -1;
  })();
  if (lastUserIndex < 0) return null;
  const turn = history[lastUserIndex];
  if (!/[?¿؟]/.test(turn.content)) return null;
  const answered = history.slice(lastUserIndex + 1).some((t) => t.role === "assistant");
  return answered ? null : turn.content.slice(0, 240);
}

function goalFor(
  intent: IntentResult,
  conv: ConversationResult,
  activeTopic: string | null,
): UserGoal {
  const conversational = conv.intent;
  if (conversational === "greeting") return "greeting";
  if (
    conversational === "farewell" || conversational === "thanks" ||
    conversational === "acknowledgement" || conversational === "language_switch"
  ) {
    return "smalltalk";
  }
  if (
    conversational === "customer_interest" || conversational === "becoming_customer" ||
    conversational === "plan_recommendation"
  ) {
    return "start";
  }
  if (
    conversational === "plans" || conversational === "pricing" ||
    conversational === "plan_discovery" || conversational === "plan_comparison" ||
    conversational === "cheapest_plan"
  ) {
    return "compare_plans";
  }
  if (
    conversational === "payment_info" || conversational === "checkout" ||
    conversational === "card_payment" || conversational === "crypto_payment" ||
    conversational === "bank_transfer" || conversational === "payment_pending" ||
    conversational === "payment_processing" || conversational === "payment_failed" ||
    conversational === "payment_confirmation"
  ) {
    return "pay";
  }
  if (conversational === "onboarding" || conversational === "activation") return "activate";
  if (
    conversational === "dashboard" || conversational === "tradovate" ||
    conversational === "read_only_limits"
  ) {
    return "use_dashboard";
  }
  if (
    conversational === "support" || conversational === "complaint" ||
    conversational === "frustration"
  ) {
    return "get_help";
  }
  if (
    conversational === "company_overview" || conversational === "company_identity" ||
    conversational === "what_we_do" || conversational === "how_it_works" ||
    conversational === "benefits" || conversational === "requirements" ||
    conversational === "eligibility"
  ) {
    return "learn";
  }
  if (conversational === "unclear" || conversational === "confusion") return "unclear";
  if (activeTopic) return "learn";
  return "none";
}

function stageFor(activeTopic: string | null, goal: UserGoal): JourneyStage {
  if (activeTopic && TOPIC_STAGE[activeTopic]) return TOPIC_STAGE[activeTopic];
  if (goal === "start" || goal === "compare_plans") return "interested";
  if (goal === "pay") return "checkout";
  if (goal === "activate") return "onboarding";
  if (goal === "use_dashboard") return "active";
  if (goal === "get_help") return "support";
  if (goal === "unclear") return "unknown";
  return "visitor";
}

export interface ConversationStateInput {
  message: string;
  history: ChatTurn[];
  locale: SupportedLocale;
  intent: IntentResult;
  conv: ConversationResult;
}

/**
 * Derive the conversation state for one request. Pure and bounded: it looks at
 * the supplied message and history only, never at a database or a provider.
 */
export function buildConversationState(input: ConversationStateInput): ConversationState {
  const { message, history, locale, intent, conv } = input;
  const query = normalizeQuery(message);
  const normalized = ` ${query} `;
  const activeTopic = intent.primary ?? conv.topic ?? null;
  const prevLanguage = previousLanguage(history);
  const prevTopic = previousTopic(history, activeTopic);
  const lastAssistant = lastTurn(history, "assistant");
  const lastAnswerTopic = lastAssistant ? turnTopic(lastAssistant.content) : null;

  const confused = conv.intent === "confusion" ||
    conv.intent === "simpler_explanation" ||
    conv.followUp === "explain" ||
    normalizedHas(query, CONFUSION_PHRASES);
  const frustrated = conv.intent === "frustration" || conv.intent === "complaint" ||
    normalizedHas(query, FRUSTRATION_PHRASES);
  const interested = conv.intent === "customer_interest" ||
    conv.intent === "becoming_customer" || conv.intent === "plan_recommendation" ||
    normalizedHas(query, INTEREST_PHRASES);
  const askedQuestion = lastAssistantQuestion(history);
  const committed = normalizedHas(query, COMMITMENT_PHRASES) ||
    /^(sim|yes|yep|ok|okay|bora|vamos|dale|claro|perfeito|sure|lets go)[.!\s]*$/.test(
      query.trim(),
    );
  const readyToStart = (interested && committed) ||
    (committed && askedQuestion !== null &&
      /plan|checkout|start|comec|começ|empez|pagar|pay/i.test(askedQuestion));
  const asksFact = /[?¿؟]/.test(message) ||
    QUESTION_WORDS.some((w) => normalized.startsWith(` ${w} `) || normalized.includes(` ${w} `));
  const asksAction = normalizedHas(query, ACTION_PHRASES) ||
    conv.intent === "checkout" || conv.intent === "activation";

  const topicChanged = Boolean(
    activeTopic && prevTopic && activeTopic !== prevTopic &&
      !confused && !intent.referential && !intent.explain &&
      !intent.contextUsed && !conv.contextUsed &&
      (conv.matchedRule || intent.confidence >= 0.7),
  );

  const goal = goalFor(intent, conv, activeTopic);

  return {
    language: locale,
    previousLanguage: prevLanguage,
    activeTopic,
    previousTopic: prevTopic,
    lastAnswerTopic,
    lastAnswer: lastAssistant ? redactSecrets(lastAssistant.content).slice(0, 600) : null,
    goal,
    stage: stageFor(activeTopic, goal),
    planId: intent.planId ?? conv.planId ?? detectPlanReference(query),
    previousAssistantQuestion: askedQuestion,
    unresolvedQuestion: unresolvedQuestion(history),
    interested,
    confused,
    frustrated,
    readyToStart,
    asksFact,
    asksAction,
    topicChanged,
    turnCount: history.length,
  };
}

/**
 * Deterministic prompt summary of the state. Topic ids and flags only: no
 * customer text except the bounded previous question, which is already part of
 * the conversation the model receives.
 */
export function statePromptLines(state: ConversationState): string[] {
  return [
    "",
    "CONVERSATION STATE (deterministic; derived from this request only):",
    `- reply language: ${state.language}`,
    `- previous customer language: ${state.previousLanguage ?? "none"}`,
    `- active topic: ${state.activeTopic ?? "none"}`,
    `- previous topic: ${state.previousTopic ?? "none"}`,
    `- topic of the last answer: ${state.lastAnswerTopic ?? "none"}`,
    `- customer goal: ${state.goal}`,
    `- journey stage: ${state.stage}`,
    `- plan referenced: ${state.planId ?? "none"}`,
    `- the last assistant question: ${state.previousAssistantQuestion ?? "none"}`,
    `- unresolved customer question: ${state.unresolvedQuestion ?? "none"}`,
    `- interested in starting: ${state.interested ? "yes" : "no"}`,
    `- confused or wants a simpler explanation: ${state.confused ? "yes" : "no"}`,
    `- frustrated or complaining: ${state.frustrated ? "yes" : "no"}`,
    `- ready to take the next step: ${state.readyToStart ? "yes" : "no"}`,
    `- asks for a fact: ${state.asksFact ? "yes" : "no"}`,
    `- asks for an action: ${state.asksAction ? "yes" : "no"}`,
    `- changed topic: ${state.topicChanged ? "yes" : "no"}`,
  ];
}
