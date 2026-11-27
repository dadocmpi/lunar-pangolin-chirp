// ============================================================================
// Response strategy for the support chatbot.
//
// Once the message has been understood (state.ts + intent.ts + conversation.ts)
// the assistant still has to choose HOW to answer: empathy, a simpler
// explanation, a repeat, the cheapest plan, a plan comparison, a contextual
// follow-up, or the approved article itself. This module makes that choice
// deterministic and grounds every strategy in approved data.
//
// Prices and plan names come from the canonical server plan table only. A
// strategy never invents a fact, never promises an outcome and never asks for a
// secret.
//
// Pure functions: no I/O, no model call, no storage.
// ============================================================================

import { PLANS, PLAN_IDS, type PlanId } from "../plans.ts";
import { localizedAnswer, planSummary } from "./answers.ts";
import { relatedArticles } from "./knowledge.ts";
import type { ConversationResult } from "./conversation.ts";
import type { IntentResult } from "./intent.ts";
import type { SupportedLocale } from "./language.ts";
import type { ConversationState } from "./state.ts";
import { strategyReplyText } from "./strategyReplies.ts";
import type { ChatTurn } from "./types.ts";

export const RESPONSE_STRATEGIES = [
  "empathy",
  "simplify",
  "repeat",
  "cheapest_plan",
  "plan_detail",
  "plan_comparison",
  "plan_recommendation",
  "follow_up",
  "topic_change",
] as const;

export type ResponseStrategy = (typeof RESPONSE_STRATEGIES)[number];

export interface StrategyInput {
  locale: SupportedLocale;
  state: ConversationState;
  intent: IntentResult;
  conv: ConversationResult;
  history: ChatTurn[];
}

export interface StrategyAnswer {
  strategy: ResponseStrategy;
  text: string;
  /** Approved topics that ground the answer. */
  topicIds: string[];
}

/** Cheapest plan by the canonical price table. Never hard-coded. */
export function cheapestPlan(): { id: PlanId; name: string; priceCents: number; capitalUsd: number } {
  let best = PLAN_IDS[0];
  for (const id of PLAN_IDS) {
    if (PLANS[id].priceCents < PLANS[best].priceCents) best = id;
  }
  const plan = PLANS[best];
  return {
    id: best,
    name: plan.name,
    priceCents: plan.priceCents,
    capitalUsd: plan.managedCapitalUsd,
  };
}

export function fillPlanPlaceholders(
  text: string,
  plan = cheapestPlan(),
): string {
  return text
    .split("{{plan}}").join(plan.name)
    .split("{{price}}").join(`$${(plan.priceCents / 100).toFixed(2)}`)
    .split("{{capital}}").join(plan.capitalUsd.toLocaleString("en-US"))
    .split("{{plans}}").join(planSummary());
}

function lastAssistantAnswer(history: ChatTurn[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "assistant" && history[i].content.trim()) {
      return history[i].content.trim();
    }
  }
  return null;
}

/**
 * The approved answer for a topic, expanded with its related approved answers
 * when the customer asked for more detail. Returns null when the topic has no
 * localized answer, so the caller can ask one clarifying question instead.
 */
function expandedAnswer(
  locale: SupportedLocale,
  topic: string | null,
  history: ChatTurn[],
): { text: string; topicIds: string[] } | null {
  if (!topic) return null;
  const primary = localizedAnswer(locale, topic);
  if (!primary) return null;
  const previous = lastAssistantAnswer(history);
  const parts = [primary];
  const ids = [topic];
  for (const article of relatedArticles(topic, undefined, 3)) {
    const text = localizedAnswer(locale, article.id);
    if (!text || text === previous || parts.includes(text)) continue;
    parts.push(text);
    ids.push(article.id);
  }
  return { text: parts.join("\n\n"), topicIds: ids };
}

/** Choose the strategy that fits this message and conversation state. */
export function selectStrategy(input: StrategyInput): ResponseStrategy | null {
  const { conv, state } = input;
  // "the second one" after a plan list answers that specific canonical plan.
  if (conv.followUp === "which_plan" && state.planId) return "plan_detail";
  switch (conv.intent) {
    case "frustration":
      return "empathy";
    case "confusion":
    case "simpler_explanation":
    case "more_detail":
      return "simplify";
    case "repeat":
      return "repeat";
    case "cheapest_plan":
      return "cheapest_plan";
    case "plan_comparison":
      return "plan_comparison";
    case "plan_recommendation":
      return "plan_recommendation";
    case "follow_up":
    case "contextual_reference":
      return "follow_up";
    case "topic_change":
      return "topic_change";
    default:
      break;
  }
  // A frustrated customer with no matched topic still gets empathy, never a
  // generic refusal.
  if (state.frustrated && !input.intent.primary) return "empathy";
  return null;
}

/** Build the grounded text for a strategy, or null when it cannot answer. */
export function strategyAnswer(input: StrategyInput): StrategyAnswer | null {
  const strategy = selectStrategy(input);
  if (!strategy) return null;
  const { locale, state, conv } = input;
  const topic = state.activeTopic ?? conv.topic;

  switch (strategy) {
    case "empathy":
      return {
        strategy,
        text: strategyReplyText(locale, "frustration"),
        topicIds: ["support_procedures"],
      };
    case "simplify": {
      // No topic in play yet ("explain everything simply") -> explain the
      // documented process rather than refusing.
      const answer = expandedAnswer(locale, topic ?? "getting_started", input.history);
      if (!answer) return null;
      const prefix = strategyReplyText(locale, "simplifyPrefix");
      return {
        strategy,
        text: `${prefix} ${answer.text}`,
        topicIds: answer.topicIds,
      };
    }
    case "repeat": {
      const previous = lastAssistantAnswer(input.history);
      if (!previous) return null;
      return {
        strategy,
        text: previous,
        topicIds: state.lastAnswerTopic ? [state.lastAnswerTopic] : [],
      };
    }
    case "cheapest_plan":
      return {
        strategy,
        text: fillPlanPlaceholders(strategyReplyText(locale, "cheapestPlan")),
        topicIds: ["plans"],
      };
    case "plan_detail": {
      const plan = state.planId && PLANS[state.planId as PlanId]
        ? PLANS[state.planId as PlanId]
        : null;
      if (!plan) return null;
      return {
        strategy,
        text: fillPlanPlaceholders(strategyReplyText(locale, "planDetail"), {
          id: plan.id,
          name: plan.name,
          priceCents: plan.priceCents,
          capitalUsd: plan.managedCapitalUsd,
        }),
        topicIds: ["plans"],
      };
    }
    case "plan_comparison":
      return {
        strategy,
        text: fillPlanPlaceholders(strategyReplyText(locale, "planComparison")),
        topicIds: ["plans"],
      };
    case "plan_recommendation":
      return {
        strategy,
        text: fillPlanPlaceholders(strategyReplyText(locale, "planRecommendation")),
        topicIds: ["plans"],
      };
    case "follow_up": {
      // A bare reference or "and then?" answers the topic in play directly.
      // Only an explicit "explain more" expands it with related detail.
      const text = localizedAnswer(locale, topic ?? "");
      if (!text) return null;
      if (text === lastAssistantAnswer(input.history)) {
        const expanded = expandedAnswer(locale, topic, input.history);
        if (expanded) return { strategy, text: expanded.text, topicIds: expanded.topicIds };
      }
      return { strategy, text, topicIds: [topic as string] };
    }
    case "topic_change":
      return {
        strategy,
        text: strategyReplyText(locale, "topicChange"),
        topicIds: [],
      };
    default:
      return null;
  }
}
