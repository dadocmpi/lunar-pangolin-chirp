import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ExternalLink,
  Headset,
  Loader2,
  Mail,
  Minus,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT_EMAIL } from "@/lib/support";
import {
  sendChatMessage,
  type ChatEscalation,
  type ChatRefusalReason,
  type ChatReplyType,
  type ChatSendError,
  type ChatSource,
  type ChatTurn,
} from "@/lib/supportChat";

interface ChatMessage extends ChatTurn {
  id: string;
  type?: ChatReplyType;
  reason?: ChatRefusalReason;
  sources?: ChatSource[];
  escalation?: ChatEscalation | null;
  /** Approved topic ids from the server, used for follow-up suggestions. */
  articleIds?: string[];
}

const MAX_INPUT = 2000;

let seq = 0;
const nextId = () => `m-${Date.now()}-${seq++}`;

const ERROR_KEY: Record<ChatSendError, string> = {
  not_configured: "chatbot.errorNotConfigured",
  rate_limited: "chatbot.errorRateLimited",
  disabled: "chatbot.errorDisabled",
  timeout: "chatbot.errorTimeout",
  unavailable: "chatbot.errorUnavailable",
  invalid_message: "chatbot.errorInvalidMessage",
};

const CATEGORY_KEY: Record<string, string> = {
  payment_dispute: "chatbot.category.payment_dispute",
  kyc: "chatbot.category.kyc",
  account_suspension: "chatbot.category.account_suspension",
  legal: "chatbot.category.legal",
  provider_problem: "chatbot.category.provider_problem",
  refund: "chatbot.category.refund",
  human_request: "chatbot.category.human_request",
};

const SUGGESTION_KEYS = [
  "chatbot.suggestions.password",
  "chatbot.suggestions.plans",
  "chatbot.suggestions.payment",
  "chatbot.suggestions.activation",
];

const SUGGESTION_BY_TOPIC: Record<string, string[]> = {
  getting_started: ["plans", "payment", "activation"],
  how_it_works: ["plans", "payment", "activation"],
  plans: ["plans", "payment", "activation"],
  checkout: ["payment", "plans", "activation"],
  payment_methods: ["payment", "plans", "activation"],
  card_payment: ["payment", "plans", "activation"],
  crypto_payment: ["payment", "plans", "activation"],
  bank_transfer: ["payment", "plans", "activation"],
  payment_status: ["payment", "activation"],
  payment_failures: ["payment", "activation"],
  onboarding: ["activation", "payment", "plans"],
  activation: ["activation", "payment", "plans"],
  account_creation: ["password", "plans", "payment"],
  profile_and_signup: ["plans", "payment"],
  email_confirmation: ["password", "plans"],
  password_recovery: ["password", "plans"],
  login_problem: ["password", "plans"],
  dashboard_usage: ["activation", "payment", "plans"],
  tradovate_connection: ["activation", "payment"],
  read_only_limits: ["activation", "plans"],
  support_procedures: ["plans", "payment", "activation"],
  company_overview: ["plans", "payment"],
  benefits_and_features: ["plans", "payment"],
  requirements_and_eligibility: ["plans", "activation"],
};

/** Follow-up questions for the topic of the latest answer. */
function followUpSuggestionKeys(articleIds: string[] | undefined): string[] {
  if (!articleIds || articleIds.length === 0) return [];
  const keys: string[] = [];
  for (const id of articleIds) {
    for (const key of SUGGESTION_BY_TOPIC[id] ?? []) {
      if (!keys.includes(key)) keys.push(key);
    }
  }
  return keys.slice(0, 3).map((key) => `chatbot.suggestions.${key}`);
}

const SupportChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ code: ChatSendError; reply?: string } | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [showHumanCard, setShowHumanCard] = useState(false);
  // The short greeting is shown once per chat session: on the first open, or
  // after a clear. Closing, minimizing and reopening never repeats it.
  const [greetingVisible, setGreetingVisible] = useState(false);
  const greetingShownRef = useRef(false);

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, error]);

  const history = useMemo<ChatTurn[]>(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    if (!greetingShownRef.current && messages.length === 0) {
      greetingShownRef.current = true;
      setGreetingVisible(true);
    }
  }, [messages.length]);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
    setShowHumanCard(false);
    setGreetingVisible(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT);
      if (!text || isLoading) return;
      setError(null);
      setShowHumanCard(false);
      setGreetingVisible(false);
      setLastSent(text);
      setMessages((prev) => [...prev, { id: nextId(), role: "user", content: text }]);
      setInputValue("");
      setIsLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;

      const result = await sendChatMessage({
        message: text,
        history,
        locale: i18n.language || "en",
        signal: controller.signal,
      });
      if (requestId !== requestIdRef.current) return;

      setIsLoading(false);
      if ("error" in result) {
        setError({ code: result.error, reply: result.reply });
        return;
      }
      const reply = result.reply;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: reply.reply,
          type: reply.type,
          reason: reply.reason,
          sources: reply.sources,
          escalation: reply.escalation,
          articleIds: reply.articleIds,
        },
      ]);
    },
    [history, i18n.language, isLoading],
  );

  const handleRetry = () => {
    if (lastSent) send(lastSent);
  };

  const handleClear = () => {
    requestIdRef.current++;
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLastSent(null);
    setIsLoading(false);
    setShowHumanCard(false);
    // A cleared chat is a new session: the greeting may be shown once more.
    greetingShownRef.current = false;
    setGreetingVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") close();
  };

  const hasConversation = messages.length > 0;

  const followUpKeys = useMemo(() => {
    if (isLoading || error) return [];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role !== "assistant") continue;
      return followUpSuggestionKeys(messages[i].articleIds);
    }
    return [];
  }, [messages, isLoading, error]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? close() : openChat())}
        aria-label={isOpen ? t("chatbot.close") : t("chatbot.openChat")}
        aria-expanded={isOpen}
        aria-controls="braxel-support-panel"
        data-open={isOpen}
        className={cn(
          "group fixed bottom-5 end-4 z-[999] flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-all duration-200",
          "motion-reduce:transition-none motion-reduce:transform-none",
          "hover:scale-[1.04] active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A]",
          isOpen
            ? "border-[#D4AF37]/60 bg-[#05070A] text-[#D4AF37]"
            : "border-[#D4AF37] bg-[#D4AF37] text-black hover:bg-[#C9A227]",
          isOpen ? "hidden sm:flex" : "flex",
          "sm:bottom-6 sm:end-6",
        )}
      >
        {isOpen ? (
          <X size={22} aria-hidden="true" />
        ) : (
          <Headset size={24} aria-hidden="true" />
        )}
        {!isOpen && !hasConversation && (
          <span
            className="absolute -top-0.5 -end-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#05070A] bg-red-500 motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
        {!isOpen && !hasConversation && (
          <span className="sr-only">{t("chatbot.helpBadge")}</span>
        )}
      </button>

      {isOpen && (
        <div
          id="braxel-support-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="braxel-chatbot-title"
          onKeyDown={handleKeyDown}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[998] flex max-h-[90dvh] flex-col overflow-hidden border border-white/10 bg-[#05070A] shadow-[0_30px_80px_rgba(0,0,0,0.75)]",
            "rounded-t-lg pb-[env(safe-area-inset-bottom)]",
            "sm:inset-x-auto sm:bottom-24 sm:end-6 sm:h-[640px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-lg sm:pb-0",
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-[#0a0e27] to-[#0f1430] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
                aria-hidden="true"
              >
                <Headset size={17} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500">
                  {t("chatbot.brandName")}
                </p>
                <h2
                  id="braxel-chatbot-title"
                  className="truncate text-[13px] font-bold tracking-tight text-white"
                >
                  {t("chatbot.title")}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                    aria-hidden="true"
                  />
                  {t("chatbot.online")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleClear}
                aria-label={t("chatbot.clear")}
                className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized((v) => !v)}
                aria-label={isMinimized ? t("chatbot.maximize") : t("chatbot.minimize")}
                aria-expanded={!isMinimized}
                className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
              >
                {isMinimized ? <Plus size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={t("chatbot.close")}
                className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div
                role="log"
                aria-live="polite"
                aria-label={t("chatbot.messagesLabel")}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#05070A] px-4 py-4"
              >
                <div className="border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] p-3">
                  {greetingVisible && !hasConversation && (
                    <p
                      data-chatbot-greeting="visible"
                      className="text-[10px] leading-relaxed text-slate-300"
                    >
                      {t("chatbot.greeting")}
                    </p>
                  )}
                  <p
                    className={cn(
                      "flex items-start gap-1.5 text-[9px] leading-relaxed text-slate-500",
                      greetingVisible && !hasConversation && "mt-2",
                    )}
                  >
                    <ShieldAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {t("chatbot.aiDisclosure")}
                  </p>
                </div>

                {!hasConversation && (
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      {t("chatbot.suggestionsTitle")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SUGGESTION_KEYS.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => send(t(key))}
                          className="border border-white/10 bg-white/[0.03] px-3 py-2 text-start text-[10px] leading-snug text-slate-300 transition-colors hover:border-[#D4AF37]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
                        >
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-2.5", message.role === "user" && "flex-row-reverse")}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        message.role === "user"
                          ? "border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#D4AF37]"
                          : "border-white/10 bg-white/5 text-slate-300",
                      )}
                      aria-hidden="true"
                    >
                      {message.role === "user" ? <User size={13} /> : <Headset size={13} />}
                    </span>
                    <div
                      className={cn(
                        "min-w-0 max-w-[85%] space-y-2",
                        message.role === "user" && "text-end",
                      )}
                    >
                      <p className="sr-only">
                        {message.role === "user" ? t("chatbot.you") : t("chatbot.assistant")}
                      </p>
                      <div
                        className={cn(
                          "inline-block whitespace-pre-line px-3.5 py-2.5 text-[11px] leading-relaxed",
                          message.role === "user"
                            ? "rounded-2xl rounded-te-sm bg-[#D4AF37] text-black"
                            : message.type === "error" || message.type === "timeout"
                              ? "rounded-2xl rounded-ts-sm border border-red-500/30 bg-red-500/10 text-slate-200"
                              : "rounded-2xl rounded-ts-sm border border-white/5 bg-white/5 text-slate-300",
                        )}
                      >
                        {message.content}
                      </div>

                      {message.role === "assistant" && message.type === "unknown" && (
                        <div className="border border-white/10 bg-white/[0.03] p-3 text-start">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {t("chatbot.unknownTitle")}
                          </p>
                          <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="mt-2 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                          >
                            <Mail size={12} aria-hidden="true" />
                            {t("chatbot.handoffCta")}
                          </a>
                        </div>
                      )}

                      {message.role === "assistant" && message.type === "escalated" && message.escalation && (
                        <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] p-3 text-start">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                            {t("chatbot.handoffTitle")}
                          </p>
                          {message.escalation.category && (
                            <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-slate-500">
                              {t(CATEGORY_KEY[message.escalation.category] ?? "chatbot.category.human_request")}
                            </p>
                          )}
                          <a
                            href={`mailto:${message.escalation.email}`}
                            className="mt-3 inline-flex items-center gap-2 bg-[#D4AF37] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                          >
                            <Mail size={12} aria-hidden="true" />
                            {t("chatbot.handoffCta")}
                          </a>
                          <p className="mt-2 break-all text-[9px] text-slate-500">
                            {t("chatbot.handoffEmailLabel")} {message.escalation.email}
                          </p>
                        </div>
                      )}

                      {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                        <div className="text-start">
                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            {t("chatbot.sourcesTitle")}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {message.sources.map((source) => (
                              <li key={source.url}>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[9px] text-[#D4AF37] underline decoration-[#D4AF37]/30 underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                                >
                                  {source.title}
                                  <ExternalLink size={9} aria-hidden="true" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {followUpKeys.length > 0 && (
                  <div data-chatbot-followups="visible">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      {t("chatbot.suggestionsTitle")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {followUpKeys.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => send(t(key))}
                          className="border border-white/10 bg-white/[0.03] px-3 py-2 text-start text-[10px] leading-snug text-slate-300 transition-colors hover:border-[#D4AF37]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
                        >
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300">
                      <Headset size={13} aria-hidden="true" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 border border-white/5 bg-white/5 px-3.5 py-2.5">
                      <span className="sr-only">{t("chatbot.thinking")}</span>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] motion-safe:animate-bounce motion-reduce:animate-none"
                          style={{ animationDelay: `${i * 120}ms` }}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                  </div>
                )}

                {showHumanCard && (
                  <div className="border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] p-3 text-start">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      {t("chatbot.humanHandoffTitle")}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                      {t("chatbot.humanHandoffBody")}
                    </p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="mt-3 inline-flex items-center gap-2 bg-[#D4AF37] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                    >
                      <Mail size={12} aria-hidden="true" />
                      {t("chatbot.handoffCta")}
                    </a>
                    <p className="mt-2 break-all text-[9px] text-slate-500">
                      {t("chatbot.handoffEmailLabel")} {SUPPORT_EMAIL}
                    </p>
                  </div>
                )}

                {error && (
                  <div role="alert" className="border border-red-500/30 bg-red-500/10 p-3">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-300">
                      <AlertCircle size={13} aria-hidden="true" />
                      {t("chatbot.errorTitle")}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                      {error.reply ?? t(ERROR_KEY[error.code])}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-2 inline-flex items-center gap-2 border border-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                    >
                      <Loader2 size={11} aria-hidden="true" />
                      {t("chatbot.errorRetry")}
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/5 bg-[#0a0e27] p-3">
                <label htmlFor="braxel-chatbot-input" className="sr-only">
                  {t("chatbot.inputLabel")}
                </label>
                <div className="flex items-end gap-2">
                  <textarea
                    id="braxel-chatbot-input"
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.slice(0, MAX_INPUT))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(inputValue);
                      }
                    }}
                    rows={1}
                    maxLength={MAX_INPUT}
                    placeholder={t("chatbot.placeholder")}
                    aria-label={t("chatbot.inputLabel")}
                    className="max-h-24 min-h-[40px] flex-1 resize-none border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] text-white outline-none placeholder:text-slate-600 focus:border-[#D4AF37] focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => send(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    aria-label={t("chatbot.send")}
                    className="flex h-10 items-center gap-2 bg-[#D4AF37] px-3 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                      <Send size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHumanCard((v) => !v)}
                    aria-expanded={showHumanCard}
                    className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D4AF37] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] motion-reduce:transition-none"
                  >
                    <Headset size={12} aria-hidden="true" />
                    {t("chatbot.talkToHuman")}
                  </button>
                </div>

                <p className="mt-2 text-center text-[8px] leading-relaxed text-slate-600">
                  {t("chatbot.disclaimer")}
                </p>
                <p className="mt-1 text-center text-[8px] leading-relaxed text-slate-600">
                  {t("chatbot.privacyNote")}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatbot;
