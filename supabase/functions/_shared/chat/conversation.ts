// ============================================================================
// High-level conversational intent classification for the support chatbot.
//
// The knowledge matcher (intent.ts) decides WHICH approved article answers a
// question. This module decides WHAT KIND of message it is, before any article
// is chosen, so the assistant behaves like a first-line support agent:
//
//   "Oiiiiiiiiii"                     -> greeting
//   "quero começar"                   -> customer_interest
//   "qual plano devo escolher?"       -> plans
//   "o que preciso para começar?"     -> requirements
//   "is Braxel a prop firm?"          -> company_overview
//   "isso é uma vergonha"             -> complaint
//   "qual é a capital da França?"     -> off_topic
//   "hmm"                             -> unclear
//
// It also resolves conversational follow-ups from the supplied history
// ("e depois?", "qual deles?", "já criei", "me explica melhor"), and decides
// whether a message is even about Braxel.
//
// Pure and deterministic: no I/O, no model call, no randomness, no user data.
// The classifier never answers and never touches a provider or the database.
// ============================================================================

import {
  contextIntentFromHistory,
  detectPlanReference,
  isAcknowledgement,
  isExplainRequest,
  isFarewell,
  isGreeting,
  isReferential,
  isThanks,
  isTopicless,
  MIN_INTENT_SCORE,
} from "./intent.ts";
import { KNOWLEDGE_INDEX } from "./knowledge.ts";
import { rankEntries } from "./match.ts";
import {
  CJK_RE,
  isKeyboardMash,
  normalizeElongated,
  normalizeQuery,
  tokenize,
} from "./normalize.ts";
import type { ChatTurn } from "./types.ts";

export const CONVERSATIONAL_INTENTS = [
  "greeting",
  "farewell",
  "thanks",
  "acknowledgement",
  "language_switch",
  "company_overview",
  "what_we_do",
  "how_it_works",
  "customer_interest",
  "plans",
  "pricing",
  "benefits",
  "eligibility",
  "requirements",
  "onboarding",
  "payment_info",
  "account_creation",
  "support",
  "complaint",
  "unclear",
  "off_topic",
  /** Internal: answer the matched approved article directly. */
  "knowledge_topic",
] as const;

export type ConversationalIntent = (typeof CONVERSATIONAL_INTENTS)[number];

export type FollowUpKind =
  | "explain"
  | "next_step"
  | "which_plan"
  | "already_created"
  | "already_paid";

export interface ConversationResult {
  intent: ConversationalIntent;
  /** 0..1 confidence in the classification. */
  confidence: number;
  /** Approved article id that grounds the answer, when there is one. */
  topic: string | null;
  /** True when the message could reasonably be about Braxel. */
  inDomain: boolean;
  /** Plan named by price, capital tier or name. */
  planId: string | null;
  /** Follow-up shape resolved from the conversation, if any. */
  followUp: FollowUpKind | null;
  /** True when the topic came from the conversation history. */
  contextUsed: boolean;
  /** True when the customer asked for a simpler or step-by-step explanation. */
  explain: boolean;
  /** True when the message has no usable content ("hmm", "aaaa", "??"). */
  unclear: boolean;
  /** True when an explicit, curated intent phrase matched. */
  matchedRule: boolean;
  /** Elongation-tolerant normalised form used for matching. */
  normalized: string;
}

// ---------------------------------------------------------------------------
// Intent phrases
//
// Written in the three most common customer languages plus the other supported
// locales where a phrase is distinctive. Every phrase is normalised with
// normalizeElongated, so "quero começarrr" and "quero comecar" are the same.
// The most specific (longest) matching phrase wins.
// ---------------------------------------------------------------------------

interface IntentRule {
  intent: ConversationalIntent;
  topic: string | null;
  phrases: string[];
}

