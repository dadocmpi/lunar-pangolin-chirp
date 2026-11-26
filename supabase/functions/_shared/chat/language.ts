// ============================================================================
// Deterministic language detection for the support chatbot.
//
// The answer language is decided from the CUSTOMER'S LATEST MESSAGE, not from
// the website locale, the browser locale or a default. The model is never the
// only detector: this module scores the message with script ranges, function
// words and distinctive diacritics, and the orchestrator passes the result to
// the system prompt as an explicit instruction.
//
// Fallback order (resolveResponseLanguage):
//   1. a clearly detected, non-short latest message wins;
//   2. a short/ambiguous latest message reuses the most recent clearly
//      detected USER language in the supplied history;
//   3. a decisive short greeting/affirmation (e.g. "sim", "hello") is used
//      when there is no history language;
//   4. only then the website locale.
//
// Pure functions only: no I/O, no state, no model call.
// ============================================================================

import { collapseAllRepeats } from "./normalize.ts";
import type { ChatTurn } from "./types.ts";

export const SUPPORTED_LOCALES = [
  "en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he",
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(raw: unknown): SupportedLocale {
  const value = typeof raw === "string" ? raw.trim().toLowerCase().split(/[-_]/)[0] : "";
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
    ? (value as SupportedLocale)
    : "en";
}

/** Pick the first supported locale from an Accept-Language header. */
export function localeFromAcceptLanguage(header: string | null): SupportedLocale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase().split("-")[0] ?? "";
    if ((SUPPORTED_LOCALES as readonly string[]).includes(tag)) {
      return tag as SupportedLocale;
    }
  }
  return null;
}

export type LanguageReason = "script" | "lexicon" | "greeting" | "none";

export interface LanguageDetection {
  /** Detected language, or null when the message is too ambiguous. */
  locale: SupportedLocale | null;
  /** 0..1 confidence. Decisive detections are >= 0.6. */
  confidence: number;
  reason: LanguageReason;
  /** Short messages ("ok", "lo", "hi", "sim") defer to the recent language. */
  short: boolean;
}

// ---------------------------------------------------------------------------
// Script detection (decisive)
// ---------------------------------------------------------------------------

const SCRIPT_TESTS: Array<[RegExp, SupportedLocale]> = [
  [/[\u0590-\u05FF]/, "he"],
  [/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/, "ar"],
  [/[\u0400-\u04FF]/, "ru"],
  // Kana before Han: Japanese text mixes kana with kanji.
  [/[\u3040-\u30FF]/, "ja"],
  [/[\u3400-\u4DBF\u4E00-\u9FFF]/, "zh"],
];

