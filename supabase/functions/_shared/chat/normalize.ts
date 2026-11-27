// ============================================================================
// Text normalisation for the support chatbot.
//
// Customers write informally: no accents, abbreviations, slang, repeated
// letters, typos and mixed casing. Matching therefore happens on a normalised
// form (lower-case, accent-free, punctuation-free) with a small, curated
// abbreviation/slang expansion so "vc", "vcs", "pra", "pls" and "xq" behave
// like the words they stand for.
//
// Pure functions only: no I/O, no state, no model call, no randomness.
// ============================================================================

/** Strip combining marks so "não" == "nao" and "cómo" == "como". */
export function stripDiacritics(text: string): string {
  return (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Lower-case, accent-free, punctuation-free, single-spaced form used for every
 * comparison in this module. CJK characters are preserved so Chinese and
 * Japanese phrases still match as substrings.
 */
export function normalizeText(raw: unknown): string {
  const value = typeof raw === "string" ? raw : "";
  return stripDiacritics(value.toLowerCase())
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TOKEN_RE = /[\p{L}\p{N}]+/gu;

export function tokenize(text: string): string[] {
  return normalizeText(text).match(TOKEN_RE) ?? [];
}

// ---------------------------------------------------------------------------
// Abbreviations, slang and filler words
//
// Keyed by the normalised token. Values are either a replacement word or ""
// for pure filler ("mano", "bro", "tipo") that carries no meaning on its own.
// Only forms that are unambiguous for the language are listed: shared forms
// such as "q" are expanded to the same word in Portuguese and Spanish.
// ---------------------------------------------------------------------------

const ABBREVIATIONS: Record<string, string> = {
  // Portuguese
  vc: "voce", vcs: "voces", voce: "voce", v6: "voce",
  pq: "porque", q: "que", oq: "o que", oque: "o que",
  tb: "tambem", tbm: "tambem", tmb: "tambem",
  qto: "quanto", qnto: "quanto", qnt: "quanto",
  qnd: "quando", qdo: "quando", qd: "quando",
  dnv: "de novo", msm: "mesmo", pfv: "por favor", pfvr: "por favor",
  vlw: "obrigado", obg: "obrigado", brigado: "obrigado", brigada: "obrigado",
  blz: "beleza", tmj: "obrigado", flw: "obrigado",
  kd: "cade", cad: "cade", cade: "cade",
  vlr: "valor", pgto: "pagamento", pgmt: "pagamento", pgt: "pagamento",
  pagto: "pagamento", pgtos: "pagamentos",
  pra: "para", pro: "para", ta: "esta", tou: "estou",
  hj: "hoje", amanha: "amanha", grana: "dinheiro", trampo: "trabalho",
  eai: "oi", eae: "oi", opa: "oi", salve: "oi",
  mano: "", cara: "", tipo: "", ne: "", n: "", po: "", pow: "",
  entaum: "entao", entao: "entao",
  // English
  u: "you", ur: "your", pls: "please", plz: "please", plox: "please",
  thx: "thanks", ty: "thanks", tnx: "thanks", tyvm: "thanks",
  idk: "i dont know", im: "i am", ive: "i have", dont: "do not",
  doesnt: "does not", didnt: "did not", cant: "cannot", wont: "will not",
  whats: "what is", hows: "how is", wats: "what is", wat: "what", wut: "what",
  wanna: "want to", gonna: "going to", gotta: "got to", kinda: "kind of",
  r: "are", hw: "how", bro: "", dude: "", bruh: "", man: "",
  yeah: "yes", yep: "yes", nope: "no", kk: "ok", ok: "ok", okk: "ok",
  asap: "as soon as possible", btw: "", imo: "", afaik: "",
  // Greetings typed with a trailing vowel ("oiê", "oee")
  oie: "oi", oe: "oi", oii: "oi", oiii: "oi", eiii: "oi",
  // Spanish
  xq: "porque", xk: "porque", porq: "porque", dnd: "donde", dnde: "donde",
  cm: "como", cmo: "como", tmbn: "tambien", grax: "gracias", graxias: "gracias",
  bn: "bien", msj: "mensaje", wey: "", guey: "", neta: "",
  plata: "dinero", lana: "dinero", pasta: "dinero", feria: "dinero",
  // Italian
  xke: "perche", xche: "perche", dv: "dove", qndo: "quando",
  // French
  pk: "pourquoi", stp: "sil te plait", svp: "sil vous plait",
  bjr: "bonjour", slt: "salut", jsp: "je ne sais pas", cb: "combien",
  // German
  vllt: "vielleicht", hab: "habe",
};

/** Expand known abbreviations/slang and drop pure filler tokens. */
export function expandAbbreviations(normalized: string): string {
  const tokens = normalized.match(TOKEN_RE) ?? [];
  const out: string[] = [];
  for (const token of tokens) {
    const mapped = ABBREVIATIONS[token];
    if (mapped === undefined) {
      out.push(token);
    } else if (mapped) {
      out.push(mapped);
    }
  }
  return out.join(" ");
}

/** Normalise + expand in one step; this is the canonical query form. */
export function normalizeQuery(raw: unknown): string {
  return expandAbbreviations(normalizeText(raw));
}

/**
 * Collapse a run of three or more identical letters ("ajudaaaa" -> "ajudaa")
 * so the fuzzy matcher still sees a recognisable token.
 */
export function collapseRepeats(token: string): string {
  return token.replace(/(.)\1{2,}/g, "$1$1");
}

/** Collapse every repeated letter ("ajudaaaa" -> "ajuda"). */
export function collapseAllRepeats(token: string): string {
  return token.replace(/(.)\1+/g, "$1");
}

/**
 * Collapse an elongated run of three or more identical letters to one:
 * "hellooooo" -> "hello", "Holaaaaa" -> "hola", "Oiiiiiiiiii" -> "oi".
 *
 * Only runs of 3+ are touched, so meaningful double letters ("posso",
 * "assim", "llamar") survive. Used for conversational matching (greetings,
 * intents), never to rewrite a knowledge phrase.
 */
export function collapseElongations(text: string): string {
  return (text ?? "").replace(/(\p{L})\1{2,}/gu, "$1");
}

/**
 * Elongation-tolerant query form: lower-case, accent-free, punctuation-free,
 * elongated letters collapsed, abbreviations expanded. This is what the
 * conversational layer compares, so "Hellooooo" and "hello" are the same.
 */
export function normalizeElongated(raw: unknown): string {
  const value = typeof raw === "string" ? raw : "";
  return expandAbbreviations(collapseElongations(normalizeText(value)));
}

/** Emoji that clearly greet. A wave/smiley on its own means "hello". */
const GREETING_EMOJI =
  /[\u{1F44B}\u{1F64B}\u{1F91D}\u{1F44D}\u{1F60A}\u{1F600}-\u{1F604}\u{1F642}\u{1F609}\u{1F60D}\u{1F970}]/u;
const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

/**
 * True when the message is emoji-only (or emoji plus punctuation) and at least
 * one of the emoji clearly greets: "👋", "👋👋", "😊🙋". A message with real
 * words is never an emoji greeting.
 */
export function isEmojiGreeting(raw: unknown): boolean {
  const text = typeof raw === "string" ? raw : "";
  if (!text.trim() || !PICTOGRAPHIC.test(text)) return false;
  const letters = text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\s\p{P}\p{S}\p{N}]/gu, "");
  return letters.length === 0 && GREETING_EMOJI.test(text);
}

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/**
 * True when a token looks like a keyboard mash rather than a word: a run of
 * the same letter ("aaaa"), a token with no vowel, or a keyboard row sequence
 * ("asdfg"). Used to treat the message as unclear instead of off-topic.
 */
export function isKeyboardMash(raw: unknown): boolean {
  const tokens = tokenize(normalizeText(raw));
  if (tokens.length === 0) return false;
  return tokens.some((token) => {
    if (token.length < 3) return false;
    if (/(.)\1{3,}/.test(token)) return true;
    // Vowel-less detection is Latin-only: Cyrillic, Arabic, Hebrew and CJK
    // tokens have no Latin vowels and are real words, not mashing.
    if (/^[a-z]+$/i.test(token) && !/[aeiouy]/i.test(token) && token.length >= 4) return true;
    return KEYBOARD_ROWS.some(
      (row) => token.length >= 4 && (row.includes(token) || token.includes(row.slice(0, 4))),
    );
  });
}

// ---------------------------------------------------------------------------
// Edit distance (Damerau-Levenshtein, bounded)
// ---------------------------------------------------------------------------

/**
 * Damerau-Levenshtein distance with an early exit once `max` is exceeded.
 * Bounded work: inputs are short tokens, never full messages.
 */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prevPrev: number[] = [];
  let prev: number[] = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    const current: number[] = [i];
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        prev[j] + 1,
        current[j - 1] + 1,
        prev[j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2] + 1);
      }
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    prevPrev = prev;
    prev = current;
  }
  return prev[b.length];
}

/**
 * True when two tokens are "the same word, typed differently". Long words
 * tolerate more edits than short ones, which keeps "plan"/"plane" together
 * while never merging three-letter words such as "kyc" or "pix".
 */
export function fuzzyTokenMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const short = collapseRepeats(a);
  const other = collapseRepeats(b);
  if (short === other) return true;
  const minLen = Math.min(short.length, other.length);
  if (minLen < 4) return false;
  // A typo almost never changes the first letter; requiring it keeps unrelated
  // short words ("marte" / "karte") apart.
  if (short[0] !== other[0]) return false;
  const allowed = minLen >= 9 ? 2 : 1;
  if (Math.abs(short.length - other.length) > allowed) return false;
  return editDistance(short, other, allowed) <= allowed;
}

/** Word-ish sequence test used for multi-word phrases. */
export function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let ok = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/** CJK text has no spaces, so phrase matching is plain substring containment. */
export const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
