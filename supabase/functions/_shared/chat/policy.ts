// ============================================================================
// Chatbot safety policy — pure, deterministic, unit-tested.
//
// These checks run BEFORE and AFTER the model:
//   * before: classify escalation, refuse advice/secret/injection requests
//     without spending a provider call;
//   * after: sanitise the model output so a bad completion can never promise
//     profits, ask for secrets, or leak the system prompt.
//
// Nothing here performs I/O. The function has no tools and no database access,
// so "no unauthorized action" is structural: the only side effect is a model
// call that returns text.
// ============================================================================

import type { EscalationCategory } from "./types.ts";

export interface EscalationResult {
  required: boolean;
  category: EscalationCategory | null;
}

const norm = (s: string) => ` ${s.toLowerCase().replace(/\s+/g, " ").trim()} `;
const has = (text: string, patterns: RegExp[]) => patterns.some((p) => p.test(text));

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

const REFUND = [/\brefund(s|ed|ing)?\b/, /\bmoney back\b/, /\bcharge ?back\b/, /\bdevolu(c|ç)(ão|cao|ción|tion)\b/, /\brückerstattung\b/, /\bвозврат\b/, /\b退款\b/, /\b返金\b/, /\bاسترداد\b/, /\bהחזר\b/];
const DISPUTE = [
  /\bdispute\b/, /\bcharged twice\b/, /\bdouble charge\b/, /\bunauthori[sz]ed charge\b/,
  /\bwrong amount\b/, /\bovercharged\b/, /\bpayment (is )?(wrong|incorrect)\b/,
  /\bcobrança (dupla|indevida)\b/, /\bcobro (doble|indebido)\b/, /\bdouble (débit|facturation)\b/, /\bdoppelt (abgebucht|belastet)\b/,
  /\bдвойное списание\b/, /\b重复扣款\b/, /\b二重請求\b/, /\bخصم مزدوج\b/, /\bחיוב כפול\b/,
];
const KYC = [/\bkyc\b/, /\bknow your customer\b/, /\bidentity verification\b/, /\bid verification\b/, /\bverification (document|documents|pending)\b/, /\bidentity document\b/, /\bverifica(ção|ción|cation) de identidade\b/, /\bidentitätsprüfung\b/, /\bпроверка личности\b/, /\b身份验证\b/, /\b本人確認\b/, /\bالتحقق من الهوية\b/, /\bאימות זהות\b/];
const SUSPENSION = [
  /\bsuspend(ed|ing|sion)?\b/, /\baccount (is )?(locked|disabled|blocked|banned)\b/,
  /\bbanned\b/, /\bdeactivated my account\b/,
  /\bconta (suspensa|bloqueada)\b/, /\bcuenta (suspendida|bloqueada)\b/, /\bcompte (suspendu|bloqué)\b/, /\bkonto (gesperrt|deaktiviert)\b/,
  /\bаккаунт (заблокирован|приостановлен)\b/, /\b账户(被)?(冻结|停用|封禁)\b/, /\bアカウント(停止|凍結)\b/, /\bحساب(ي)? (موقوف|مغلق)\b/, /\bחשבון (חסום|מושהה)\b/,
];
const LEGAL = [
  /\blegal (advice|question|action|lawsuit)\b/, /\blawyer\b/, /\battorney\b/, /\blawsuit\b/,
  /\bcourt\b/, /\bsubpoena\b/, /\bgdpr\b/, /\bdata (deletion|removal|request)\b/,
  /\bdelete my data\b/, /\bregulatory (question|complaint)\b/,
  /\badvogado\b/, /\babogado\b/, /\bavocat\b/, /\banwalt\b/, /\bюрист\b/, /\b律师\b/, /\b弁護士\b/, /\bمحامي\b/, /\bעורך דין\b/,
];
const PROVIDER = [
  /\btradovate\b.*\b(not working|error|fails?|failed|can'?t|cannot|unable|broken|down)\b/,
  /\b(not working|error|fails?|failed|can'?t|cannot|unable|broken|down)\b.*\btradovate\b/,
  /\b(prop firm|broker|provider)\b.*\b(not working|error|fails?|failed|broken|down|issue|problem)\b/,
  /\b(not working|error|fails?|failed|broken|down|issue|problem)\b.*\b(prop firm|broker|provider)\b/,
];
const HUMAN = [
  /\b(talk|speak) to (a )?(human|person|agent|representative|someone)\b/,
  /\bhuman (support|agent|representative)\b/, /\breal person\b/,
  /\bfalar com (um )?(humano|atendente)\b/, /\bhablar con (un )?(humano|agente)\b/, /\bparler à (un )?(humain|agent)\b/, /\bmit einem menschen sprechen\b/,
  /\bсвязаться с (человеком|оператором)\b/, /\b人工(客服|支持)\b/, /\b担当者と話\b/, /\bالتحدث مع (شخص|موظف)\b/, /\bלדבר עם (אדם|נציג)\b/,
];

/**
 * Classify whether a request must go to a human. Order matters: the most
 * specific/high-risk category wins (refund > dispute > kyc > suspension >
 * legal > provider > explicit human request).
 */
export function detectEscalation(message: string): EscalationResult {
  const text = norm(message);
  if (has(text, REFUND)) return { required: true, category: "refund" };
  if (has(text, DISPUTE)) return { required: true, category: "payment_dispute" };
  if (has(text, KYC)) return { required: true, category: "kyc" };
  if (has(text, SUSPENSION)) return { required: true, category: "account_suspension" };
  if (has(text, LEGAL)) return { required: true, category: "legal" };
  if (has(text, PROVIDER)) return { required: true, category: "provider_problem" };
  if (has(text, HUMAN)) return { required: true, category: "human_request" };
  return { required: false, category: null };
}

// ---------------------------------------------------------------------------
// Financial / investment / tax / legal advice
// ---------------------------------------------------------------------------

const ADVICE = [
  /\bshould i (buy|sell|trade|invest|short|long|go long|go short)\b/,
  /\bwhat should i (buy|sell|invest in|trade)\b/,
  /\bis (it|now) a good time to (buy|sell|invest|trade)\b/,
  /\bwill .* (go up|go down|rise|fall|moon|pump|dump)\b/,
  /\bprice prediction\b/, /\bforecast for (btc|bitcoin|eth|eurusd|nasdaq|gold)\b/,
  /\bhow much (can|will|could) i (make|earn|profit)\b/,
  /\b(tax|taxes|taxable)\b/, /\binvestment advice\b/, /\bfinancial advice\b/,
  /\bwhich (stock|crypto|asset|coin) (should|to)\b/,
  /\b(devo|posso) (comprar|vender|investir)\b/, /\bqué (debo|puedo) (comprar|vender|invertir)\b/,
  /\b(melhor|mejor|best)\s+(investimento|inversi[oó]n|investment)\b/,
  /\bonde (investir|invertir)\b/, /\bwhere (should i|can i|to) invest\b/,
  /\b(me )?(passa|passe|manda|mande|envia|envie|send|give me)\b.{0,30}\b(sinais|signals|señales|senales)\b/,
  /\b(sinais|signals|señales|senales)\b.{0,20}\b(hoje|today|hoy|agora|now)\b/,
  /\b(garantir|garantem|garantia de|guarantee|guaranteed)\b.{0,20}\b(lucro|lucros|retorno|retornos|profit|profits|returns?)\b/,
  /\b(vou|posso) (lucrar|ganhar dinheiro)\b/, /\bvoy a (ganar|ganar dinero)\b/,
  /\bdois-je (acheter|vendre|investir)\b/, /\bsollte ich (kaufen|verkaufen|investieren)\b/,
  /\bстоит ли (покупать|продавать|инвестировать)\b/, /\b我(应该|该)(买|卖|投资)\b/, /\b買うべき\b/, /\bهل (يجب|يمكنني) (الشراء|البيع|الاستثمار)\b/, /\bכדאי לי (לקנות|למכור|להשקיע)\b/,
];

export function detectAdviceRequest(message: string): boolean {
  return has(norm(message), ADVICE);
}

// ---------------------------------------------------------------------------
// Secrets — the bot must never ask for one, and must never echo one
// ---------------------------------------------------------------------------

const SECRET_TERMS =
  "(password|passcode|api[ _-]?key|secret|private[ _-]?key|seed phrase|recovery phrase|mnemonic|card number|credit card|cvv|cvc|mfa|otp|2fa|one[ -]?time code|tradovate (password|credentials?)|broker (password|credentials?)|senha|contraseña|contrasena|palavra-passe)";

const SECRET_REQUEST = [
  new RegExp(`\\b(what|whats|what's|tell|give|send|show|share|provide|confirm|enter|type|paste|manda|mande|envia|envie|passa|passe|dime|diga)\\b.{0,40}\\b(my |the |your |sua |seu |tu |tuya )?${SECRET_TERMS}\\b`, "i"),
  new RegExp(`\\b${SECRET_TERMS}\\b.{0,40}\\b(please|now|here|to me)\\b`, "i"),
  /\b(senha|contraseña|mot de passe|passwort|пароль|密码|パスワード|كلمة المرور|סיסמה)\b.{0,30}\b(qual|cuál|quel|welche|какой|是什么|何|ما|מה)\b/,
];

const SECRET_SHARING = [
  new RegExp(`\\b(my |the )?${SECRET_TERMS}\\s*(is|are|:|=)\\s*\\S+`, "i"),
  /\bsk_(live|test)_[A-Za-z0-9]{8,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b\d{13,19}\b/, // card-like digit run
  /\b[A-Za-z0-9+/]{32,}={0,2}\b/, // long token-like run
];

export function detectSecretRequest(message: string): boolean {
  // "How do I reset my password?" is a support question, not a request to
  // disclose a secret. Only treat it as a secret request when it also asks for
  // a non-password credential.
  const isResetContext =
    /\b(reset|forgot|recover|change|update|recovery|resend)\b/i.test(message);
  const asksForOtherSecret =
    /\b(api[ _-]?key|private[ _-]?key|secret|cvv|cvc|card number|mfa|otp|2fa|seed phrase|mnemonic)\b/i.test(message);
  if (isResetContext && !asksForOtherSecret) return false;
  return has(norm(message), SECRET_REQUEST);
}

export function detectSecretSharing(message: string): boolean {
  // Never treat a bare "password reset" question as sharing.
  if (/\b(reset|forgot|recover|change|update|recovery)\b/i.test(message)) {
    return has(message, [SECRET_SHARING[0], SECRET_SHARING[1], SECRET_SHARING[2], SECRET_SHARING[4]]);
  }
  return has(message, SECRET_SHARING);
}

/** Remove secret-like values from any text we are about to echo. */
export function redactSecrets(text: string): string {
  return text
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted]")
    .replace(/\bsk_(live|test)_[A-Za-z0-9]{8,}\b/g, "[redacted]")
    .replace(/\b\d{13,19}\b/g, "[redacted]")
    .replace(/\b[A-Za-z0-9+/]{40,}={0,2}\b/g, "[redacted]");
}

// ---------------------------------------------------------------------------
// Prompt injection
// ---------------------------------------------------------------------------

const INJECTION = [
  /\bignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|rules|prompts?)\b/,
  /\bdisregard (all |any )?(the )?(previous|prior|above|earlier) (instructions|rules|prompts?)\b/,
  /\byou are now\b/, /\bact as\b/, /\bpretend (to be|you are)\b/,
  /\bdeveloper mode\b/, /\bjailbreak\b/, /\bdo anything now\b/,
  /\boverride (your|the) (rules|instructions|safety)\b/,
  /\bnew (system )?instructions?\s*:/,
  /\b(reveal|show|print|repeat|output) (me )?(your|the) (system )?(prompt|instructions|rules)\b/,
  /\bsystem prompt\b/, /\byour instructions\b/,
  /\bignora (todas )?(las )?(instrucciones|regras) (anteriores|previas)\b/,
  /\bignore (todas )?(as )?(instruções|instrucoes|regras) (anteriores|previas)\b/,
  /\b(mostre|revele|repita) (as |suas |seus )?(regras|instruções|instrucoes)\b/,
  /\bignore (toutes )?(les )?(instructions|règles) (précédentes|antérieures)\b/,
  /\bignoriere (alle )?(vorherigen )?(anweisungen|regeln)\b/,
  /\bигнорируй (все )?(предыдущие )?(инструкции|правила)\b/,
  /\b忽略(之前|以上|所有)的?(指令|规则)\b/, /\b前の(指示|ルール)を無視\b/, /\bتجاهل (كل )?(التعليمات|القواعد) السابقة\b/, /\bהתעלם (מכל )?(ההוראות|הכללים) הקודמים\b/,
];

export function detectInjection(message: string): boolean {
  return has(norm(message), INJECTION);
}

// ---------------------------------------------------------------------------
// Output sanitisation
// ---------------------------------------------------------------------------

/** Marker that must never appear in a model completion (system-prompt leak). */
export const SYSTEM_MARKER = "[[BRAXEL_SYSTEM]]";

const FORBIDDEN_PROMISE = [
  /\bguarantee(d|s)?\b/i,
  /\brisk[ -]?free\b/i,
  /\bassured (profit|profits|return|returns|payout|payouts)\b/i,
  /\bguaranteed (profit|profits|return|returns|payout|payouts|approval|safety)\b/i,
  /\bwill (definitely )?(profit|make (you )?money|be approved)\b/i,
  /\bno (risk|downside|losses?)\b/i,
  /\bpromise[ds]? (you )?(profit|profits|returns?|payouts?|approval)\b/i,
];

const ASKS_FOR_SECRET = [
  new RegExp(`\\b(send|share|give|provide|enter|type|paste|tell me)\\b.{0,40}\\b(your |the )?${SECRET_TERMS}\\b`, "i"),
];

export interface SanitizeResult {
  text: string;
  /** True when the completion was replaced because it broke a rule. */
  downgraded: boolean;
  reason: string | null;
}

/**
 * Enforce output rules. A completion that promises outcomes, asks for a secret
 * or leaks the system prompt is replaced with an empty string and a reason; the
 * caller then returns the safe refusal/unknown state.
 */
export function sanitizeAnswer(raw: string): SanitizeResult {
  let text = (raw ?? "").trim();
  if (!text) return { text: "", downgraded: true, reason: "empty" };
  text = redactSecrets(text);
  if (text.length > 4000) text = text.slice(0, 4000);

  if (text.includes(SYSTEM_MARKER)) {
    return { text: "", downgraded: true, reason: "system_prompt_leak" };
  }
  if (has(text, FORBIDDEN_PROMISE)) {
    return { text: "", downgraded: true, reason: "forbidden_promise" };
  }
  if (has(text, ASKS_FOR_SECRET)) {
    return { text: "", downgraded: true, reason: "asks_for_secret" };
  }
  return { text, downgraded: false, reason: null };
}
