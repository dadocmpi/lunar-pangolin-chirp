// ============================================================================
// Intent classification for the support chatbot.
//
// Before any answer is produced, the customer's message is classified against
// the approved knowledge base. This is what lets the assistant understand
// informal, abbreviated, misspelled and conversational messages:
//
//   "mano como pago"                  -> checkout
//   "nao consigo entrar"              -> password_recovery
//   "ja paguei e agora?"              -> onboarding
//   "quero aquele plano de 200"       -> plans (starter)
//   "isso conecta na minha Tradeify?" -> tradovate_connection
//   "me explica de um jeito simples"  -> explain request, uses the context
//
// It also decides when the message is genuinely ambiguous and a single short
// clarifying question is better than a guess.
//
// Pure and deterministic: no I/O, no model call, no randomness. The model (when
// configured) only ever sees the classification, never produces it.
// ============================================================================

import { KNOWLEDGE_INDEX } from "./knowledge.ts";
import { rankEntries } from "./match.ts";
import { normalizeQuery, tokenize } from "./normalize.ts";
import type { ChatTurn } from "./types.ts";

/** A match below this score is noise, not a topic. */
export const MIN_INTENT_SCORE = 4.5;
/** At or above this score the topic is unambiguous, even if a second one is close. */
export const HIGH_CONFIDENCE_SCORE = 10;
/** Two topics this close together are ambiguous. */
export const AMBIGUITY_MARGIN = 1.5;
/**
 * Above this score the best topic is a real match even if a second one is
 * close: answering it (with links to the neighbour) beats asking a question.
 */
export const AMBIGUITY_TOP_MAX = 7;
/** Default topics offered when the message carries no topic at all. */
export const DEFAULT_CLARIFY_TOPICS = ["getting_started", "plans", "checkout", "activation"];

export interface IntentScore {
  id: string;
  score: number;
}