const RULES: IntentRule[] = [
  {
    intent: "complaint",
    topic: "support_procedures",
    phrases: [
      "nada funciona", "nao funciona nada", "nada esta funcionando", "isso nao funciona",
      "estou insatisfeito", "estou insatisfeita", "pessimo atendimento", "atendimento pessimo",
      "quero reclamar", "fazer uma reclamacao", "uma vergonha", "isso e um golpe",
      "e um golpe", "e uma fraude", "isso e fraude", "estou frustrado", "estou frustrada",
      "nothing works", "this is a scam", "its a scam", "this is fraud", "i am angry",
      "im angry", "i am frustrated", "im frustrated", "i want to complain", "make a complaint",
      "terrible service", "awful service", "this is unacceptable",
      "no funciona nada", "esto es una estafa", "es una estafa", "quiero quejarme",
      "estoy frustrado", "estoy frustrada", "pesimo servicio", "esto es inaceptable",
      "cest une arnaque", "das ist eine frechheit", "это мошенничество", "这是骗局",
      "これは詐欺です", "هذا احتيال", "זו הונאה",
    ],
  },
  {
    intent: "requirements",
    topic: "requirements_and_eligibility",
    phrases: [
      "o que preciso para comecar", "o que eu preciso para comecar", "o que preciso para iniciar",
      "o que e necessario para comecar", "quais sao os requisitos", "quais os requisitos",
      "o que preciso", "requisitos",
      "what do i need to get started", "what do i need to start", "what do i need",
      "what are the requirements", "what is required", "requirements",
      "que necesito para empezar", "que necesito para comenzar", "que necesito",
      "cuales son los requisitos", "requisitos",
      "cosa mi serve per iniziare", "was brauche ich", "que faut il pour commencer",
      "что нужно чтобы начать", "开始需要什么", "始めるには何が必要", "ماذا احتاج للبدء", "מה צריך כדי להתחיל",
    ],
  },
  {
    intent: "eligibility",
    topic: "requirements_and_eligibility",
    phrases: [
      "posso usar do meu pais", "posso usar no meu pais", "funciona no meu pais",
      "posso usar a plataforma do meu pais", "posso usar isso no meu pais",
      "a plataforma funciona no meu pais", "voces atuam no meu pais",
      "atendem o meu pais", "voces atendem meu pais", "quais paises", "quem pode participar",
      "quem pode usar", "sou elegivel", "elegibilidade", "tem restricao de pais",
      "can i use it from my country", "can i use from my country", "is it available in my country",
      "can i use the platform from my country", "can i use this from my country",
      "is the platform available in my country", "do you operate in my country",
      "do you accept my country", "which countries", "who can join", "who is eligible",
      "eligibility", "country restrictions",
      "puedo usarlo desde mi pais", "puedo usar la plataforma desde mi pais",
      "esta disponible en mi pais", "trabajan en mi pais", "que paises",
      "quien puede participar", "soy elegible", "elegibilidad",
      "posso usarlo dal mio paese", "kann ich es in meinem land nutzen",
      "puis je l utiliser depuis mon pays", "могу ли я пользоваться из своей страны",
      "我可以在我的国家使用吗", "自分の国から使えますか", "هل يمكنني الاستخدام من بلدي", "אפשר להשתמש מהמדינה שלי",
    ],
  },
  {
    intent: "benefits",
    topic: "benefits_and_features",
    phrases: [
      "vantagens", "quais as vantagens", "beneficios", "quais os beneficios",
      "por que usar a braxel", "porque usar a braxel", "por que escolher a braxel",
      "porque escolher a braxel", "o que eu recebo", "o que recebo", "o que tenho direito",
      "benefits", "advantages", "why should i use braxel", "why choose braxel",
      "what do i get", "what do i receive", "what is included",
      "beneficios", "ventajas", "que obtengo", "que recibo", "por que elegir braxel",
      "vantaggi", "avantages", "vorteile", "преимущества", "好处", "メリット", "المزايا", "יתרונות",
    ],
  },
  {
    intent: "plans",
    topic: "plans",
    phrases: [
      "qual plano", "qual e o plano", "qual deles", "qual delas", "qual plano devo escolher",
      "quero saber qual plano escolher", "planos e precos", "quais planos", "os planos",
      "ver os planos", "mostrar os planos", "planos", "plano",
      "which plan", "which one", "which plan should i choose", "plans and prices",
      "see the plans", "show me the plans", "plans", "plan",
      "que plan", "que plan deberia elegir", "cual plan", "planes y precios",
      "ver los planes", "planes", "plan",
      "quale piano", "welcher plan", "quel forfait", "какой тариф", "哪个套餐", "どのプラン",
      "اي خطة", "איזו תוכנית",
    ],
  },
  {
    intent: "pricing",
    topic: "plans",
    phrases: [
      "quanto custa", "quanto e", "qual o preco", "qual o valor", "precos", "preco",
      "valor do plano", "custo", "how much", "how much does it cost", "what is the price",
      "pricing", "price", "prices", "cost", "cuanto cuesta", "cuanto es", "precio",
      "precios", "costo", "combien", "prix", "wie viel", "preis", "сколько стоит",
      "价格", "多少钱", "料金", "كم السعر", "כמה עולה",
    ],
  },
  {
    intent: "company_overview",
    topic: "accounts_prop_firms",
    phrases: [
      "is braxel connected to tradeify", "is braxel tradeify", "are you tradeify",
      "braxel e a tradeify", "braxel tem ligacao com a tradeify", "voces sao da tradeify",
      "braxel trabalha com a tradeify", "braxel e ligada a tradeify",
      "es braxel tradeify", "braxel esta conectada con tradeify", "braxel es tradeify",
      "is braxel connected to lucid", "braxel e a lucid", "braxel tem ligacao com a lucid",
    ],
  },
  {
    intent: "company_overview",
    topic: "company_overview",
    phrases: [
      "o que e a braxel", "o que e braxel", "quem e a braxel", "quem e braxel",
      "quem sao voces", "sobre a empresa", "sobre voces", "sobre a braxel",
      "me fala da empresa", "fala da empresa", "quero conhecer a empresa",
      "quero conhecer melhor a empresa", "conhecer melhor a empresa", "conhecer a braxel",
      "a braxel e uma prop firm", "braxel e uma prop firm", "o que e a empresa",
      "what is braxel", "what is the company", "who are you", "who is braxel",
      "tell me about your company", "tell me about the company", "tell me about braxel",
      "about your company", "about the company", "about braxel", "your company",
      "is braxel a prop firm", "is braxel connected to tradovate",
      "i want to learn more about the company", "learn more about the company",
      "que es braxel", "quienes son", "quien es braxel", "sobre la empresa", "sobre ustedes",
      "es braxel una prop firm", "conocer la empresa", "conoce la empresa",
      "quiero conocer mejor la empresa", "quiero conocer la empresa",
      "chi siete", "wer seid ihr", "qui etes vous", "кто вы", "что такое braxel",
      "你们是谁", "braxel 是什么", "braxel とは", "من انتم", "מי אתם",
    ],
  },
  {
    intent: "what_we_do",
    topic: "company_overview",
    phrases: [
      "o que voces fazem", "o que a braxel faz", "o que voces oferecem", "quais servicos",
      "que servicos voces oferecem", "o que a empresa faz", "qual e o servico",
      "what do you do", "what does braxel do", "what services do you offer",
      "what services", "what do you offer", "what do you sell", "what is your product",
      "que hacen", "que ofrece", "que servicios", "a que se dedica",
      "cosa fate", "was macht braxel", "que faites vous", "чем вы занимаетесь",
      "你们做什么", "braxel は何をしますか", "ماذا تفعلون", "מה אתם עושים",
    ],
  },
  {
    intent: "how_it_works",
    topic: "how_it_works",
    phrases: [
      "como funciona o servico", "como funciona o processo", "qual e o processo",
      "explica o processo", "explica o processo todo", "explica tudo",
      "how does your business work",
      "how does the service work", "explain the whole process", "what is the process",
      "como funciona el proceso", "cual es el proceso", "en que consiste",
      "wie funktioniert das", "как это работает",
      "怎么运作", "これはどういう仕組み", "كيف يعمل", "איך זה עובד",
    ],
  },
  {
    intent: "onboarding",
    topic: "onboarding",
    phrases: [
      "o que acontece depois", "o que acontece depois de pagar", "depois de pagar",
      "e depois do pagamento", "depois do pagamento", "o que faco depois",
      "what happens after i join", "what happens after i pay", "what happens after i purchase",
      "after payment", "after i pay", "what happens next",
      "que pasa despues", "despues de pagar", "que pasa luego",
      "cosa succede dopo", "was passiert danach", "que se passe t il apres",
      "что происходит после", "之后会发生什么", "そのあとどうなりますか", "ماذا يحدث بعد", "מה קורה אחר כך",
    ],
  },
  {
    intent: "payment_info",
    topic: "payment_methods",
    phrases: [
      "como pago", "como eu pago", "como pagar", "como faco o pagamento", "como faco para pagar",
      "formas de pagamento", "metodos de pagamento", "meios de pagamento", "pagamento",
      "how do i pay", "how to pay", "how can i pay", "payment methods", "how does payment work",
      "como pagar", "como se paga", "metodos de pago", "formas de pago", "pago",
      "come pago", "wie bezahle ich", "comment payer", "как оплатить", "怎么付款",
      "支払い方法", "كيف ادفع", "איך משלמים",
    ],
  },
  {
    intent: "account_creation",
    topic: "account_creation",
    phrases: [
      "criar conta", "criar uma conta", "como me cadastro", "como faco o cadastro",
      "como faco para me cadastrar", "quero me cadastrar", "cadastro", "registrar",
      "create an account", "how do i sign up", "how to sign up", "sign up", "register",
      "crear cuenta", "como me registro", "registrarme", "inscribirme",
      "creare un conto", "konto erstellen", "creer un compte", "создать аккаунт",
      "创建账户", "アカウント作成", "انشاء حساب", "לפתוח חשבון",
    ],
  },
  {
    intent: "support",
    topic: "support_procedures",
    phrases: [
      "falar com o suporte", "falar com suporte", "como contacto o suporte", "contato",
      "atendimento", "preciso de ajuda",
      "contact support", "how do i contact support", "help me",
      "contactar soporte", "soporte", "ayuda", "supporto", "assistance", "hilfe",
      "поддержка", "поддержку", "支持", "サポート", "الدعم", "תמיכה",
    ],
  },
  {
    intent: "customer_interest",
    topic: "getting_started",
    phrases: [
      "quero comecar", "quero comecarr", "quero iniciar", "quero entrar", "quero participar",
      "quero aderir", "quero contratar", "quero contratar um plano", "quero ser cliente",
      "quero me tornar cliente", "quero investir com voces", "quero investir",
      "tenho interesse", "tenho interesse em comecar", "tenho interesse em participar",
      "estou interessado", "estou interessada", "estou pensando em comecar",
      "como faco para entrar", "como faco pra entrar", "como funciona para participar",
      "como funciona para entrar", "como faco para participar",
      "como faco para comecar", "como faco pra comecar", "como participo", "como viro cliente",
      "como me torno cliente", "como eu entro", "quero conhecer", "quero saber mais sobre a braxel",
      "i want to get started", "i want to start", "i want to join", "i want in",
      "i am interested", "im interested", "i am interested in joining",
      "interested in your services", "how can i start", "how can i start with braxel",
      "how do i start with braxel", "how do i join", "how can i join", "how do i become a customer",
      "how do i get started", "i want to learn more",
      "sign me up", "i want to invest with you", "i want to invest", "i am thinking about starting",
      "quiero empezar", "quiero comenzar", "quiero entrar", "quiero participar",
      "estoy interesado", "estoy interesada", "estoy interesado en comenzar",
      "quiero conocer mejor la empresa", "quiero conocer la empresa", "quiero saber mas",
      "como puedo unirme", "como me hago cliente", "como me uno", "como participo",
      "quiero contratar", "quiero invertir con ustedes", "quiero ser cliente",
      "voglio iniziare", "ich mochte anfangen", "je veux commencer", "хочу начать",
      "我想开始", "始めたい", "أريد أن أبدأ", "אני רוצה להתחיל",
    ],
  },
];

