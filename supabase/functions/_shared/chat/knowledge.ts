// ============================================================================
// Approved knowledge base for the support chatbot.
//
// This is the ONLY content the assistant may answer from. It mirrors what the
// product and the published pages actually say. Prices are read from the
// canonical server plan table, never hard-coded here, so the chatbot can never
// quote a price the checkout would not charge.
//
// Legal pages are DRAFTS pending legal review. The assistant must link to them
// and escalate legal questions to a human; it must not paraphrase them as if
// they were final legal advice.
//
// The article bodies are English. When a model provider is configured it
// answers in the requested locale from this material. Without a provider the
// deterministic fallback returns the English summary plus the official link.
// ============================================================================

import { PLANS, PLAN_IDS } from "../plans.ts";

export interface KnowledgeArticle {
  id: string;
  title: string;
  /** Lower-case keywords used for deterministic retrieval. */
  keywords: string[];
  body: string;
  /** Relative paths to official Braxel pages. */
  links: string[];
}

function planFacts(): string {
  return PLAN_IDS.map((id) => {
    const plan = PLANS[id];
    return `${plan.name}: $${(plan.priceCents / 100).toFixed(2)} USD per month, ${plan.managedCapitalUsd.toLocaleString("en-US")} USD managed capital reference.`;
  }).join(" ");
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "account_creation",
    title: "Account creation",
    keywords: [
      "account", "create", "register", "signup", "sign up", "new account",
      "cadastro", "registrar", "conta", "cuenta", "compte", "konto", "注册", "アカウント", "حساب", "חשבון",
    ],
    body:
      "Create an account on the Register page. Step 1 asks for your full name, email, password (minimum 6 characters, entered twice) and acceptance of the Terms and Privacy Policy. Step 2 asks for phone, country and address. The email address must be confirmed before you can sign in. Braxel never asks for a broker password, card number, API key or any secret during signup.",
    links: ["/register"],
  },
  {
    id: "email_confirmation",
    title: "Email confirmation",
    keywords: [
      "email", "confirm", "confirmation", "verify", "verification email", "resend",
      "confirmação", "confirmar", "correo", "confirmation", "bestätigen", "подтвердить", "确认", "確認", "تأكيد", "אימות",
    ],
    body:
      "After signup Supabase Auth sends a confirmation email. Open the link in that email to activate sign-in. If the email did not arrive, check the spam folder, then use the resend action on the Login page. For privacy, the signup screen shows the same neutral message whether or not an address is already registered. Support can help with delivery problems but will never ask for your password or confirmation code.",
    links: ["/login", "/register"],
  },
  {
    id: "password_recovery",
    title: "Password recovery",
    keywords: [
      "password", "reset", "forgot", "recover", "recovery", "login problem",
      "senha", "recuperar", "contraseña", "mot de passe", "passwort", "пароль", "密码", "パスワード", "كلمة المرور", "סיסמה",
    ],
    body:
      "Use 'Forgot password?' on the Login page. We email a recovery link that opens the Reset Password page, where you set a new password. The link expires and can only be used once; if it is expired or already used, request a new one. A recovery link never grants dashboard access without setting a new password. Braxel support will never ask you to send your password.",
    links: ["/login", "/reset-password"],
  },
  {
    id: "plans",
    title: "Plans and pricing",
    keywords: [
      "plan", "plans", "price", "pricing", "cost", "how much", "subscription", "monthly",
      "plano", "preço", "precio", "tarif", "preis", "тариф", "价格", "料金", "خطة", "السعر", "תוכנית", "מחיר",
    ],
    body:
      `Braxel offers four monthly plans. ${planFacts()} All amounts are charged in USD. The plan summary at checkout is the authoritative amount; the server derives the plan, amount and currency and the browser never declares a price. The Pricing page shows the current plan cards.`,
    links: ["/pricing", "/checkout"],
  },
  {
    id: "checkout",
    title: "Checkout and payment methods",
    keywords: [
      "checkout", "pay", "payment method", "card", "stripe", "bank", "wise", "crypto", "bitcoin", "usdt",
      "pagamento", "pagar", "pago", "zahlung", "оплата", "支付", "支払い", "الدفع", "תשלום",
    ],
    body:
      "Checkout is a single page: plan summary, your billing details and the payment method selector. Card payments open Stripe's hosted Checkout; our app has no card fields and never sees your card number. Bank transfer shows the configured bank details and a reference, and is settled manually. Crypto is available only for networks the server has configured, and you must send the exact asset on the exact network shown. Terms and Privacy must be accepted before paying.",
    links: ["/checkout", "/pricing"],
  },
  {
    id: "payment_status",
    title: "Payment status",
    keywords: [
      "payment status", "paid", "pending", "processing", "confirmed", "failed", "stuck", "not showing", "receipt",
      "status", "pagamento", "pendente", "pago", "zahlung", "оплата", "支付状态", "支払い状況", "حالة الدفع", "סטטוס תשלום",
    ],
    body:
      "The dashboard payment card and the checkout success page show the server-side status. Only a server-verified confirmation marks a payment as confirmed and unlocks onboarding; a browser redirect or a URL parameter never confirms a payment. Card confirmations normally arrive through the payment provider webhook and can take a short time; bank transfers are reviewed manually. If a payment looks wrong, do not pay twice. Contact human support with your order reference.",
    links: ["/checkout/success", "/dashboard"],
  },
  {
    id: "onboarding",
    title: "Onboarding after payment",
    keywords: [
      "onboarding", "after payment", "next step", "disclosures", "start",
      "integração", "incorporação", "incorporación", "onboarding", "onboarding", "онбординг", "入门", "オンボーディング", "التهيئة", "קליטה",
    ],
    body:
      "After a confirmed payment, the dashboard shows the onboarding steps and the required disclosures. Complete them, then submit an account-link request. An operator reviews the request manually. The dashboard shows pending, in review, information requested, approved, rejected, suspended or disconnected. Braxel never operates your trading account and never stores broker credentials.",
    links: ["/dashboard"],
  },
  {
    id: "activation",
    title: "Account activation",
    keywords: [
      "activate", "activation", "prop firm", "tradeify", "lucid", "evaluation", "funded", "signals",
      "ativação", "ativar", "activación", "activation", "aktivierung", "активация", "激活", "アクティベーション", "تفعيل", "הפעלה",
    ],
    body:
      "You buy an evaluation or funded account directly from the prop firm through our affiliate link, then request activation in the dashboard. Activation is reviewed manually by an operator; approval is not automatic and is not guaranteed. Braxel does not operate your account, does not place orders and does not process prop-firm payouts. You execute the signals yourself in your own account. Never send broker credentials to Braxel.",
    links: ["/accounts", "/dashboard"],
  },
  {
    id: "dashboard_usage",
    title: "Dashboard usage",
    keywords: [
      "dashboard", "terminal", "performance", "audit log", "profile", "settings", "navigation",
      "painel", "panel", "tableau de bord", "übersicht", "панель", "仪表盘", "ダッシュボード", "لوحة التحكم", "לוח בקרה",
    ],
    body:
      "The dashboard has a services overview, payments, an optional Tradovate view, account activation, your profile, performance and an audit log. Performance is computed only from your own closed trades; with no closed trades you see an explicit empty state rather than a fabricated number. Every figure is real account data.",
    links: ["/dashboard"],
  },
  {
    id: "tradovate_connection",
    title: "Tradovate connection status",
    keywords: [
      "tradovate", "connection", "connect", "broker", "account status", "disconnect",
      "conexão", "conectar", "conexión", "connexion", "verbindung", "подключение", "连接", "接続", "اتصال", "חיבור",
    ],
    body:
      "When the Tradovate feature is enabled, the dashboard shows a connection card and the current connection status. The connection is set up in the dashboard, demo environment by default. The support assistant cannot connect, disconnect or change your Tradovate status, and will never ask for your Tradovate username, password, CID or secret. For connection errors or provider problems, contact human support.",
    links: ["/dashboard"],
  },
  {
    id: "support_procedures",
    title: "Support procedures",
    keywords: [
      "support", "contact", "help", "human", "email", "response", "ticket",
      "suporte", "contato", "soporte", "contacto", "support", "kontakt", "поддержка", "支持", "サポート", "الدعم", "תמיכה",
    ],
    body:
      "Human support is reached through the Contact page or the support email. Include your account email, the plan or order reference and a short description. Never include passwords, card numbers, API keys, MFA codes or private keys in a support message. The AI assistant can explain the product and the official procedures, but it cannot change your account, payment or activation status.",
    links: ["/contact"],
  },
  {
    id: "legal_documents",
    title: "Terms, Privacy, Disclaimer and risk warning",
    keywords: [
      "terms", "privacy", "disclaimer", "risk", "legal", "policy", "gdpr", "data",
      "termos", "privacidade", "aviso", "risco", "términos", "privacidad", "conditions", "confidentialité", "agb", "datenschutz", "условия", "隐私", "利用規約", "الشروط", "תנאים",
    ],
    body:
      "The published Terms, Privacy Policy and Financial Disclaimer pages are DRAFTS pending legal review. Trading in financial markets involves a substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results. Braxel does not guarantee returns, payouts, approval or safety. The assistant does not provide legal advice; legal questions and data-rights requests go to human support.",
    links: ["/terms", "/privacy", "/disclaimer"],
  },
];

