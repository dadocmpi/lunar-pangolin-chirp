// ============================================================================
// Deterministic conversation-context compaction for the support chatbot.
//
// The conversation is stateless: the browser sends the visible turns with each
// request and the server stores nothing. This module decides how much of that
// conversation is kept and what must survive when it does not all fit.
//
// Compaction is deterministic (no model, no randomness) and preserves, in this
// order of priority:
//   1. the latest user turn (the current message is always kept separately);
//   2. the latest relevant topic;
//   3. the previous assistant answer;
//   4. the customer's language;
//   5. unresolved questions;
//   6. the earlier turns needed to resolve references ("isso", "aquele",
//      "e agora?", "já fiz").
//
// Every retained turn is secret-redacted and length-capped, so no password,
// key, card-like number or token reaches the provider. Nothing here logs or
// stores message content.
// ============================================================================

import {
  AMBIGUITY_MARGIN,
  contextIntentFromHistory,
  HIGH_CONFIDENCE_SCORE,
  isReferential,
  MIN_INTENT_SCORE,
} from "./intent.ts";
import { KNOWLEDGE_INDEX } from "./knowledge.ts";
import { detectMessageLanguage, type SupportedLocale } from "./language.ts";
import { rankEntries } from "./match.ts";
import { normalizeQuery } from "./normalize.ts";
import { redactSecrets } from "./policy.ts";
import {
  MAX_HISTORY_CHARS,
  MAX_HISTORY_TURNS,
  MAX_HISTORY_TURN_CHARS,
  type ChatTurn,
} from "./types.ts";

export interface CompactOptions {
  maxTurns?: number;
  maxChars?: number;
  maxTurnChars?: number;
}

export interface CompactedHistory {
  /** Retained turns, in their original order and role. */
  turns: ChatTurn[];
  /** True when at least one turn was dropped. */
  truncated: boolean;
  droppedTurns: number;
  /** Approved topic ids retained in the context, strongest first. */
  topics: string[];
  /** True when a retained customer question has no later assistant answer. */
  hasOpenQuestion: boolean;
  /** Most recent language the customer used in the retained context. */
  language: SupportedLocale | null;
}

function cleanTurn(turn: ChatTurn, maxTurnChars: number): ChatTurn | null {
  if (turn.role !== "user" && turn.role !== "assistant") return null;
  const content = redactSecrets(turn.content).trim().slice(0, maxTurnChars).trim();
  return content ? { role: turn.role, content } : null;
}

/** The unambiguous approved topic of one turn, or null. */
function turnTopic(content: string): string | null {
  const ranked = rankEntries(content, KNOWLEDGE_INDEX);
  const top = ranked[0];
  if (!top || top.score < MIN_INTENT_SCORE) return null;
  const second = ranked[1];
  if (
    second && top.score < HIGH_CONFIDENCE_SCORE &&
    top.score - second.score < AMBIGUITY_MARGIN
  ) {
    return null;
  }
  return top.id;
}

function isQuestion(content: string): boolean {
  return /[?¿؟]/.test(content);
}

function lastIndexWhere(turns: ChatTurn[], predicate: (turn: ChatTurn) => boolean): number {
  for (let i = turns.length - 1; i >= 0; i--) {
    if (predicate(turns[i])) return i;
  }
  return -1;
}

function historyLanguage(turns: ChatTurn[]): SupportedLocale | null {
  for (let i = turns.length - 1; i >= 0; i--) {
    const turn = turns[i];
    if (turn.role !== "user") continue;
    const detection = detectMessageLanguage(turn.content);
    if (detection.locale && (!detection.short || detection.confidence >= 0.8)) {
      return detection.locale;
    }
  }
  return null;
}

/**
 * Indices that must survive compaction even when the budget is exceeded.
 * These are the turns a follow-up depends on: the last exchange, the topic in
 * play, the customer's language, an open question and any reference anchor.
 */
function pinnedIndices(turns: ChatTurn[]): Set<number> {
  const pinned = new Set<number>();
  const add = (index: number) => {
    if (index >= 0) pinned.add(index);
  };

  add(lastIndexWhere(turns, (t) => t.role === "user"));
  add(lastIndexWhere(turns, (t) => t.role === "assistant"));
  add(lastIndexWhere(turns, (t) => turnTopic(t.content) !== null));
  add(lastIndexWhere(turns, (t) => t.role === "user" && isQuestion(t.content)));
  add(
    lastIndexWhere(
      turns,
      (t) => t.role === "user" && Boolean(detectMessageLanguage(t.content).locale),
    ),
  );

  const reference = lastIndexWhere(turns, (t) => isReferential(normalizeQuery(t.content)));
  if (reference >= 0) {
    pinned.add(reference);
    // A reference points at the turn before it; keep the anchor too.
    if (reference > 0) pinned.add(reference - 1);
  }
  return pinned;
}

/**
 * Compact a conversation into the context budget. Pure and deterministic.
 * Returns the retained turns in their original order, plus the topic list used
 * to summarise the conversation to the model.
 */
export function compactHistory(
  history: ChatTurn[],
  options: CompactOptions = {},
): CompactedHistory {
  const maxTurns = Math.max(1, options.maxTurns ?? MAX_HISTORY_TURNS);
  const maxChars = Math.max(1, options.maxChars ?? MAX_HISTORY_CHARS);
  const maxTurnChars = Math.max(1, options.maxTurnChars ?? MAX_HISTORY_TURN_CHARS);

  const turns = history
    .map((turn) => cleanTurn(turn, maxTurnChars))
    .filter((turn): turn is ChatTurn => Boolean(turn));

  if (turns.length === 0) {
    return {
      turns: [],
      truncated: false,
      droppedTurns: 0,
      topics: [],
      hasOpenQuestion: false,
      language: null,
    };
  }

  const pinned = pinnedIndices(turns);
  const keep = new Set<number>(pinned);
  let chars = 0;
  let count = 0;
  for (const index of pinned) {
    chars += turns[index].content.length;
    count++;
  }

  // Fill the remaining budget newest-first, so the most recent exchange is
  // kept in full and older turns are the ones that get dropped.
  for (let i = turns.length - 1; i >= 0; i--) {
    if (keep.has(i)) continue;
    const length = turns[i].content.length;
    if (count + 1 > maxTurns || chars + length > maxChars) break;
    keep.add(i);
    chars += length;
    count++;
  }

  const retained = turns.filter((_, index) => keep.has(index));

  const topics: string[] = [];
  const contextTopic = contextIntentFromHistory(retained);
  if (contextTopic) topics.push(contextTopic);
  for (const turn of retained) {
    const topic = turnTopic(turn.content);
    if (topic && !topics.includes(topic)) topics.push(topic);
  }

  const lastQuestion = lastIndexWhere(
    retained,
    (turn) => turn.role === "user" && isQuestion(turn.content),
  );
  const answered = lastQuestion >= 0 &&
    retained.slice(lastQuestion + 1).some((turn) => turn.role === "assistant");

  return {
    turns: retained,
    truncated: retained.length < turns.length,
    droppedTurns: turns.length - retained.length,
    topics: topics.slice(0, 4),
    hasOpenQuestion: lastQuestion >= 0 && !answered,
    language: historyLanguage(retained),
  };
}

/**
 * Human-readable list of retained topic ids for the system prompt. Topic ids
 * only: no customer text, no secrets.
 */
export function contextTopicsLine(compacted: CompactedHistory): string {
  return compacted.topics.length ? compacted.topics.join(", ") : "none";
}