interface CompiledRule extends IntentRule {
  order: number;
  compiled: string[];
}

const COMPILED_RULES: CompiledRule[] = RULES.map((rule, order) => ({
  ...rule,
  order,
  compiled: rule.phrases.map((p) => normalizeElongated(p)).filter(Boolean),
}));

/** Words that show the message is about Braxel even without an exact phrase. */
const DOMAIN_TERMS = [
  "braxel", "company", "empresa", "servico", "service", "plano", "plan", "conta",
  "account", "pagamento", "payment", "checkout", "ativacao", "activation",
  "dashboard", "painel", "tradovate", "tradeify", "lucid", "prop firm", "kyc",
  "saque", "withdrawal", "suporte", "support", "sinal", "signals", "preco", "price",
  "trading", "trader", "corretora", "broker", "cadastro", "signup",
  "onboarding", "integracao", "reembolso", "refund", "cartao", "card", "cripto",
  "crypto", "stripe", "deposito", "deposit", "conta de cliente", "customer",
];

const FOLLOW_UP_EXPLAIN = [
  "me explica melhor", "explica melhor", "explica mais", "explica isso melhor",
  "explica de novo", "quero saber mais", "quero saber mais sobre isso", "pode continuar",
  "pode continuar explicando", "continua", "continue", "prossegue", "mais detalhes",
  "nao entendi", "nao entendi nada", "nao ficou claro", "ficou confuso",
  "explain more", "explain better", "tell me more", "more details", "go on", "continue",
  "i dont understand", "i did not understand", "i dont get it", "that is not clear",
  "como faco isso", "como faco isto", "como eu faco isso", "how do i do that",
  "how do i do this", "how do i do it", "como hago eso", "como hago esto",
  "comment je fais", "wie mache ich das", "как это сделать",
  "explicame mejor", "explica mejor", "quiero saber mas", "continua", "mas detalles",
  "no entendi", "no lo entendi", "no me quedo claro",
  "spiegami meglio", "erklare mir mehr", "explique mieux", "объясни подробнее",
  "再说详细一点", "もっと詳しく", "اشرح اكثر", "תסביר יותר",
];