/** Normalise a relative path to an absolute URL on the official app origin. */
export function officialUrl(appUrl: string, path: string): string {
  const base = appUrl.replace(/\/+$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

export function articleById(
  id: string,
  articles: KnowledgeArticle[] = KNOWLEDGE_ARTICLES,
): KnowledgeArticle | null {
  return articles.find((a) => a.id === id) ?? null;
}

/**
 * Deterministic retrieval by keyword overlap. Used to (a) ground the model with
 * the most relevant approved articles and (b) answer without a provider.
 * Returns at most `limit` articles, strongest first. No match => [].
 */
export function selectRelevantArticles(
  message: string,
  articles: KnowledgeArticle[] = KNOWLEDGE_ARTICLES,
  limit = 3,
): KnowledgeArticle[] {
  const text = ` ${message.toLowerCase()} `;
  const scored = articles
    .map((article) => {
      let score = 0;
      for (const keyword of article.keywords) {
        const needle = keyword.toLowerCase();
        if (!needle) continue;
        // Word-ish match to avoid "plan" matching "planet".
        if (new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`).test(text)) {
          score += needle.includes(" ") ? 2 : 1;
        }
      }
      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.article);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Sources for a set of articles: title + the first official link. */
export function sourcesFor(
  articles: KnowledgeArticle[],
  appUrl: string,
): Array<{ title: string; url: string }> {
  const seen = new Set<string>();
  const out: Array<{ title: string; url: string }> = [];
  for (const article of articles) {
    const path = article.links[0];
    if (!path) continue;
    const url = officialUrl(appUrl, path);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title: article.title, url });
  }
  return out;
}
