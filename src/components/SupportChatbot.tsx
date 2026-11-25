import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Bot,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
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

const REFUSAL_KEY: Record<ChatRefusalReason, string> = {
  advice: "chatbot.refusal.advice",
  secret: "chatbot.refusal.secret",
  injection: "chatbot.refusal.injection",
  promise: "chatbot.refusal.promise",
};

const SupportChatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatSendError | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);

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

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT);
      if (!text || isLoading) return;
      setError(null);
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
        setError(result.error);
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("chatbot.openChat")}
        aria-expanded={false}
        className="fixed bottom-5 end-4 z-[999] flex items-center gap-3 bg-[#D4AF37] px-5 py-4 text-black shadow-[0_18px_40px_rgba(0,0,0,0.55)] transition-all hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-8 sm:end-8"
      >
        <MessageSquare size={18} aria-hidden="true" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {t("chatbot.openChat")}
        </span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="braxel-chatbot-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-x-3 bottom-3 z-[999] flex max-h-[78vh] flex-col overflow-hidden border border-white/10 bg-[#05070A] shadow-[0_30px_80px_rgba(0,0,0,0.75)] sm:inset-x-auto sm:bottom-8 sm:end-8 sm:h-[620px] sm:max-h-[calc(100vh-4rem)] sm:w-[420px]"
    >
      <header className="flex items-start justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-[#0a0e27] to-[#0f1430] px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
              <Bot size={14} aria-hidden="true" />
            </span>
            <h2
              id="braxel-chatbot-title"
              className="truncate text-[11px] font-bold uppercase tracking-widest text-white"
            >
              {t("chatbot.title")}
            </h2>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />
            {t("chatbot.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            aria-label={t("chatbot.clear")}
            className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized((v) => !v)}
            aria-label={isMinimized ? t("chatbot.maximize") : t("chatbot.minimize")}
            className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            {isMinimized ? <Plus size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            aria-label={t("chatbot.close")}
            className="p-2 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
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
            className="flex-1 space-y-4 overflow-y-auto bg-[#05070A] px-4 py-4"
          >
            <div className="border border-[#D4AF37]/20 bg-[#D4AF37]/[0.04] p-3">
              <p className="text-[10px] leading-relaxed text-slate-300">{t("chatbot.greeting")}</p>
              <p className="mt-2 flex items-start gap-1.5 text-[9px] leading-relaxed text-slate-500">
                <ShieldAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                {t("chatbot.aiDisclosure")}
              </p>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2.5", message.role === "user" && "flex-row-reverse")}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border",
                    message.role === "user"
                      ? "border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#D4AF37]"
                      : "border-white/10 bg-white/5 text-slate-300",
                  )}
                  aria-hidden="true"
                >
                  {message.role === "user" ? <User size={13} /> : <Bot size={13} />}
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
                        ? "bg-[#D4AF37] text-black"
                        : "border border-white/5 bg-white/5 text-slate-300",
                    )}
                  >
                    {message.role === "assistant" && message.type === "unknown"
                      ? t("chatbot.unknownBody")
                      : message.role === "assistant" && message.type === "refused" && message.reason
                        ? t(REFUSAL_KEY[message.reason])
                        : message.content}
                  </div>

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
                      <p className="mt-2 text-[10px] leading-relaxed text-slate-300">
                        {t("chatbot.handoffBody")}
                      </p>
                      <a
                        href={`mailto:${message.escalation.email}`}
                        className="mt-3 inline-flex items-center gap-2 bg-[#D4AF37] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Mail size={12} aria-hidden="true" />
                        {t("chatbot.handoffCta")}
                      </a>
                      <p className="mt-2 break-all text-[9px] text-slate-500">
                        {t("chatbot.handoffEmailLabel")} {message.escalation.email}
                      </p>
                    </div>
                  )}

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

            {isLoading && (
              <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                <span className="flex h-7 w-7 items-center justify-center border border-white/10 bg-white/5 text-slate-300">
                  <Bot size={13} aria-hidden="true" />
                </span>
                <span className="inline-flex items-center gap-1.5 border border-white/5 bg-white/5 px-3.5 py-2.5">
                  <span className="sr-only">{t("chatbot.thinking")}</span>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D4AF37]"
                      style={{ animationDelay: `${i * 120}ms` }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </div>
            )}

            {error && (
              <div role="alert" className="border border-red-500/30 bg-red-500/10 p-3">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-300">
                  <AlertCircle size={13} aria-hidden="true" />
                  {t("chatbot.errorTitle")}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                  {t(ERROR_KEY[error])}
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
                className="flex h-10 items-center gap-2 bg-[#D4AF37] px-3 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={14} aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[8px] leading-relaxed text-slate-600">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-bold uppercase tracking-[0.18em] text-[#D4AF37] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
              >
                {t("chatbot.handoffCta")}
              </a>
              <span className="mx-1.5 text-slate-700" aria-hidden="true">·</span>
              <span className="break-all">{SUPPORT_EMAIL}</span>
            </p>
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
  );
};

export default SupportChatbot;