const FOLLOW_UP_NEXT = [
  "e depois", "e agora", "o que faco agora", "o que fazer agora", "proximo passo",
  "qual o proximo passo", "and now", "what now", "what next", "what is next",
  "what is the next step", "next step", "y ahora", "y despues", "que hago ahora",
  "que pasa ahora", "proximo paso", "und jetzt", "et maintenant", "что теперь",
  "然后呢", "次は", "وماذا بعد", "ומה עכשיו",
];

const FOLLOW_UP_WHICH_PLAN = [
  "qual deles", "qual delas", "qual eu escolho", "qual devo escolher", "esse de",
  "essa de", "o de", "aquele de", "which one", "which of them", "which should i choose",
  "that one", "the one for", "cual de ellos", "cual de ellas", "cual elijo",
  "ese de", "el de", "quale dei due", "welchen davon", "lequel",
];

const FOLLOW_UP_ALREADY_CREATED = [
  "ja criei", "ja criei a conta", "ja criei minha conta", "ja me cadastrei",
  "i already created", "i already signed up", "i created my account", "account created",
  "ya cree", "ya cree la cuenta", "ya me registre", "ho gia creato", "habe schon erstellt",
];

const FOLLOW_UP_ALREADY_PAID = [
  "ja paguei", "ja efetuei o pagamento", "pagamento feito", "i already paid", "i paid",
  "payment done", "payment made", "ya pague", "ya lo pague", "he pagado",
  "ho gia pagato", "habe schon bezahlt", "j ai deja paye",
];

