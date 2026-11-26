// ============================================================================
// Deterministic phrase matcher for the support chatbot.
//
// Turns a knowledge entry's aliases / keywords / informal questions into a
// weighted phrase index, then scores an incoming (already normalised) message
// against it. Used for two things:
//   * intent classification (which approved topic is the customer asking about)
//   * grounding retrieval (which approved articles to show / cite)
//
// Pure and bounded: every comparison is a token comparison over short strings.
// No I/O, no model call, no randomness.
// ============================================================================

import {
  CJK_RE,
  collapseRepeats,
  containsSequence,
  fuzzyTokenMatch,
  normalizeQuery,
  tokenize,
} from "./normalize.ts";

export interface Phrase {
  /** Normalised phrase. */
  text: string;
  /** Field weight: informal questions and aliases outrank broad keywords. */
  weight: number;
}

export interface IndexedEntry {
  id: string;
  phrases: Phrase[];
}

/** Field weights. Informal questions are the most precise signal. */
export const FIELD_WEIGHTS = {
  informal: 1.15,
  alias: 1,
  keyword: 0.7,
  title: 0.5,
} as const;

export function phrase(text: string, weight: number): Phrase | null {
  const normalized = normalizeQuery(text);
  return normalized ? { text: normalized, weight } : null;
}

export function compact(phrases: Array<Phrase | null>): Phrase[] {
  return phrases.filter((p): p is Phrase => Boolean(p));
}

/** Score one phrase against the normalised query. 0 means "no match". */
export function phraseScore(
  queryNorm: string,
  queryTokens: string[],
  phraseText: string,
): number {
  if (!phraseText) return 0;
  const phraseTokens = tokenize(phraseText);
  if (phraseTokens.length === 0) return 0;

  // Chinese / Japanese: no word boundaries, so containment is the signal.
  if (CJK_RE.test(phraseText)) {
    if (!queryNorm.includes(phraseText)) return 0;
    return phraseTokens.length === 1 ? 8 : 11;
  }

  const words = phraseTokens.length;
  if (containsSequence(queryTokens, phraseTokens)) {
    if (words === 1) {
      return queryTokens.length === 1 ? 11 : 7;
    }
    const base = 10 + Math.min(4, words - 2) * 1.5;
    // The whole message is exactly this phrase: strongest possible signal.
    return words === queryTokens.length ? base + 5 : base;
  }

  if (words > 1) {
    // Same words in a different order ("funciona como" for "como funciona").
    if (phraseTokens.every((t) => queryTokens.includes(t))) {
      return 6 + Math.min(2, words - 2);
    }
    return 0;
  }

  const needle = collapseRepeats(phraseTokens[0]);
  for (const token of queryTokens) {
    if (token === phraseTokens[0]) return 7;
    if (fuzzyTokenMatch(token, needle)) return 4;
    // Prefix match catches truncations ("pagamen", "ativac"). Weighted low:
    // a short real word ("conta") is also a prefix of a longer one ("contact").
    if (needle.length >= 5 && token.length >= 5 &&
      (token.startsWith(needle) || needle.startsWith(token))) {
      return 2.5;
    }
  }
  return 0;
}

/**
 * Score one entry: the strongest phrase plus a decaying bonus for additional
 * distinct matches, so several weak signals can beat one accidental one
 * without letting a long keyword list dominate.
 */
export function scoreEntry(
  queryNorm: string,
  queryTokens: string[],
  phrases: Phrase[],
): number {
  if (queryTokens.length === 0) return 0;
  const hits: number[] = [];
  const seen = new Set<string>();
  for (const p of phrases) {
    // The same phrase often appears as both an alias and a keyword; count it
    // once, otherwise a single accidental fuzzy hit can look like many signals.
    if (seen.has(p.text)) continue;
    seen.add(p.text);
    const raw = phraseScore(queryNorm, queryTokens, p.text);
    if (raw > 0) hits.push(raw * p.weight);
  }
  if (hits.length === 0) return 0;
  hits.sort((a, b) => b - a);
  let total = 0;
  for (let i = 0; i < hits.length && i < 3; i++) {
    total += hits[i] * (i === 0 ? 1 : i === 1 ? 0.45 : 0.2);
  }
  return total;
}

export interface ScoredEntry {
  id: string;
  score: number;
}

export function rankEntries(
  message: string,
  index: IndexedEntry[],
): ScoredEntry[] {
  const queryNorm = normalizeQuery(message);
  const queryTokens = tokenize(queryNorm);
  return index
    .map((entry) => ({
      id: entry.id,
      score: scoreEntry(queryNorm, queryTokens, entry.phrases),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}