export interface IntentResult {
  /** Normalised + abbreviation-expanded message used for matching. */
  normalized: string;
  /** Best approved topic, or null when nothing matched. */
  primary: string | null;
  /** Every topic above the noise floor, strongest first. */
  intents: IntentScore[];
  /** 0..1 confidence in `primary`. */
  confidence: number;
  /** True when two topics are too close to choose between them. */
  ambiguous: boolean;
  /** True when the message has no meaningful content word ("isso", "e agora?"). */
  topicless: boolean;
  /** True when `primary` came from the conversation history. */
  contextUsed: boolean;
  /** Topic resolved from history, when there is one. */
  contextIntent: string | null;
  /** Plan id when the message names a plan, a price or a capital tier. */
  planId: string | null;
  /** True when the customer asked for a simpler or step-by-step explanation. */
  explain: boolean;
  /** True when the message points at something said earlier. */
  referential: boolean;
  greeting: boolean;
  thanks: boolean;
  /** Topics to offer in a clarifying question (max two). */
  clarifyTopics: string[];
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/** Words that carry no topic on their own. Multilingual on purpose. */
const GENERIC_WORDS = new Set([
  "a", "an", "the", "i", "you", "we", "me", "my", "your", "our", "it", "is", "are", "am",
  "be", "do", "does", "did", "can", "could", "would", "should", "will", "to", "of", "for",
  "in", "on", "at", "with", "about", "and", "or", "but", "so", "if", "this", "that", "these",
  "those", "there", "here", "now", "then", "also", "too", "more", "again", "please", "ok",
  "okay", "yes", "no", "hello", "hi", "hey", "thanks", "thank", "help", "question", "questions",
  "info", "information", "thing", "things", "something", "anything", "some", "any", "just",
  "want", "wanna", "need", "know", "tell", "explain", "sure", "right", "well", "very", "much",
  "how", "what", "where", "when", "why", "which", "who", "get", "got", "have", "has",
  "o", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "no", "na",
  "nos", "nas", "em", "e", "ou", "mas", "que", "como", "onde", "quando", "qual", "quais",
  "quem", "porque", "se", "ja", "ainda", "agora", "entao", "mais", "menos", "muito", "pouco",
  "tambem", "aqui", "ai", "la", "isso", "isto", "aquilo", "disso", "nisso", "ele", "ela",
  "eles", "elas", "esse", "essa", "este", "esta", "aquele", "aquela", "meu", "minha", "seu",
  "sua", "nosso", "nossa", "eu", "voce", "voces", "quero", "queria", "preciso", "posso",
  "pode", "poderia", "vou", "vai", "ter", "tenho", "tem", "fazer", "faz", "saber", "sei",
  "ver", "vejo", "ser", "sou", "estou", "foi", "era", "sim", "nao", "obrigado", "obrigada",
  "oi", "ola", "ajuda", "ajudar", "duvida", "pergunta", "coisa", "coisas", "sobre", "para",
  "por", "com", "sem", "ate", "bem", "mal", "tipo",
  "el", "la", "los", "las", "un", "una", "unos", "unas", "del", "en", "y", "pero", "cómo",
  "donde", "dónde", "cuando", "cuándo", "cual", "cuál", "quien", "quién", "si", "sí", "ya",
  "ahora", "entonces", "muy", "también", "aquí", "ahi", "allí", "eso", "esto", "aquello",
  "él", "ella", "ellos", "ellas", "ese", "esa", "aquel", "aquella", "mi", "mis", "tu", "tus",
  "su", "sus", "yo", "quiero", "quisiera", "necesito", "puedo", "puede", "podria", "podría",
  "voy", "va", "tener", "tengo", "tiene", "hacer", "hace", "se", "veo", "soy", "estoy", "fue",
  "era", "gracias", "hola", "ayuda", "ayudar", "duda", "pregunta", "cosa", "cosas", "hasta",
  "il", "lo", "gli", "le", "di", "che", "come", "dove", "quale", "perche", "perché", "questo",
  "quello", "sono", "sei", "voglio", "vorrei", "puoi", "ciao", "grazie", "aiuto",
  "les", "des", "du", "et", "est", "comment", "quel", "quelle", "où", "quand", "pourquoi",
  "ce", "cette", "ça", "cela", "je", "nous", "vous", "mon", "ma", "mes", "votre", "vos",
  "veux", "voudrais", "peux", "pouvez", "bonjour", "salut", "merci", "aide",
  "der", "die", "das", "den", "dem", "ein", "eine", "und", "ist", "sind", "wie", "wo", "wann",
  "warum", "welche", "dies", "es", "ich", "du", "wir", "mein", "meine", "möchte", "moechte",
  "kann", "können", "koennen", "hallo", "danke", "hilfe",
  "это", "как", "что", "где", "когда", "почему", "какой", "я", "вы", "мы", "и", "или", "не",
  "да", "привет", "спасибо", "помощь", "这个", "这", "那", "我", "你", "怎么", "什么", "哪里",
  "为什么", "吗", "的", "了", "是", "你好", "谢谢", "帮助", "これ", "それ", "あれ", "私",
  "あなた", "どう", "なに", "どこ", "なぜ", "です", "ます", "こんにちは", "ありがとう", "هذا",
  "هذه", "ذلك", "أنا", "أنت", "كيف", "ماذا", "أين", "لماذا", "هل", "نعم", "شكرا", "مرحبا",
  "مساعدة", "זה", "זו", "אני", "אתה", "איך", "מה", "איפה", "למה", "כן", "תודה", "שלום", "עזרה",
]);

const GREETING_TOKENS = new Set([
  "hello", "hi", "hey", "yo", "sup", "morning", "evening", "afternoon",
  "ola", "oi", "eai", "eae", "opa", "salve", "bom", "boa", "dia", "tarde", "noite",
  "hola", "buenas", "buenos", "dias", "días", "tardes", "noches", "ciao", "buongiorno",
  "buonasera", "bonjour", "salut", "bonsoir", "hallo", "guten", "tag", "morgen", "abend",
  "привет", "здравствуйте", "добрый", "день", "你好", "您好", "こんにちは", "おはよう",
  "مرحبا", "السلام", "عليكم", "שלום", "בוקר", "טוב",
]);

const THANKS_TOKENS = new Set([
  "thanks", "thank", "thx", "ty", "cheers", "obrigado", "obrigada", "valeu", "vlw",
  "agradecido", "gracias", "grazie", "merci", "danke", "спасибо", "谢谢", "感謝", "ありがとう",
  "شكرا", "תודה",
]);

/**
 * Unambiguous pointers at something said earlier. These are standalone
 * demonstratives, so they count wherever they appear.
 */
const STRONG_REFERENTIAL = new Set([
  "this", "that", "it", "isso", "isto", "aquilo", "disso", "nisso",
  "eso", "esto", "aquello", "ça", "cela", "ceci", "это", "זה", "זו", "这", "那", "これ", "それ",
]);

/**
 * Demonstratives that are also ordinary function words in some language
 * ("esta" is both "this" and "is" once accents are stripped). They only count
 * as a reference in a short message, where there is nothing else to mean.
 */
const WEAK_REFERENTIAL = new Set([
  "these", "those", "them", "he", "she", "they",
  "ele", "ela", "eles", "elas", "esse", "essa", "este", "esta", "aquele", "aquela", "nesse", "nessa",
  "él", "ella", "ese", "esa", "aquel", "aquella", "questo", "quello", "esso", "lui", "lei", "dies",
  "этот", "то", "هذا", "ذلك",
]);

const WEAK_REFERENTIAL_MAX_TOKENS = 4;

/** Follow-up phrases that mean "and now?" / "already did". */
const FOLLOW_UP_PHRASES = [
  "e agora", "y ahora", "and now", "what now", "now what", "e depois", "y después",
  "ja fiz", "ya lo hice", "ya hice", "already did", "i did it", "done that",
  "e então", "o que faco agora", "qué hago ahora", "what do i do now",
];

/** "Explain it simply / step by step" requests. */
const EXPLAIN_PATTERNS = [
  /\bexplain\b/, /\bexplica(r|me|melo)?\b/, /\bexpl[ií]came\b/, /\bspieg\w*\b/, /\bexplique\w*\b/,
  /\bstep by step\b/, /\bpasso a passo\b/, /\bpaso a paso\b/, /\bschritt f[üu]r schritt\b/,
  /\bin simple terms\b/, /\bde um jeito simples\b/, /\bde forma simples\b/, /\bsimples assim\b/,
  /\bde manera simple\b/, /\ben simple\b/, /\bsimpler\b/, /\bmais simples\b/, /\bmás simple\b/,
  /\bpara leigo\b/, /\bfor a beginner\b/, /\bcomo se eu fosse\b/, /\bna pratica\b/,
  /\bdetalha\w*\b/, /\bdetailed?\b/, /\bmore detail\b/, /\bmais detalhes\b/, /\bmás detalles\b/,
  /\bпроще\b/, /\bпошагово\b/, /\b简单\b/, /\b簡単に\b/, /\bببساطة\b/, /\bבפשטות\b/,
];

const PLAN_PRICES: Record<string, string> = {
  "200": "starter",
  "350": "professional",
  "600": "business",
  "820": "enterprise",
};

const PLAN_CAPITAL: Record<string, string> = {
  "25": "starter",
  "50": "professional",
  "100": "business",
  "150": "enterprise",
};

const PLAN_NAMES: Record<string, string> = {
  starter: "starter",
  iniciante: "starter",
  inicial: "starter",
  professional: "professional",
  profissional: "professional",
  profesional: "professional",
  business: "business",
  empresarial: "business",
  enterprise: "enterprise",
  corporativo: "enterprise",
};

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

export function contentTokens(normalized: string): string[] {
  return tokenize(normalized).filter((t) => !GENERIC_WORDS.has(t) && !/^\d+$/.test(t));
}

export function isTopicless(normalized: string): boolean {
  const tokens = tokenize(normalized);
  if (tokens.length === 0) return true;
  const content = contentTokens(normalized);
  if (content.length === 0) return true;
  // CJK text has no spaces: one long token is a full sentence, not a fragment.
  if (tokens.length === 1 && tokens[0].length >= 3) return false;
  return tokens.length <= 2 && content.length <= 1;
}

export function isGreeting(normalized: string): boolean {
  const tokens = tokenize(normalized);
  if (tokens.length === 0 || tokens.length > 4) return false;
  if (!tokens.some((t) => GREETING_TOKENS.has(t))) return false;
  return tokens.every((t) => GREETING_TOKENS.has(t) || GENERIC_WORDS.has(t));
}

export function isThanks(normalized: string): boolean {
  const tokens = tokenize(normalized);
  if (tokens.length === 0 || tokens.length > 4) return false;
  if (!tokens.some((t) => THANKS_TOKENS.has(t))) return false;
  return tokens.every((t) => THANKS_TOKENS.has(t) || GENERIC_WORDS.has(t) || GREETING_TOKENS.has(t));
}

export function isReferential(normalized: string): boolean {
  const tokens = tokenize(normalized);
  if (tokens.some((t) => STRONG_REFERENTIAL.has(t))) return true;
  if (tokens.length <= WEAK_REFERENTIAL_MAX_TOKENS &&
    tokens.some((t) => WEAK_REFERENTIAL.has(t))) {
    return true;
  }
  const padded = ` ${normalized} `;
  return FOLLOW_UP_PHRASES.some((p) => padded.includes(` ${p} `));
}

export function isExplainRequest(message: string): boolean {
  const text = message.toLowerCase();
  return EXPLAIN_PATTERNS.some((p) => p.test(text));
}

/**
 * Resolve a plan from an explicit price ("200", "$200", "200 usd"), a capital
 * tier ("25k") or a plan name. Returns null when no plan is named.
 */
export function detectPlanReference(normalized: string): string | null {
  const tokens = tokenize(normalized);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (PLAN_PRICES[token]) {
      // A bare number is only a plan when the message is about plans or money,
      // or when it is the only thing the customer said ("200?").
      const aboutPlans = tokens.some((t) => [
        "plan", "plano", "planos", "planes", "price", "preco", "precio", "valor",
        "cost", "custa", "mes", "month", "mensal", "mensual", "dolar", "usd", "pagar",
      ].includes(t));
      if (aboutPlans || tokens.length <= 4) return PLAN_PRICES[token];
    }
    if (PLAN_CAPITAL[token] && tokens[i + 1] === "k") return PLAN_CAPITAL[token];
    if (PLAN_NAMES[token]) return PLAN_NAMES[token];
  }
  const capital = /(\d{2,3})\s*k\b/.exec(normalized);
  if (capital && PLAN_CAPITAL[capital[1]]) return PLAN_CAPITAL[capital[1]];
  return null;
}