const CJK = CJK_RE;

function matches(normalized: string, phrase: string): boolean {
  if (!phrase) return false;
  if (CJK.test(phrase)) return normalized.includes(phrase);
  return ` ${normalized} `.includes(` ${phrase} `);
}

function matchesAny(normalized: string, phrases: string[]): string | null {
  let best: string | null = null;
  for (const phrase of phrases) {
    const compiled = normalizeElongated(phrase);
    if (!compiled || !matches(normalized, compiled)) continue;
    if (!best || tokenize(compiled).length > tokenize(best).length) best = compiled;
  }
  return best;
}

function matchRule(normalized: string): { rule: CompiledRule; words: number } | null {
  let best: { rule: CompiledRule; words: number } | null = null;
  for (const rule of COMPILED_RULES) {
    for (const phrase of rule.compiled) {
      if (!matches(normalized, phrase)) continue;
      const words = tokenize(phrase).length || 1;
      if (
        !best || words > best.words ||
        (words === best.words && rule.order < best.rule.order)
      ) {
        best = { rule, words };
      }
    }
  }
  return best;
}

function inDomain(normalized: string, rankedScore: number): boolean {
  if (rankedScore >= MIN_INTENT_SCORE) return true;
  return DOMAIN_TERMS.some((term) => matches(normalized, normalizeElongated(term)));
}