function detectScript(text: string): SupportedLocale | null {
  for (const [pattern, locale] of SCRIPT_TESTS) {
    if (pattern.test(text)) return locale;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Latin-script lexicons
//
// Only words that are distinctive for one language are listed. Shared domain
// words (password, plan, support, email) are deliberately excluded: they would
// create false ties between English, French, German and Italian.
// ---------------------------------------------------------------------------

const STRONG_WORDS: Record<Exclude<SupportedLocale, "ru" | "zh" | "ja" | "ar" | "he">, string[]> = {
  en: [
    "the", "and", "how", "what", "where", "when", "why", "which", "is", "are",
    "do", "does", "can", "could", "should", "would", "i", "my", "me", "your",
    "you", "we", "our", "they", "this", "that", "these", "those", "with",
    "from", "about", "into", "hello", "hi", "hey", "thanks", "thank", "yes",
    "not", "need", "want", "reset", "recover", "cancel", "buy", "signup",
    "wanna", "gonna", "gotta", "kinda", "pls", "plz", "thx", "idk", "bro",
    "dude", "cant", "dont", "doesnt", "whats", "ur", "yeah", "yep", "nope",
    "sup", "help", "someone", "someone's", "account", "pay", "paid", "login",
    "email", "dashboard", "trade", "trading", "prop", "firm", "broker",
  ],
  pt: [
    "não", "nao", "você", "voce", "vocês", "voces", "obrigado", "obrigada",
    "olá", "ola", "oi", "senha", "minha", "meu", "meus", "minhas", "uma",
    "das", "num", "numa", "pelo", "pela", "isso", "isto", "aqui", "como",
    "qual", "quais", "quando", "onde", "porque", "também", "tambem", "preciso",
    "quero", "redefinir", "recuperar", "cancelar", "comprar", "conta",
    "pagamento", "plano", "preço", "preco", "ajuda", "suporte", "palavra-passe",
    "palavra", "passe", "ativar", "ativação", "ativacao", "painel", "cadastro",
    "cadastrar", "entrar", "mano", "cara", "vou", "pra", "pro", "ta", "ne",
    "bora", "valeu", "beleza", "tranquilo", "massa", "ce", "tipo", "poxa",
    "nossa", "ja", "paguei", "consigo", "comeco", "funciona", "conecta",
    "dinheiro", "grana", "saque", "documento", "tudo", "bom", "boa", "muito",
    "tambem", "aqui", "tenho", "fazer", "ficou", "deu", "estou", "precisando",
    "duvida", "como", "onde", "quando", "quanto", "qual", "porque", "sobre",
    "pago", "começo", "tô", "tá", "né", "aí", "explica", "explicar", "jeito",
    "simples", "também", "não", "você", "está", "recebi", "confirmacao",
    "vc", "vcs", "pq", "oq", "qto", "qnd", "vlr", "pgto", "kd", "obg", "pfv",
    "tbm", "msm", "dnv", "hj", "pra", "pro", "tô", "cê", "né",
    "confirmacão", "ativacao", "pagamento", "documentos", "minha", "meu",
    "planos", "ou", "pagar", "preços", "precos", "contas", "senhas", "e-mail",
  ],
  es: [
    "el", "los", "las", "del", "cómo", "como", "cuál", "cual", "cuáles",
    "cuando", "dónde", "donde", "sí", "gracias", "hola", "usted", "ustedes",
    "mis", "tus", "sus", "nuestro", "nuestra", "contraseña", "contrasena",
    "cuenta", "pago", "precio", "ayuda", "necesito", "quiero",
    "restablecer", "restablezco", "comprar", "cancelar", "activar",
    "activación", "activacion", "correo", "sesión", "sesion",
    "tarjeta", "facturación", "facturacion", "ya", "ahora", "y", "pero", "muy",
    "esto", "eso", "es", "sin", "dinero", "plata", "puedo", "tengo", "hacer",
    "empiezo", "pague", "recibi", "cuanto", "cuesta", "debo", "aqui", "asi",
    "también", "tambien", "luego", "siempre", "nada", "todo", "bien", "mal",
    "cuenta", "pago", "pagar", "comprar", "quiero", "necesito", "correo",
    "compa", "hermano", "wey", "vale", "pues", "bueno", "no",
    "simple", "sencillo", "explicas", "explícame", "explicame", "funciona",
    "cuéntame", "cuentame", "señor", "senor", "mi",
  ],
  it: [
    "il", "gli", "della", "delle", "degli", "che", "come", "quale", "quali",
    "quando", "dove", "perché", "perche", "sì", "grazie", "ciao", "buongiorno",
    "salve", "mia", "mio", "miei", "tua", "tuo", "conto", "pagamento", "piano",
    "prezzo", "aiuto", "bisogno", "voglio", "reimpostare", "reimposto",
    "annullare", "comprare", "attivare", "attivazione", "pannello",
    "fatturazione", "accesso", "questo", "nel", "quindi", "supporto", "umano",
    "risposta", "contenuto", "verificata", "indovinare", "rispondere",
    "quanto", "costo", "pagare", "attivare", "problema", "funziona",
    "collega", "soldi", "adesso", "allora", "anche", "molto", "niente",
    "tutto", "bene", "male", "aiutare", "bisogno", "vorrei", "posso",
  ],
  fr: [
    "le", "les", "des", "du", "et", "est", "comment", "quel", "quelle",
    "quels", "quelles", "quand", "où", "oui", "merci", "bonjour",
    "salut", "je", "mon", "ma", "mes", "votre", "vos", "notre", "nos", "mot",
    "passe", "compte", "paiement", "forfait", "prix", "aide", "besoin",
    "veux", "réinitialiser", "reinitialiser", "récupérer", "recuperer",
    "annuler", "acheter", "activer", "tableau", "bord", "facturation",
    "connexion", "courriel", "temps", "réessayez", "reessayez", "contactez",
    "humain", "combien", "payer", "activer", "probleme", "problème",
    "fonctionne", "connecte", "argent", "maintenant", "donc", "aussi",
    "beaucoup", "rien", "tout", "bien", "mal", "besoin", "veux", "peux",
  ],
  de: [
    "der", "die", "das", "den", "dem", "des", "ein", "eine", "einer", "und",
    "ist", "sind", "für", "fur", "mit", "dass", "wie", "welche", "welcher",
    "wann", "wo", "warum", "ja", "nein", "danke", "hallo", "ich", "mein",
    "meine", "meiner", "dein", "ihre", "unser", "passwort", "konto", "zahlung",
    "preis", "hilfe", "brauche", "möchte", "mochte", "zurücksetzen",
    "zurucksetzen", "zurück", "zuruck", "wiederherstellen", "kündigen",
    "kundigen", "kaufen", "aktivieren", "aktivierung", "übersicht",
    "ubersicht", "karte", "rechnung", "anmeldung", "bezahlen", "zahlen",
    "problem", "funktioniert", "verbinden", "geld", "jetzt", "also", "auch",
    "viel", "nichts", "alles", "gut", "schlecht", "bitte", "soll", "will",
  ],
};

const WORD_SETS: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(STRONG_WORDS).map(([locale, words]) => [locale, new Set(words)]),
);

const LATIN_LOCALES = Object.keys(STRONG_WORDS) as Array<keyof typeof STRONG_WORDS>;

const DIACRITIC_SIGNALS: Array<[RegExp, Partial<Record<SupportedLocale, number>>]> = [
  [/[ãõ]/i, { pt: 2 }],
  [/[ñ¿¡]/i, { es: 3 }],
  [/ß/, { de: 3 }],
  [/œ/i, { fr: 3 }],
  [/[ìò]/i, { it: 2 }],
  [/ç/i, { pt: 1, fr: 1 }],
];

const GREETINGS: Record<string, SupportedLocale> = {
  hello: "en", hi: "en", hey: "en",
  "olá": "pt", ola: "pt", oi: "pt", obrigado: "pt", obrigada: "pt", sim: "pt",
  hola: "es", gracias: "es", "sí": "es",
  ciao: "it", buongiorno: "it", grazie: "it", "sì": "it",
  bonjour: "fr", salut: "fr", merci: "fr", oui: "fr",
  hallo: "de", danke: "de", ja: "de",
  "привет": "ru", "спасибо": "ru", "да": "ru",
  "你好": "zh", "谢谢": "zh", "是": "zh",
  "こんにちは": "ja", "ありがとう": "ja", "はい": "ja",
  "مرحبا": "ar", "شكرا": "ar", "نعم": "ar",
  "שלום": "he", "תודה": "he", "כן": "he",
};

const TOKEN_RE = /[\p{L}\p{M}]+/gu;
const MIN_DECISIVE_SCORE = 3;
const MIN_MARGIN = 2;

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) ?? []).filter(Boolean);
}