// ---------------------------------------------------------------------------
// Conversation context
// ---------------------------------------------------------------------------

/**
 * The most recent clearly-classified topic in the conversation. Assistant turns
 * count too: they name the topic the customer is likely referring to.
 */
export function contextIntentFromHistory(history: ChatTurn[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const ranked = rankEntries(history[i].content, KNOWLEDGE_INDEX);
    const top = ranked[0];
    if (!top || top.score < MIN_INTENT_SCORE) continue;
    const second = ranked[1];
    const ambiguous = second && top.score < HIGH_CONFIDENCE_SCORE &&
      top.score - second.score < AMBIGUITY_MARGIN;
    if (ambiguous) continue;
    return top.id;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export interface ClassifyOptions {
  history?: ChatTurn[];
}

export function classifyIntent(
  message: string,
  options: ClassifyOptions = {},
): IntentResult {
  const normalized = normalizeQuery(message);
  const history = options.history ?? [];
  const ranked = rankEntries(message, KNOWLEDGE_INDEX)
    .filter((entry) => entry.score >= MIN_INTENT_SCORE);

  const planId = detectPlanReference(normalized);
  const explain = isExplainRequest(message);
  const referential = isReferential(normalized);
  const topicless = isTopicless(normalized);
  const greeting = isGreeting(normalized) && !referential;
  const thanks = isThanks(normalized);
  const contextIntent = contextIntentFromHistory(history);

  let primary: string | null = null;
  let confidence = 0;
  let ambiguous = false;
  let contextUsed = false;
  let clarifyTopics: string[] = [];

  if (ranked.length > 0) {
    primary = ranked[0].id;
    confidence = Math.min(0.95, ranked[0].score / 20);
    const second = ranked[1];
    if (second && ranked[0].score < AMBIGUITY_TOP_MAX &&
      ranked[0].score - second.score < AMBIGUITY_MARGIN) {
      ambiguous = true;
      clarifyTopics = [ranked[0].id, second.id];
      confidence = Math.min(confidence, 0.6);
    }
  } else if (planId) {
    primary = "plans";
    confidence = 0.7;
  } else if (contextIntent && (explain || referential || topicless)) {
    primary = contextIntent;
    contextUsed = true;
    confidence = 0.6;
  }

  if (!primary && !greeting && !thanks && clarifyTopics.length === 0) {
    clarifyTopics = contextIntent ? [] : [...DEFAULT_CLARIFY_TOPICS];
  }

  return {
    normalized,
    primary,
    intents: ranked.slice(0, 4),
    confidence,
    ambiguous,
    topicless,
    contextUsed,
    contextIntent,
    planId,
    explain,
    referential,
    greeting,
    thanks,
    clarifyTopics,
  };
}

/**
 * True when the assistant should ask one short clarifying question instead of
 * answering: the topic is genuinely ambiguous, or nothing matched and there is
 * no conversation context to fall back on.
 */
export function shouldClarify(intent: IntentResult): boolean {
  if (intent.greeting || intent.thanks) return false;
  if (intent.primary) return intent.ambiguous && !intent.contextUsed;
  // No topic matched. A complete question about something we do not cover gets
  // "unknown"; only a vague message ("isso", "e agora?", "explain simply")
  // gets a clarifying question.
  return intent.topicless || intent.referential || intent.explain;
}