/** Approved topic -> high-level intent, used when the knowledge matcher wins. */
export function intentForTopic(topic: string | null): ConversationalIntent {
  switch (topic) {
    case "getting_started":
      return "customer_interest";
    case "plans":
      return "plans";
    case "company_overview":
    case "accounts_prop_firms":
    case "contact_and_company":
      return "company_overview";
    case "how_it_works":
      return "how_it_works";
    case "onboarding":
    case "activation":
      return "onboarding";
    case "payment_methods":
    case "checkout":
    case "payment_status":
      return "payment_info";
    case "account_creation":
    case "profile_and_signup":
    case "email_confirmation":
    case "password_recovery":
      return "account_creation";
    case "support_procedures":
    case "faq_help":
      return "support";
    case "benefits_and_features":
      return "benefits";
    case "requirements_and_eligibility":
      return "requirements";
    default:
      return "knowledge_topic";
  }
}

export interface ConversationOptions {
  history?: ChatTurn[];
}

/**
 * Classify the high-level conversational intent of one message.
 * Deterministic and pure; never answers and never calls a provider.
 */
export function classifyConversation(
  message: string,
  options: ConversationOptions = {},
): ConversationResult {
  const normalized = normalizeElongated(message);
  const query = normalizeQuery(message);
  const tokens = tokenize(normalized);
  const history = options.history ?? [];
  const contextTopic = contextIntentFromHistory(history);
  const planId = detectPlanReference(query);
  const explain = isExplainRequest(message);
  const mash = isKeyboardMash(message);
  const topicless = isTopicless(normalized) || mash;
  const ranked = rankEntries(message, KNOWLEDGE_INDEX).filter((r) => r.score >= MIN_INTENT_SCORE);
  const knowledgeTopic = ranked[0]?.id ?? null;
  const domain = inDomain(normalized, ranked[0]?.score ?? 0);

  const base = {
    confidence: 0.5,
    topic: null as string | null,
    inDomain: domain,
    planId,
    followUp: null as FollowUpKind | null,
    contextUsed: false,
    explain,
    unclear: false,
    matchedRule: false,
    normalized,
  };

  // 1. Social messages first: they must never be answered with an article.
  if (isGreeting(query, message)) {
    return { ...base, intent: "greeting", confidence: 0.95 };
  }
  if (isFarewell(normalized)) {
    return { ...base, intent: "farewell", confidence: 0.9 };
  }
  if (isThanks(query)) {
    return { ...base, intent: "thanks", confidence: 0.9 };
  }
  const confused = matchesAny(normalized, FOLLOW_UP_EXPLAIN) !== null;
  if (isAcknowledgement(normalized) && !isReferential(query) && !explain && !confused) {
    return { ...base, intent: "acknowledgement", confidence: 0.85 };
  }

  // 2. An explicit intent phrase ("quero começar", "qual plano", ...).
  const rule = matchRule(normalized);
  if (rule) {
    return {
      ...base,
      intent: rule.rule.intent,
      topic: rule.rule.topic,
      confidence: Math.min(0.95, 0.7 + rule.words * 0.03),
      matchedRule: true,
      inDomain: true,
    };
  }

  // 3. An "explain it simply / step by step" request stays on the topic in
  //    play (or the article it already matched); it is never off-topic.
  if (explain) {
    if (contextTopic) {
      return {
        ...base,
        intent: intentForTopic(contextTopic),
        topic: contextTopic,
        followUp: "explain",
        contextUsed: true,
        confidence: 0.7,
      };
    }
    if (knowledgeTopic) {
      return {
        ...base,
        intent: intentForTopic(knowledgeTopic),
        topic: knowledgeTopic,
        followUp: "explain",
        confidence: 0.6,
      };
    }
  }

  // 4. Follow-ups: resolve the shape, then the topic from the conversation.
  const explainPhrase = matchesAny(normalized, FOLLOW_UP_EXPLAIN);
  if (explainPhrase) {
    if (contextTopic) {
      return {
        ...base,
        intent: intentForTopic(contextTopic),
        topic: contextTopic,
        followUp: "explain",
        contextUsed: true,
        explain: true,
        confidence: 0.75,
      };
    }
    return { ...base, intent: "unclear", unclear: true, explain: true, confidence: 0.5 };
  }

  const whichPlan = matchesAny(normalized, FOLLOW_UP_WHICH_PLAN);
  if (whichPlan) {
    return {
      ...base,
      intent: "plans",
      topic: "plans",
      followUp: "which_plan",
      contextUsed: Boolean(contextTopic),
      confidence: 0.75,
    };
  }

  const alreadyCreated = matchesAny(normalized, FOLLOW_UP_ALREADY_CREATED);
  if (alreadyCreated) {
    const topic = contextTopic === "account_creation" || contextTopic === "profile_and_signup"
      ? "plans"
      : contextTopic ?? "plans";
    return {
      ...base,
      intent: intentForTopic(topic),
      topic,
      followUp: "already_created",
      contextUsed: Boolean(contextTopic),
      confidence: 0.7,
    };
  }

  const alreadyPaid = matchesAny(normalized, FOLLOW_UP_ALREADY_PAID);
  if (alreadyPaid) {
    return {
      ...base,
      intent: "onboarding",
      topic: "onboarding",
      followUp: "already_paid",
      contextUsed: Boolean(contextTopic),
      confidence: 0.8,
    };
  }

  const nextStep = matchesAny(normalized, FOLLOW_UP_NEXT);
  if (nextStep && contextTopic) {
    return {
      ...base,
      intent: intentForTopic(contextTopic),
      topic: contextTopic,
      followUp: "next_step",
      contextUsed: true,
      confidence: 0.7,
    };
  }

  // 5. A bare reference ("como faço isso?", "e esse?") is about the topic in
  //    play, never off-topic, when there is a conversation.
  if (isReferential(query) && contextTopic) {
    return {
      ...base,
      intent: intentForTopic(contextTopic),
      topic: contextTopic,
      followUp: "next_step",
      contextUsed: true,
      confidence: 0.65,
    };
  }

  // 6. A named plan without any other topic is a plans question.
  if (planId) {
    return { ...base, intent: "plans", topic: "plans", confidence: 0.7 };
  }

  // 7. The approved knowledge matcher found a topic: answer it.
  if (knowledgeTopic) {
    return {
      ...base,
      intent: intentForTopic(knowledgeTopic),
      topic: knowledgeTopic,
      confidence: 0.6,
    };
  }

  // 8. Short/vague or keyboard-mash input: ask one question, never guess.
  //    CJK text has no spaces, so one long token is a full sentence.
  if (topicless || (tokens.length <= 2 && !CJK.test(normalized)) ||
    (isReferential(query) && !contextTopic)) {
    return { ...base, intent: "unclear", unclear: true, confidence: 0.4 };
  }

  // 9. A complete message about Braxel that we cannot place: clarify.
  if (domain) {
    return { ...base, intent: "unclear", unclear: true, confidence: 0.45 };
  }

  // 10. Clearly unrelated to Braxel.
  return { ...base, intent: "off_topic", confidence: 0.8 };
}

/** True when the reply should be a short conversational line, not an article. */
export function isSocialIntent(intent: ConversationalIntent): boolean {
  return intent === "greeting" || intent === "farewell" || intent === "thanks" ||
    intent === "acknowledgement";
}

/** True when a localized conversational reply exists for this intent. */
export function hasConversationalReply(intent: ConversationalIntent): boolean {
  return intent === "customer_interest" || intent === "requirements" ||
    intent === "eligibility" || intent === "benefits" || intent === "what_we_do" ||
    intent === "complaint" || intent === "farewell" || intent === "acknowledgement";
}