/**
 * A message is "short" when it is a single token of at most three characters
 * (or has no letters). These are the "ok", "lo", "hi", "sim" cases: they defer
 * to the most recent clearly detected language.
 */
export function isShortMessage(text: string): boolean {
  const tokens = tokenize(text);
  if (tokens.length === 0) return true;
  return tokens.length === 1 && tokens[0].length <= 3;
}

function scoreLatin(text: string): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const locale of LATIN_LOCALES) scores[locale] = 0;
  for (const token of tokenize(text)) {
    // Match the token and its fully-collapsed form so "ajudaaaa" counts.
    const collapsed = collapseAllRepeats(token);
    for (const locale of LATIN_LOCALES) {
      if (WORD_SETS[locale].has(token) || (collapsed !== token && WORD_SETS[locale].has(collapsed))) {
        scores[locale] += 3;
      }
    }
  }
  for (const [pattern, weights] of DIACRITIC_SIGNALS) {
    if (!pattern.test(text)) continue;
    for (const [locale, weight] of Object.entries(weights)) {
      scores[locale] = (scores[locale] ?? 0) + (weight ?? 0);
    }
  }
  return scores;
}

function ranked(scores: Record<string, number>): Array<{ locale: SupportedLocale; score: number }> {
  return (Object.entries(scores) as Array<[SupportedLocale, number]>)
    .map(([locale, score]) => ({ locale, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Detect the language of one message. Deterministic and pure.
 * Returns `locale: null` when the message carries no decisive signal.
 */
export function detectMessageLanguage(message: string): LanguageDetection {
  const text = (message ?? "").normalize("NFC").trim();
  const short = isShortMessage(text);
  if (!text) return { locale: null, confidence: 0, reason: "none", short: true };

  const script = detectScript(text);
  if (script) {
    return { locale: script, confidence: 0.95, reason: "script", short };
  }

  const tokens = tokenize(text);
  if (tokens.length === 1) {
    const greeting = GREETINGS[tokens[0]];
    if (greeting) {
      return { locale: greeting, confidence: 0.8, reason: "greeting", short };
    }
  }

  const rankedScores = ranked(scoreLatin(text));
  const top = rankedScores[0];
  const second = rankedScores[1];
  if (top && top.score >= MIN_DECISIVE_SCORE && top.score - (second?.score ?? 0) >= MIN_MARGIN) {
    const total = rankedScores.reduce((sum, entry) => sum + entry.score, 0) || 1;
    return {
      locale: top.locale,
      confidence: Math.min(0.95, 0.5 + (top.score / total) * 0.5),
      reason: "lexicon",
      short,
    };
  }

  return { locale: null, confidence: 0, reason: "none", short };
}

/** True only when a different language is confidently detected. */
export function isAnswerInLanguage(text: string, target: SupportedLocale): boolean {
  const detection = detectMessageLanguage(text);
  if (!detection.locale) return true;
  return detection.locale === target;
}

export interface ResolvedLanguage {
  locale: SupportedLocale;
  /** Where the decision came from, for observability (never user data). */
  source: "message" | "history" | "locale";
  /** Language detected in the latest message, if any. */
  detected: SupportedLocale | null;
}

function mostRecentHistoryLanguage(history: ChatTurn[]): SupportedLocale | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (turn.role !== "user") continue;
    const detection = detectMessageLanguage(turn.content);
    // A short greeting or script match is still a clear signal ("olá", "你好").
    if (detection.locale && (!detection.short || detection.confidence >= 0.8)) {
      return detection.locale;
    }
  }
  return null;
}

/**
 * Decide the reply language. The website locale is the LAST resort: a clear
 * message language always wins, even when it differs from the site locale.
 */
export function resolveResponseLanguage(input: {
  message: string;
  history: ChatTurn[];
  locale: string;
}): ResolvedLanguage {
  const website = normalizeLocale(input.locale);
  const current = detectMessageLanguage(input.message);

  if (current.locale && !current.short) {
    return { locale: current.locale, source: "message", detected: current.locale };
  }

  const recent = mostRecentHistoryLanguage(input.history);
  if (recent) {
    return { locale: recent, source: "history", detected: current.locale };
  }

  if (current.locale) {
    return { locale: current.locale, source: "message", detected: current.locale };
  }

  return { locale: website, source: "locale", detected: null };
}
