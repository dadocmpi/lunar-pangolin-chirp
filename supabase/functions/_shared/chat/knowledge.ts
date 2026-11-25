// ============================================================================
// Approved knowledge base for the support chatbot.
//
// This is the ONLY content the assistant may answer from. It mirrors what the
// product and the published pages actually say. Prices are read from the
// canonical server plan table, never hard-coded here, so the chatbot can never
// quote a price the checkout would not charge.
//
// Sources audited for this file:
//   src/App.tsx                         public routes
//   src/pages/*.tsx                     visible page copy
//   src/i18n.ts                         the 11 translated locales
//   src/lib/plans.ts                    client plan table
//   supabase/functions/_shared/plans.ts canonical server plan table
//   supabase/functions/_shared/checkout/logic.ts, checkout-config
//   supabase/functions/_shared/profile/*, activation/*
//   AGENTS.md                           product/security invariants
//
// Rules:
//   * never invent prices, payment links, wallet addresses, networks, bank
//     details, legal claims, Tradovate compatibility or company promises;
//   * never expose private customer data or claim to know a customer's
//     payment, activation, account or trading status;
//   * never give financial, legal, tax or trading advice;
//   * legal pages are DRAFTS pending legal review — link to them, do not
//     paraphrase them as final legal advice.
//
// The article bodies are English. When a model provider is configured it
// answers in the detected locale from this material. Without a provider the
// deterministic fallback returns the English body for English and a localized
// pointer to the official page for every other locale.
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
    id: "public_routes",
    title: "Public pages and routes",
    keywords: [
      "page", "pages", "route", "routes", "website", "site", "where", "link", "menu", "navigation",
      "página", "páginas", "sitio", "pagina", "site", "seite", "страница", "页面", "サイト", "صفحة", "עמוד",
    ],
    body:
      "Public pages: / (home), /pricing (plans), /how-it-works (infrastructure overview), /about (company and leadership), /accounts (buy a prop-firm account and activate the signals plan), /contact (support form and email), /login, /register, /complete-profile, /reset-password, /auth-callback, /terms, /privacy and /disclaimer. The /checkout and /checkout/success pages handle payment. /dashboard requires a signed-in account. /register-application is a legacy link that redirects to /checkout?plan=<key>. Operator pages are internal and not customer pages. A missing page shows the 404 page.",
    links: ["/", "/pricing", "/about", "/contact"],
  },
  {
    id: "company_overview",
    title: "About Braxel Markets",
    keywords: [
      "about", "company", "who", "founded", "founder", "team", "leadership", "address", "location", "mission", "braxel",
      "empresa", "quem", "fundador", "equipa", "equipo", "endereço", "dirección", "adresse", "unternehmen", "компания", "公司", "会社", "الشركة", "חברה",
    ],
    body:
      "Braxel Markets is a trading-technology and managed-service brand. The About page describes its mission, history and leadership; the public leadership page names Bernardo Campi as Founder & CEO. The business address shown in the site footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain. Braxel is not a prop firm, does not custody customer funds and does not process prop-firm payouts. It does not guarantee returns. The marketing pages contain illustrative and unverified performance statements; treat them as marketing, not as a promise.",
    links: ["/about", "/contact"],
  },
  {
    id: "how_it_works",
    title: "How the service works",
    keywords: [
      "how it works", "process", "steps", "work", "service", "signals", "prop firm", "evaluation", "funded",
      "como funciona", "processo", "etapas", "serviço", "cómo funciona", "proceso", "etapas", "servicio", "fonctionnement", "prozess", "как работает", "如何运作", "仕組み", "كيف يعمل", "איך זה עובד",
    ],
    body:
      "The documented customer flow is: create an account, choose a plan, complete checkout, wait for the server-verified payment, complete onboarding and the required disclosures, submit an account-link (activation) request for your external prop-firm account, wait for manual operator review, then execute the signals yourself in your own account with a third-party tool. Braxel never operates your trading account, never stores broker credentials and never places orders. The public /how-it-works page is an infrastructure overview; some statements there are marked illustrative or unverified and are not a guarantee of performance.",
    links: ["/how-it-works", "/accounts", "/dashboard"],
  },
  {
    id: "account_creation",
    title: "Account creation",
    keywords: [
      "account", "create", "register", "signup", "sign up", "new account", "open account",
      "cadastro", "registrar", "conta", "cuenta", "compte", "konto", "регистрация", "注册", "アカウント", "حساب", "חשבון",
    ],
    body:
      "Create an account on the Register page. Step 1 asks for your full name, email, password (minimum 6 characters, entered twice) and acceptance of the Terms and Privacy Policy. Step 2 asks for phone, country and address. The email address must be confirmed before you can sign in. Braxel never asks for a broker password, card number, API key or any secret during signup. A signed-in customer whose profile is incomplete is sent to /complete-profile, and a profile read error never blocks the dashboard.",
    links: ["/register", "/complete-profile"],
  },
  {
    id: "email_confirmation",
    title: "Email confirmation",
    keywords: [
      "email", "confirm", "confirmation", "verify", "verification email", "resend", "confirmation link",
      "confirmação", "confirmar", "correo", "bestätigen", "подтвердить", "确认", "確認", "تأكيد", "אימות",
    ],
    body:
      "After signup Supabase Auth sends a confirmation email. Open the link in that email to activate sign-in; the link returns to /auth-callback. If the email did not arrive, check the spam folder, then use the resend action on the Login page. For privacy, the signup screen shows the same neutral message whether or not an address is already registered. Support can help with delivery problems but will never ask for your password or confirmation code. If the link is expired or already used, request a new one.",
    links: ["/login", "/register", "/auth-callback"],
  },
  {
    id: "password_recovery",
    title: "Password recovery",
    keywords: [
      "password", "reset", "forgot", "recover", "recovery", "login problem", "reset link",
      "senha", "recuperar", "contraseña", "mot de passe", "passwort", "пароль", "密码", "パスワード", "كلمة المرور", "סיסמה",
    ],
    body:
      "Use 'Forgot password?' on the Login page. We email a recovery link that opens the Reset Password page, where you set a new password. The link expires and can only be used once; if it is expired or already used, request a new one. A recovery link never grants dashboard access without setting a new password. Braxel support will never ask you to send your password. A normal signed-in session on /reset-password is treated as an invalid reset link.",
    links: ["/login", "/reset-password"],
  },
  {
    id: "profile_and_signup",
    title: "Profile and signup details",
    keywords: [
      "profile", "phone", "country", "address", "personal information", "my profile", "billing details",
      "perfil", "telefone", "endereço", "morada", "teléfono", "dirección", "profil", "telefon", "adresse", "профиль", "个人资料", "プロフィール", "الملف الشخصي", "פרופיל",
    ],
    body:
      "Your profile stores your name, email, phone (country dial code plus national number), country and address. You can review and edit it in the 'My profile' view of the dashboard. Profile writes go through the authenticated profile-submit function, which re-validates every field server-side. Checkout can pre-fill these details from your profile and lets you update the profile from the billing form. Braxel never stores a password or a card number in your profile.",
    links: ["/complete-profile", "/dashboard"],
  },
  {
    id: "plans",
    title: "Plans and pricing",
    keywords: [
      "plan", "plans", "price", "pricing", "cost", "how much", "subscription", "monthly", "managed capital", "fee",
      "plano", "preço", "precio", "tarif", "preis", "тариф", "价格", "料金", "خطة", "السعر", "תוכנית", "מחיר",
    ],
    body:
      `Braxel offers four monthly plans. ${planFacts()} All amounts are charged in USD. The plan summary at checkout is the authoritative amount; the server derives the plan, amount and currency and the browser never declares a price. The Pricing page shows the current plan cards. Local currency, where shown, is presentation only; Managed Capital is always quoted in USD.`,
    links: ["/pricing", "/checkout"],
  },
  {
    id: "accounts_prop_firms",
    title: "Prop-firm accounts and affiliate links",
    keywords: [
      "accounts page", "buy account", "prop firm", "tradeify", "lucid", "affiliate", "commission", "evaluation", "funded account", "buy account",
      "comprar conta", "corretora", "afiliado", "comisión", "comprar cuenta", "compte", "konto kaufen", "аккаунт проп-фирмы", "购买账户", "口座購入", "شراء حساب", "קניית חשבון",
    ],
    body:
      "The /accounts page lets you buy an evaluation or funded account directly from a prop firm (Tradeify or Lucid) through a real affiliate link. Braxel receives an affiliate commission, which does not change the price you pay to the firm. You buy and own the account directly from the firm; Braxel does not operate it and never has access to it. After buying, return to the panel and request activation of the signals plan, attaching your purchase receipt. The signals plan is a fixed monthly fee, and you execute the signals yourself in your own account with a third-party tool. Trading involves a substantial risk of loss; the page includes a risk warning.",
    links: ["/accounts", "/pricing"],
  },
  {
    id: "checkout",
    title: "Checkout",
    keywords: [
      "checkout", "pay", "purchase", "order", "billing", "consent", "terms acceptance",
      "pagamento", "pagar", "compra", "pago", "zahlung", "оплата", "支付", "支払い", "الدفع", "תשלום",
    ],
    body:
      "Checkout is a single page: plan summary, your billing details and the payment method selector. Terms and Privacy must be accepted before paying. The server re-derives the plan, amount, currency and interval; a ?plan= query only selects the plan and never sets a price. Card payments open Stripe's hosted Checkout; our app has no card fields and never sees your card number. Bank transfer shows the configured bank details and a reference and is settled manually. Crypto is available only for networks the server has configured, and you must send the exact asset on the exact network shown. A repeated checkout can answer duplicate_checkout instead of charging twice.",
    links: ["/checkout", "/pricing"],
  },
  {
    id: "payment_methods",
    title: "Card, bank transfer and crypto",
    keywords: [
      "card", "stripe", "bank", "bank transfer", "wise", "crypto", "bitcoin", "btc", "usdt", "eth", "network", "wallet", "currency", "usd",
      "cartão", "transferência", "banco", "tarjeta", "transferencia", "carte", "virement", "karte", "überweisung", "карта", "перевод", "银行卡", "转账", "加密货币", "بطاقة", "تحويل", "כרטיס", "העברה",
    ],
    body:
      "Card: 'Continue to secure card payment' redirects to Stripe's hosted Checkout. Our app has no card fields; the server keeps the USD Price ID, the canonical amount and the application ownership. Confirmation comes only from the Stripe webhook or the server reconciliation, never from a browser redirect. Bank transfer (Wise): the server returns the configured bank details and a reference and records the payment as pending manual review; the instructions are not proof of payment and there is no client-side success. Crypto: only networks configured on the server are selectable; you must send the exact asset on the exact network shown, and sending on the wrong network can lose the funds. Confirmation is on-chain and server-side. All charges are in USD. PayPal and direct card endpoints are disabled; do not promise them.",
    links: ["/checkout", "/checkout/success"],
  },
  {
    id: "payment_status",
    title: "Payment status",
    keywords: [
      "payment status", "paid", "pending", "processing", "confirmed", "failed", "stuck", "not showing", "receipt", "status", "duplicate",
      "pagamento", "pendente", "pago", "zahlung", "оплата", "支付状态", "支払い状況", "حالة الدفع", "סטטוס תשלום",
    ],
    body:
      "The dashboard payment card and the checkout success page show the server-side status. Only a server-verified confirmation marks a payment as confirmed and unlocks onboarding; a browser redirect or a URL parameter never confirms a payment. Card confirmations normally arrive through the payment provider webhook and can take a short time; bank transfers are reviewed manually. A lost card event can be recovered by the server reconciliation endpoint. If a payment looks wrong, do not pay twice. Contact human support with your order reference; the assistant cannot read or change your payment status.",
    links: ["/checkout/success", "/dashboard"],
  },
  {
    id: "refunds_cancellation",
    title: "Refunds and cancellation",
    keywords: [
      "refund", "refunded", "cancel", "cancellation", "cancel plan", "money back", "chargeback",
      "reembolso", "cancelar", "cancelamento", "reembolso", "cancelación", "remboursement", "annuler", "rückerstattung", "kündigen", "возврат", "отмена", "退款", "取消", "返金", "キャンセル", "استرداد", "إلغاء", "החזר", "ביטול",
    ],
    body:
      "The public pages do not publish a refund schedule or a self-service cancellation button. Refund and cancellation requests are reviewed by a person. Contact human support by email with your account email and order reference. Do not open a chargeback or pay twice while a request is being reviewed. The assistant cannot approve a refund, cancel a plan or change a payment status.",
    links: ["/contact", "/terms"],
  },
  {
    id: "onboarding",
    title: "Onboarding after payment",
    keywords: [
      "onboarding", "after payment", "next step", "disclosures", "start", "account link", "link account",
      "integração", "incorporação", "incorporación", "onboarding", "онбординг", "入门", "オンボーディング", "التهيئة", "קליטה",
    ],
    body:
      "After a confirmed payment, the dashboard shows the onboarding steps and the required disclosures: your package, the payment status and the account-link request. Complete the disclosures, then submit an account-link request for the external prop-firm account you intend to use. An operator reviews the request manually. The dashboard shows pending, in review, information requested, approved, rejected, suspended or disconnected. Braxel does not receive your provider password, API key or token, never operates your trading account and never stores broker credentials.",
    links: ["/dashboard"],
  },
  {
    id: "activation",
    title: "Account activation",
    keywords: [
      "activate", "activation", "evaluation", "funded", "signals", "receipt", "proof of purchase", "operator review",
      "ativação", "ativar", "activación", "activation", "aktivierung", "активация", "激活", "アクティベーション", "تفعيل", "הפעלה",
    ],
    body:
      "You buy an evaluation or funded account directly from the prop firm through our affiliate link, then request activation in the dashboard. The activation form asks for the firm, the plan you bought, your account login/ID at the firm, the purchase email, a receipt (image or PDF, up to 10 MB) and four mandatory confirmations. Never enter your broker password: Braxel only needs the account login/ID and the receipt. Activation is reviewed manually by an operator; approval is not automatic and is not guaranteed. Braxel does not operate your account, does not place orders and does not process prop-firm payouts. You execute the signals yourself in your own account.",
    links: ["/accounts", "/dashboard"],
  },
  {
    id: "dashboard_usage",
    title: "Dashboard features",
    keywords: [
      "dashboard", "terminal", "performance", "audit log", "profile", "settings", "navigation", "services", "payments", "withdrawal",
      "painel", "panel", "tableau de bord", "übersicht", "панель", "仪表盘", "ダッシュボード", "لوحة التحكم", "לוח בקרה",
    ],
    body:
      "The dashboard has a services overview, a payments card, an optional Tradovate view, account activation, your profile, performance and an audit log. Performance is computed only from your own closed trades; with no closed trades you see an explicit empty state rather than a fabricated number. Every figure is real account data. The dashboard is reachable without a Tradovate connection and without KYC; identity verification is only required to request a withdrawal.",
    links: ["/dashboard"],
  },
  {
    id: "tradovate_connection",
    title: "Tradovate connection status",
    keywords: [
      "tradovate", "connection", "connect", "broker", "account status", "disconnect", "demo", "live", "read-only",
      "conexão", "conectar", "conexión", "connexion", "verbindung", "подключение", "连接", "接続", "اتصال", "חיבור",
    ],
    body:
      "Tradovate is an optional, read-only integration. When the feature is enabled, the dashboard shows a connection card and the current status; the connect flow runs inside the dashboard and defaults to the demo environment. Credentials are encrypted server-side and never returned to the browser. The user never types an account id: the server lists the accounts on the Tradovate login and auto-selects or preselects an active account. Data is collected by incremental polling, not a WebSocket. The integration is read-only: Braxel cannot place, modify or liquidate orders, withdraw funds or transfer money, and there is no copy-trading engine. The support assistant cannot connect, disconnect or change your Tradovate status and will never ask for your Tradovate username, password, CID or secret. For connection errors or provider problems, contact human support.",
    links: ["/dashboard"],
  },
  {
    id: "withdrawal_kyc",
    title: "Withdrawals and identity verification",
    keywords: [
      "withdrawal", "withdraw", "kyc", "identity", "verification", "document", "selfie", "compliance", "payout",
      "levantamento", "saque", "verificação", "documento", "retiro", "verificación", "documento", "retrait", "vérification", "auszahlung", "verifizierung", "вывод", "верификация", "提现", "身份验证", "出金", "本人確認", "سحب", "التحقق", "משיכה", "אימות",
    ],
    body:
      "The terminal is usable without identity verification. KYC is required only when you request a withdrawal. Withdrawal requests are gated server-side: without an approved submission the server refuses the request, and a status sent from the browser is ignored. Documents are uploaded through an authenticated function into a private bucket; only object paths are stored, never public URLs. An AI consistency check is advisory and fails closed to human review. Never send identity documents through this chat. For a withdrawal or KYC problem, contact human support.",
    links: ["/dashboard", "/contact"],
  },
  {
    id: "support_procedures",
    title: "Support procedures",
    keywords: [
      "support", "contact", "help", "human", "email", "response", "ticket", "escalation", "complaint",
      "suporte", "contato", "soporte", "contacto", "kontakt", "поддержка", "支持", "サポート", "الدعم", "תמיכה",
    ],
    body:
      "Human support is reached through the Contact page or the support email marketsbraxel@ouvidor.net. Include your account email, the plan or order reference and a short description. Never include passwords, card numbers, API keys, MFA codes or private keys in a support message. The AI assistant can explain the product and the official procedures, but it cannot change your account, payment or activation status. Payment disputes, KYC, account suspension, legal questions, provider problems, refunds and explicit human requests are always handed to a person.",
    links: ["/contact"],
  },
  {
    id: "contact_and_company",
    title: "Contact details and business address",
    keywords: [
      "contact", "address", "email", "contact details", "email address", "business address", "where are you", "office", "hours", "phone",
      "contacto", "endereço", "morada", "dirección", "adresse", "kontakt", "адрес", "联系", "連絡先", "العنوان", "כתובת",
    ],
    body:
      "The public contact email is marketsbraxel@ouvidor.net, shown on the Contact page and in the footer. The business address shown in the footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain. The Contact page also has a message form with a security challenge. Do not send passwords or identity documents through the form. The site does not publish a telephone number or a guaranteed response time; response times vary.",
    links: ["/contact"],
  },
  {
    id: "faq_help",
    title: "FAQ and help topics",
    keywords: [
      "faq", "questions", "experience", "beginner", "risk", "cancel plan", "how does it work", "help",
      "perguntas", "dúvidas", "experiência", "risco", "preguntas", "experiencia", "riesgo", "questions", "risque", "fragen", "risiko", "вопросы", "риск", "常见问题", "风险", "よくある質問", "リスク", "الأسئلة", "المخاطر", "שאלות", "סיכון",
    ],
    body:
      "The home page FAQ covers four topics. Prior experience: the public FAQ says prior experience is not required to use the panel, but you must understand the risks. Risk: trading involves a substantial risk of loss and Braxel does not guarantee results. How it works: see the documented customer flow (account, plan, payment, onboarding, activation, self-execution of signals); the marketing pages contain illustrative and unverified statements. Cancellation: the FAQ mentions requesting cancellation; in practice refund and cancellation requests are reviewed by a person through human support, and there is no self-service cancellation button.",
    links: ["/", "/how-it-works", "/contact"],
  },
  {
    id: "account_actions",
    title: "What the assistant can and cannot do",
    keywords: [
      "can you", "do it for me", "change my", "activate my", "connect my", "place order", "trade for me", "status",
      "pode fazer", "ativar", "conectar", "executar", "puedes", "activar", "conectar", "ejecutar", "pouvez", "activer", "connecter", "können", "aktivieren", "можете", "активировать", "可以", "激活", "できます", "有効化", "يمكنك", "تفعيل", "יכול", "להפעיל",
    ],
    body:
      "The assistant is informational only. It cannot execute a payment, approve or reject a payment, activate or suspend an account, connect or disconnect a provider, place or modify a trade, request a withdrawal, change customer data or read an individual customer's payment, activation, account or trading status. It has no tools and no database access. If you ask it to perform one of these actions, it will explain the official procedure and hand you to human support where needed.",
    links: ["/contact", "/dashboard"],
  },
  {
    id: "security_privacy",
    title: "Security and chat privacy",
    keywords: [
      "security", "privacy", "data", "stored", "store", "log", "conversation", "secret", "safe", "gdpr",
      "segurança", "privacidade", "dados", "guardado", "seguridad", "privacidad", "datos", "sécurité", "confidentialité", "données", "sicherheit", "datenschutz", "безопасность", "данные", "安全", "隐私", "数据", "セキュリティ", "プライバシー", "الأمان", "الخصوصية", "אבטחה", "פרטיות",
    ],
    body:
      "The AI chat is stateless: the browser sends the recent turns with each request, the server stores nothing, logs no message content and returns Cache-Control: no-store. The conversation stays in browser memory only; there is no conversation table, so one customer cannot read another customer's chat. The assistant never asks for passwords, card numbers, Tradovate credentials, API keys, MFA codes or private keys. Customer sessions use bearer tokens, KYC documents live in a private bucket, and provider credentials are encrypted server-side. The published Privacy Policy is a DRAFT pending legal review; data-rights requests go to human support.",
    links: ["/privacy", "/contact"],
  },
  {
    id: "languages",
    title: "Supported languages",
    keywords: [
      "language", "languages", "english", "portuguese", "spanish", "italian", "french", "german", "russian", "chinese", "japanese", "arabic", "hebrew",
      "idioma", "idiomas", "língua", "idioma", "langue", "sprache", "язык", "语言", "言語", "اللغة", "שפה",
    ],
    body:
      "The website and the support assistant support 11 locales: English, Portuguese, Italian, Spanish, French, German, Russian, Chinese, Japanese, Arabic and Hebrew. The assistant answers in the language of your latest message, not the website locale. Right-to-left layouts are supported for Arabic and Hebrew.",
    links: ["/", "/contact"],
  },
  {
    id: "legal_documents",
    title: "Terms, Privacy, Disclaimer and risk warning",
    keywords: [
      "terms", "privacy", "disclaimer", "risk", "legal", "policy", "gdpr", "data", "contract", "liability",
      "termos", "privacidade", "aviso", "risco", "términos", "privacidad", "conditions", "confidentialité", "agb", "datenschutz", "условия", "隐私", "利用規約", "الشروط", "תנאים",
    ],
    body:
      "The published Terms, Privacy Policy and Financial Disclaimer pages are DRAFTS pending legal review. Trading in financial markets involves a substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results. Braxel does not guarantee returns, payouts, approval or safety. The assistant does not provide legal advice; legal questions and data-rights requests go to human support. Do not treat marketing statements on the site as contractual promises.",
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
