// ============================================================================
// Approved knowledge base for the support chatbot.
//
// This is the ONLY content the assistant may answer from. It mirrors what the
// product and the published pages actually say. Prices are read from the
// canonical server plan table, never hard-coded here, so the chatbot can never
// quote a price the checkout would not charge.
//
// Structure of one entry:
//   id                 stable machine id (also the grounding citation)
//   category           one of KNOWLEDGE_CATEGORIES
//   title              short human label
//   aliases            canonical synonyms in every supported language
//   keywords           broad single words used for retrieval
//   informalQuestions  real customer phrasings (typos, slang, abbreviations)
//   answer             canonical short English answer (1-2 sentences)
//   body               detailed English answer
//   relatedTopics      ids of adjacent approved topics
//   links              official Braxel pages for this topic
//
// Sources audited for this file:
//   src/App.tsx                         public routes
//   src/pages/*.tsx                     visible page copy
//   src/components/FAQ.tsx, src/i18n.ts  FAQ + the 11 translated locales
//   src/lib/plans.ts                    client plan table
//   supabase/functions/_shared/plans.ts canonical server plan table
//   supabase/functions/_shared/checkout/*, activation/*, profile/*
//   src/lib/paymentLifecycle.ts          the 15 payment states
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
// The entry bodies and canonical answers are English. Localized short answers
// for the core topics live in answers.ts; without a model provider the
// deterministic path answers in the detected language from that module and
// falls back to a localized pointer to the official page.
// ============================================================================

import { PLANS, PLAN_IDS } from "../plans.ts";
import { compact, FIELD_WEIGHTS, phrase, rankEntries, type IndexedEntry } from "./match.ts";

export const KNOWLEDGE_CATEGORIES = [
  "start",
  "account",
  "plans",
  "payment",
  "product",
  "company",
  "support",
  "legal",
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  start: "Getting started",
  account: "Account, signup and access",
  plans: "Plans and pricing",
  payment: "Checkout and payments",
  product: "Dashboard, activation and integrations",
  company: "Company and contact",
  support: "Support, privacy and languages",
  legal: "Legal and risk",
};

export interface KnowledgeArticle {
  id: string;
  category: KnowledgeCategory;
  title: string;
  /** Canonical synonyms in every supported language (short forms). */
  aliases: string[];
  /** Lower-case keywords used for deterministic retrieval. */
  keywords: string[];
  /** Real customer phrasings: informal, abbreviated, accented or not. */
  informalQuestions: string[];
  /** Canonical short English answer. */
  answer: string;
  /** Detailed English answer. */
  body: string;
  /** Ids of adjacent approved topics. */
  relatedTopics: string[];
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
    category: "start",
    title: "Public pages and routes",
    aliases: [
      "pages", "website", "site", "routes", "what pages", "site map",
      "páginas", "sitio", "paginas do site", "seiten", "страницы", "页面", "サイト", "الصفحات", "עמודים",
    ],
    keywords: [
      "page", "pages", "route", "routes", "website", "site", "where", "link", "menu", "navigation",
      "página", "páginas", "sitio", "pagina", "site", "seite", "страница", "页面", "サイト", "صفحة", "עמוד",
    ],
    informalQuestions: [
      "what pages are on the website", "what pages does the site have", "which pages exist",
      "quais páginas tem no site", "quais paginas tem no site", "que páginas hay en el sitio",
      "what is on the website", "o que tem no site", "que hay en la web",
      "where is the pricing page", "onde fica a página de preços", "onde esta a pagina de precos",
    ],
    answer:
      "The public pages are Home, Pricing, How it works, About, Accounts, Contact, Login, Register, Complete profile, Reset password, Checkout, Checkout success, Dashboard, Terms, Privacy and Disclaimer. The footer links to every one of them.",
    body:
      "Public pages: / (home), /pricing (plans), /how-it-works (infrastructure overview), /about (company and leadership), /accounts (buy a prop-firm account and activate the signals plan), /contact (support form and email), /login, /register, /complete-profile, /reset-password, /auth-callback, /terms, /privacy and /disclaimer. The /checkout and /checkout/success pages handle payment. /dashboard requires a signed-in account. /register-application is a legacy link that redirects to /checkout?plan=<key>. Operator pages are internal and not customer pages. A missing page shows the 404 page.",
    relatedTopics: ["getting_started", "how_it_works", "plans"],
    links: ["/", "/pricing", "/about", "/contact"],
  },
  {
    id: "getting_started",
    category: "start",
    title: "Getting started",
    aliases: [
      "start", "begin", "first steps", "how to start", "get started", "sign me up",
      "começar", "comecar", "como começo", "como comeco", "primeiros passos", "por onde começo",
      "empezar", "cómo empiezo", "como empiezo", "primeros pasos", "iniziare", "come inizio",
      "commencer", "par où commencer", "anfangen", "wie fange ich an",
      "начать", "с чего начать", "开始", "如何开始", "はじめる", "ابدأ", "להתחיל",
    ],
    keywords: [
      "start", "begin", "first", "steps", "onboarding", "signup",
      "começar", "comecar", "início", "inicio", "empiezo", "empezar", "iniziare", "commencer", "anfangen", "начать", "开始", "開始", "ابدأ", "להתחיל",
    ],
    informalQuestions: [
      "how do i start", "how to start", "where do i start", "how do i begin", "what is the first step",
      "como começo", "como comeco", "por onde começo", "por onde comeco", "qual o primeiro passo", "como eu faço pra começar",
      "cómo empiezo", "como empiezo", "por dónde empiezo", "cuál es el primer paso", "quiero empezar",
      "come inizio", "da dove inizio", "comment je commence", "par où je commence", "wie fange ich an",
      "с чего начать", "как начать", "怎么开始", "从哪里开始", "何から始めればいい", "كيف أبدأ", "איך מתחילים",
      "i want to start", "quero começar", "quero comecar", "quiero comenzar", "me quiero registrar",
    ],
    answer:
      "Create an account, confirm your email, choose a plan and pay at checkout. After the payment is confirmed you complete the onboarding disclosures and request activation of your external prop-firm account.",
    body:
      "The documented order is: create an account on /register, confirm the email, choose one of the four monthly plans on /pricing, pay on /checkout, wait for the server-verified confirmation, complete the onboarding disclosures, then submit an account-link (activation) request for the external prop-firm account you will use. An operator reviews the activation manually. Finally you execute the signals yourself in your own account with a third-party tool. Braxel never operates the account, never stores broker credentials and never places orders. You can open /dashboard without a Tradovate connection and without identity verification.",
    relatedTopics: ["account_creation", "plans", "checkout", "onboarding", "activation"],
    links: ["/register", "/pricing", "/checkout", "/dashboard"],
  },
  {
    id: "how_it_works",
    category: "start",
    title: "How the service works",
    aliases: [
      "how it works", "how does it work", "how does the service work", "how does this work", "what is the process",
      "como funciona", "como é que funciona", "como isso funciona", "como o serviço funciona",
      "cómo funciona", "como funciona esto", "come funziona", "comment ça marche", "wie funktioniert das",
      "как это работает", "如何运作", "怎么运作", "仕組み", "كيف يعمل", "איך זה עובד",
    ],
    keywords: [
      "how it works", "process", "steps", "work", "service", "signals", "prop firm", "evaluation", "funded",
      "processo", "etapas", "serviço", "servicio", "fonctionnement", "prozess", "как работает", "如何运作", "仕組み", "كيف يعمل", "איך זה עובד",
    ],
    informalQuestions: [
      "how does this work", "how does it work exactly", "can you explain how it works", "what do you actually do",
      "quero saber como funciona isso", "como funciona isso", "como é que isso funciona", "me explica como funciona",
      "quiero saber cómo funciona esto", "cómo funciona esto", "explícame cómo funciona", "en qué consiste",
      "come funziona questo", "comment ça fonctionne", "wie funktioniert das genau",
      "расскажи как это работает", "这个怎么运作", "これはどういう仕組み", "كيف يعمل هذا بالضبط", "איך זה עובד בדיוק",
      "what is the business model", "qual é o modelo", "cuál es el modelo",
    ],
    answer:
      "You choose a plan, pay, complete onboarding, request activation of your own prop-firm account and then execute the signals yourself in that account with a third-party tool. Braxel never operates your account, never stores broker credentials and never places orders.",
    body:
      "The documented customer flow is: create an account, choose a plan, complete checkout, wait for the server-verified payment, complete onboarding and the required disclosures, submit an account-link (activation) request for your external prop-firm account, wait for manual operator review, then execute the signals yourself in your own account with a third-party tool. Braxel never operates your trading account, never stores broker credentials and never places orders. The public /how-it-works page is an infrastructure overview; some statements there are marked illustrative or unverified and are not a guarantee of performance.",
    relatedTopics: ["getting_started", "plans", "activation", "dashboard_usage"],
    links: ["/how-it-works", "/accounts", "/dashboard"],
  },
  {
    id: "company_overview",
    category: "company",
    title: "About Braxel Markets",
    aliases: [
      "about", "company", "who are you", "who is braxel", "founder", "ceo", "team", "address", "location",
      "empresa", "quem é vocês", "fundador", "endereço", "equipa", "equipo", "dirección", "adresse", "unternehmen", "компания", "公司", "会社", "الشركة", "חברה",
    ],
    keywords: [
      "about", "company", "who", "founded", "founder", "team", "leadership", "address", "location", "mission", "braxel",
      "empresa", "quem", "fundador", "equipa", "equipo", "endereço", "dirección", "adresse", "unternehmen", "компания", "公司", "会社", "الشركة", "חברה",
    ],
    informalQuestions: [
      "who are you guys", "who is behind braxel", "who founded braxel", "who owns braxel", "where are you based",
      "quem são vocês", "quem é o dono", "quem fundou a braxel", "onde vocês ficam", "de onde vocês são",
      "quiénes son", "quién fundó braxel", "dónde están ubicados", "chi siete", "qui est derrière braxel", "wer steckt dahinter",
      "кто вы", "кто основал", "你们是谁", "你们在哪里", "誰が運営していますか", "من أنتم", "מי אתם",
      "is braxel a prop firm", "braxel é uma prop firm", "braxel es una prop firm",
    ],
    answer:
      "Braxel Markets is a trading-technology and managed-service brand. It is not a prop firm, does not custody customer funds, does not process prop-firm payouts and does not guarantee returns.",
    body:
      "Braxel Markets is a trading-technology and managed-service brand. The About page describes its mission, history and leadership; the public leadership page names Bernardo Campi as Founder & CEO. The business address shown in the site footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain. Braxel is not a prop firm, does not custody customer funds and does not process prop-firm payouts. It does not guarantee returns. The marketing pages contain illustrative and unverified performance statements; treat them as marketing, not as a promise.",
    relatedTopics: ["contact_and_company", "how_it_works", "legal_documents"],
    links: ["/about", "/contact"],
  },
  {
    id: "account_creation",
    category: "account",
    title: "Account creation",
    aliases: [
      "register", "signup", "sign up", "create account", "open account", "new account", "registration",
      "cadastro", "cadastrar", "criar conta", "registrar", "abrir conta", "inscrição",
      "registrarse", "crear cuenta", "registro", "registrati", "creare un conto", "inscription",
      "créer un compte", "registrieren", "konto erstellen", "регистрация", "注册", "アカウント作成", "تسجيل", "הרשמה",
    ],
    keywords: [
      "account", "create", "register", "signup", "sign up", "new account", "open account",
      "cadastro", "registrar", "conta", "cuenta", "compte", "konto", "регистрация", "注册", "アカウント", "حساب", "חשבון",
    ],
    informalQuestions: [
      "how do i register", "how do i sign up", "how do i create an account", "i want to create an account", "how can i open an account",
      "como faço o cadastro", "como me cadastro", "como criar conta", "como faço pra criar conta", "quero criar uma conta",
      "cómo me registro", "cómo creo una cuenta", "quiero crear una cuenta", "cómo me inscribo",
      "come mi registro", "comment je m inscris", "wie registriere ich mich",
      "как зарегистрироваться", "怎么注册", "どうやって登録する", "كيف أسجل", "איך נרשמים",
      "do i need an account", "preciso criar conta", "necesito una cuenta",
    ],
    answer:
      "Use the Register page: full name, email, a password of at least 6 characters entered twice, and accept the Terms and Privacy Policy. Step 2 asks for phone, country and address.",
    body:
      "Create an account on the Register page. Step 1 asks for your full name, email, password (minimum 6 characters, entered twice) and acceptance of the Terms and Privacy Policy. Step 2 asks for phone, country and address. The email address must be confirmed before you can sign in. Braxel never asks for a broker password, card number, API key or any secret during signup. A signed-in customer whose profile is incomplete is sent to /complete-profile, and a profile read error never blocks the dashboard.",
    relatedTopics: ["email_confirmation", "profile_and_signup", "password_recovery", "getting_started"],
    links: ["/register", "/complete-profile"],
  },
  {
    id: "email_confirmation",
    category: "account",
    title: "Email confirmation",
    aliases: [
      "confirm email", "email confirmation", "verification email", "resend email", "activate email", "email link",
      "confirmar email", "confirmação de email", "confirmar e-mail", "email de confirmação", "reenviar email",
      "confirmar correo", "correo de confirmación", "verificar correo", "conferma email", "confirmer email",
      "email bestätigen", "подтвердить почту", "确认邮箱", "メール確認", "تأكيد البريد", "אימות דואל",
    ],
    keywords: [
      "email", "confirm", "confirmation", "verify", "verification email", "resend", "confirmation link",
      "confirmação", "confirmar", "correo", "bestätigen", "подтвердить", "确认", "確認", "تأكيد", "אימות",
    ],
    informalQuestions: [
      "how do i confirm my email", "i did not get the confirmation email", "the email never arrived", "resend the confirmation",
      "como confirmo meu email", "não recebi o email de confirmação", "nao recebi o email",
      "o email não chegou", "meu email não chegou", "meu e-mail não chegou", "meu email nao chegou",
      "reenviar confirmação",
      "cómo confirmo mi correo", "no me llegó el correo", "reenviar el correo de confirmación",
      "non ho ricevuto la mail", "je n ai pas reçu le mail", "ich habe keine mail bekommen",
      "не пришло письмо", "没有收到邮件", "メールが届かない", "لم يصل البريد", "לא קיבלתי את המייל",
      "my email is not verified", "email não verificado", "correo sin verificar",
    ],
    answer:
      "After signup Supabase Auth emails you a confirmation link; open it to activate sign-in. If it did not arrive, check the spam folder and resend it from the Login page.",
    body:
      "After signup Supabase Auth sends a confirmation email. Open the link in that email to activate sign-in; the link returns to /auth-callback. If the email did not arrive, check the spam folder, then use the resend action on the Login page. For privacy, the signup screen shows the same neutral message whether or not an address is already registered. Support can help with delivery problems but will never ask for your password or confirmation code. If the link is expired or already used, request a new one.",
    relatedTopics: ["account_creation", "password_recovery", "support_procedures"],
    links: ["/login", "/register", "/auth-callback"],
  },
  {
    id: "password_recovery",
    category: "account",
    title: "Password recovery and login problems",
    aliases: [
      "password", "reset password", "forgot password", "login", "log in", "sign in", "cannot login", "cant log in",
      "senha", "palavra-passe", "recuperar senha", "redefinir senha", "esqueci a senha", "não consigo entrar",
      "contraseña", "recuperar contraseña", "restablecer contraseña", "no puedo entrar", "no puedo iniciar sesión",
      "password dimenticata", "mot de passe oublié", "passwort vergessen", "пароль", "忘记密码", "パスワード", "كلمة المرور", "סיסמה",
    ],
    keywords: [
      "password", "reset", "forgot", "recover", "recovery", "login problem", "reset link", "sign in",
      "senha", "recuperar", "contraseña", "mot de passe", "passwort", "пароль", "密码", "パスワード", "كلمة المرور", "סיסמה",
    ],
    informalQuestions: [
      "how do i reset my password", "i forgot my password", "i cant log in", "i cannot sign in", "login is not working",
      "the reset link does not work", "how do i change my password", "i lost my password",
      "como redefinir a minha senha", "esqueci a minha senha", "não consigo entrar", "nao consigo entrar", "não consigo fazer login",
      "não lembro a senha", "como troco a senha", "o link de recuperação não funciona",
      "nao consigo logar", "não consigo logar", "consigo logar", "consigo entrar", "consigo acessar",
      "não consigo acessar minha conta", "nao consigo acessar",
      "can t login", "cannot log in", "login not working", "i cant get in", "i cannot get into my account",
      "olvidé mi contraseña", "no puedo entrar", "no puedo iniciar sesión", "cómo restablezco mi contraseña",
      "no puedo loguearme", "no puedo acceder a mi cuenta", "no me deja entrar",
      "ho dimenticato la password", "j ai oublié mon mot de passe", "ich habe mein passwort vergessen",
      "не могу войти", "забыл пароль", "登录不了", "密码忘了", "ログインできない", "パスワードを忘れた", "لا أستطيع الدخول", "שכחתי סיסמה",
    ],
    answer:
      "Use 'Forgot password?' on the Login page. We email a recovery link that opens the Reset Password page, where you set a new password. The link expires and works once.",
    body:
      "Use 'Forgot password?' on the Login page. We email a recovery link that opens the Reset Password page, where you set a new password. The link expires and can only be used once; if it is expired or already used, request a new one. A recovery link never grants dashboard access without setting a new password. Braxel support will never ask you to send your password. A normal signed-in session on /reset-password is treated as an invalid reset link. If the sign-in fails because the email is not confirmed yet, resend the confirmation email from the Login page.",
    relatedTopics: ["email_confirmation", "account_creation", "support_procedures"],
    links: ["/login", "/reset-password"],
  },
  {
    id: "profile_and_signup",
    category: "account",
    title: "Profile and signup details",
    aliases: [
      "profile", "my profile", "personal details", "phone number", "address", "billing details", "edit my data",
      "perfil", "meu perfil", "meus dados", "telefone", "endereço", "morada", "meus dados pessoais",
      "mi perfil", "mis datos", "teléfono", "dirección", "profil", "meine daten", "telefon", "adresse",
      "профиль", "个人资料", "プロフィール", "الملف الشخصي", "פרופיל",
    ],
    keywords: [
      "profile", "phone", "country", "address", "personal information", "my profile", "billing details",
      "perfil", "telefone", "endereço", "morada", "teléfono", "dirección", "profil", "telefon", "adresse", "профиль", "个人资料", "プロフィール", "الملف الشخصي", "פרופיל",
    ],
    informalQuestions: [
      "can i edit my profile", "how do i change my phone number", "where do i change my address", "how do i update my details",
      "como edito meu perfil", "como troco meu telefone", "onde mudo meu endereço", "como atualizo meus dados",
      "cómo edito mi perfil", "cómo cambio mi teléfono", "dónde cambio mi dirección",
      "come modifico il profilo", "comment modifier mon profil", "wie ändere ich mein profil",
      "как изменить профиль", "怎么修改资料", "プロフィールを変更するには", "كيف أعدل ملفي", "איך לעדכן פרופיל",
      "why do you need my address", "por que pedem meu endereço", "por qué piden mi dirección",
    ],
    answer:
      "Your profile holds your name, email, phone (dial code + number), country and address, and you can edit it in 'My profile' in the dashboard. Braxel never stores a password or a card number there.",
    body:
      "Your profile stores your name, email, phone (country dial code plus national number), country and address. You can review and edit it in the 'My profile' view of the dashboard. Profile writes go through the authenticated profile-submit function, which re-validates every field server-side. Checkout can pre-fill these details from your profile and lets you update the profile from the billing form. Braxel never stores a password or a card number in your profile.",
    relatedTopics: ["account_creation", "checkout", "dashboard_usage"],
    links: ["/complete-profile", "/dashboard"],
  },
  {
    id: "plans",
    category: "plans",
    title: "Plans and pricing",
    aliases: [
      "plan", "plans", "pricing", "price", "cost", "how much", "subscription", "monthly fee", "tiers",
      "plano", "planos", "preço", "precos", "valor", "quanto custa", "mensalidade",
      "planes", "precio", "cuánto cuesta", "suscripción", "piani", "prezzo", "quanto costa",
      "forfait", "prix", "combien ça coûte", "preis", "kosten", "тариф", "цена", "套餐", "价格", "料金", "プラン", "خطة", "السعر", "תוכנית", "מחיר",
    ],
    keywords: [
      "plan", "plans", "price", "pricing", "cost", "how much", "subscription", "monthly", "managed capital", "fee", "tier",
      "plano", "preço", "precio", "tarif", "preis", "тариф", "价格", "料金", "خطة", "السعر", "תוכנית", "מחיר",
    ],
    informalQuestions: [
      "how much does it cost", "how much is the starter plan", "what are the prices", "how much do you charge",
      "what plans do you have", "which plan should i pick", "i want the 200 plan", "the 200 dollar plan", "that plan of 200",
      "quanto custa", "quanto é", "quais são os planos", "quero aquele plano de 200", "quero o plano de 200", "o plano de 200",
      "qual plano vocês têm", "quanto vocês cobram", "qual o valor do plano",
      "cuánto cuesta", "cuánto vale", "qué planes tienen", "quiero el plan de 200", "el plan de doscientos",
      "quanto costa", "combien ça coûte", "was kostet das", "welche pläne gibt es",
      "сколько стоит", "какие тарифы", "多少钱", "什么套餐", "いくらですか", "料金は", "كم السعر", "כמה זה עולה",
      "is it monthly", "é mensal", "es mensual", "do i pay every month",
      "what do i get", "o que eu recebo", "qué obtengo", "que incluye", "o que vem",
    ],
    answer: `Braxel has four monthly plans, all charged in USD: ${planFacts()} The plan summary at checkout is the authoritative amount.`,
    body:
      `Braxel offers four monthly plans. ${planFacts()} All amounts are charged in USD. The plan summary at checkout is the authoritative amount; the server derives the plan, amount and currency and the browser never declares a price. The Pricing page shows the current plan cards. Local currency, where shown, is presentation only; Managed Capital is always quoted in USD.`,
    relatedTopics: ["checkout", "payment_methods", "accounts_prop_firms"],
    links: ["/pricing", "/checkout"],
  },
  {
    id: "accounts_prop_firms",
    category: "product",
    title: "Prop-firm accounts and affiliate links",
    aliases: [
      "prop firm", "tradeify", "lucid", "affiliate", "buy account", "funded account", "evaluation account", "prop account",
      "corretora", "conta de prop firm", "conta financiada", "afiliado", "comprar conta",
      "cuenta de prop firm", "cuenta fondeada", "afiliado", "comprar cuenta", "conto finanziato", "compte financé",
      "prop firma", "finanziertes konto", "проп-фирма", "проп-счет", "自营交易账户", "プロップファーム", "حساب شركة", "חשבון פרופ",
    ],
    keywords: [
      "accounts page", "buy account", "prop firm", "tradeify", "lucid", "affiliate", "commission", "evaluation", "funded account",
      "comprar conta", "corretora", "afiliado", "comisión", "comprar cuenta", "compte", "konto kaufen", "аккаунт проп-фирмы", "购买账户", "口座購入", "شراء حساب", "קניית חשבון",
    ],
    informalQuestions: [
      "how do i buy a prop firm account", "do you sell funded accounts", "which firms do you work with", "is tradeify supported",
      "do i get an account from you", "is lucid available", "do you make money from the affiliate link",
      "como compro uma conta de prop firm", "vocês vendem conta", "quais corretoras vocês usam", "a tradeify funciona aqui",
      "vocês ganham comissão", "a conta é minha",
      "cómo compro una cuenta de prop firm", "ustedes venden cuentas", "qué firmas usan", "la cuenta es mía",
      "come compro un conto", "comment acheter un compte", "wie kaufe ich ein konto",
      "как купить аккаунт проп-фирмы", "怎么买账户", "口座はどこで買う", "كيف أشتري حساب", "איך קונים חשבון",
    ],
    answer:
      "You buy the evaluation or funded account directly from the prop firm (Tradeify or Lucid) through our affiliate link and keep ownership of it. Braxel receives an affiliate commission and never operates or accesses the account.",
    body:
      "The /accounts page lets you buy an evaluation or funded account directly from a prop firm (Tradeify or Lucid) through a real affiliate link. Braxel receives an affiliate commission, which does not change the price you pay to the firm. You buy and own the account directly from the firm; Braxel does not operate it and never has access to it. After buying, return to the panel and request activation of the signals plan, attaching your purchase receipt. The signals plan is a fixed monthly fee, and you execute the signals yourself in your own account with a third-party tool. Trading involves a substantial risk of loss; the page includes a risk warning. A firm without a configured affiliate link is not offered anywhere.",
    relatedTopics: ["activation", "plans", "tradovate_connection", "legal_documents"],
    links: ["/accounts", "/pricing"],
  },
  {
    id: "checkout",
    category: "payment",
    title: "Checkout",
    aliases: [
      "checkout", "pay", "payment page", "how to pay", "buy plan", "purchase", "billing", "order",
      "pagamento", "pagar", "como pago", "finalizar compra", "comprar plano", "compra", "cobrança",
      "pago", "cómo pago", "comprar plan", "paiement", "payer", "zahlung", "bezahlen",
      "оплата", "как оплатить", "支付", "怎么付款", "支払い", "الدفع", "كيف أدفع", "תשלום", "איך משלמים",
    ],
    keywords: [
      "checkout", "pay", "purchase", "order", "billing", "consent", "terms acceptance",
      "pagamento", "pagar", "compra", "pago", "zahlung", "оплата", "支付", "支払い", "الدفع", "תשלום",
    ],
    informalQuestions: [
      "how do i pay", "how do i pay for a plan", "where do i pay", "how does checkout work", "how do i buy the plan",
      "mano como pago", "como pago", "como eu pago", "onde eu pago", "como faço o pagamento", "como compro o plano",
      "quero pagar", "como finalizo a compra", "como pago o plano",
      "cómo pago", "dónde pago", "cómo compro el plan", "quiero pagar", "cómo finalizo la compra",
      "come pago", "comment je paie", "wie bezahle ich", "как оплатить", "как я могу заплатить", "怎么付款", "怎么买", "どうやって支払う", "كيف أدفع", "איך משלמים",
    ],
    answer:
      "Checkout is one page: plan summary, your billing details and the payment method. Accept Terms and Privacy, then pay by card (Stripe hosted page), bank transfer or crypto when the server has it configured.",
    body:
      "Checkout is a single page: plan summary, your billing details and the payment method selector. Terms and Privacy must be accepted before paying. The server re-derives the plan, amount, currency and interval; a ?plan= query only selects the plan and never sets a price. Card payments open Stripe's hosted Checkout; our app has no card fields and never sees your card number. Bank transfer shows the configured bank details and a reference and is settled manually. Crypto is available only for networks the server has configured, and you must send the exact asset on the exact network shown. A repeated checkout can answer duplicate_checkout instead of charging twice.",
    relatedTopics: ["payment_methods", "payment_status", "plans"],
    links: ["/checkout", "/pricing"],
  },
  {
    id: "payment_methods",
    category: "payment",
    title: "Card, bank transfer and crypto",
    aliases: [
      "card", "stripe", "credit card", "bank transfer", "wise", "crypto", "bitcoin", "btc", "usdt", "ethereum", "network", "currency", "usd", "payment method",
      "cartão", "transferência", "banco", "cripto", "moeda", "dólar", "tarjeta", "transferencia", "carte", "virement", "karte", "überweisung", "карта", "перевод", "криптовалюта", "银行卡", "转账", "加密货币", "بطاقة", "تحويل", "כרטיס", "העברה",
    ],
    keywords: [
      "card", "stripe", "bank", "bank transfer", "wise", "crypto", "bitcoin", "btc", "usdt", "eth", "network", "wallet", "currency", "usd",
      "cartão", "transferência", "banco", "tarjeta", "transferencia", "carte", "virement", "karte", "überweisung", "карта", "перевод", "银行卡", "转账", "加密货币", "بطاقة", "تحويل", "כרטיס", "העברה",
    ],
    informalQuestions: [
      "can i pay with crypto", "do you accept card", "can i pay by bank transfer", "which payment methods do you accept",
      "can i pay with paypal", "is there pix", "what currency do you charge in", "is it in dollars",
      "posso pagar com cripto", "aceita cartão", "posso pagar por transferência", "quais formas de pagamento",
      "tem pix", "posso pagar com paypal", "cobram em dólar", "é em dólar",
      "puedo pagar con cripto", "aceptan tarjeta", "puedo pagar por transferencia", "qué métodos de pago tienen",
      "hay pix", "puedo pagar con paypal", "cobran en dólares",
      "posso pagare con cripto", "je peux payer par carte", "kann ich mit krypto zahlen",
      "можно оплатить картой", "можно криптой", "可以刷卡吗", "能用加密货币吗", "カードで払えますか", "هل أدفع ببطاقة", "אפשר לשלם בכרטיס",
    ],
    answer:
      "Card opens Stripe's hosted checkout (our app has no card fields), bank transfer shows the configured bank details and a reference and is reviewed manually, and crypto works only on the networks the server has configured. Everything is charged in USD.",
    body:
      "Card: 'Continue to secure card payment' redirects to Stripe's hosted Checkout. Our app has no card fields; the server keeps the USD Price ID, the canonical amount and the application ownership. Confirmation comes only from the Stripe webhook or the server reconciliation, never from a browser redirect. Bank transfer (Wise): the server returns the configured bank details and a reference and records the payment as pending manual review; the instructions are not proof of payment and there is no client-side success. Crypto: only networks configured on the server are selectable; you must send the exact asset on the exact network shown, and sending on the wrong network can lose the funds. Confirmation is on-chain and server-side. All charges are in USD. PayPal and direct card endpoints are disabled; do not promise them.",
    relatedTopics: ["checkout", "payment_status", "security_privacy"],
    links: ["/checkout", "/checkout/success"],
  },
  {
    id: "payment_status",
    category: "payment",
    title: "Payment status and states",
    aliases: [
      "payment status", "payment state", "did my payment go through", "order status", "payment stuck", "payment pending",
      "status do pagamento", "meu pagamento", "pagamento pendente", "pagamento não aparece", "paguei e não aparece",
      "estado del pago", "mi pago", "pago pendiente", "no aparece mi pago", "stato del pagamento", "statut du paiement",
      "zahlungsstatus", "статус оплаты", "支付状态", "支払い状況", "حالة الدفع", "סטטוס תשלום",
    ],
    keywords: [
      "payment status", "paid", "pending", "processing", "confirmed", "failed", "stuck", "not showing", "receipt", "status", "duplicate",
      "pagamento", "pendente", "pago", "zahlung", "оплата", "支付状态", "支払い状況", "حالة الدفع", "סטטוס תשלום",
    ],
    informalQuestions: [
      "what is the payment status", "did my payment go through", "my payment is still pending", "i paid but nothing happened",
      "why is my payment pending", "payment is stuck", "the status did not change", "how long does confirmation take",
      "paguei e não apareceu", "meu pagamento está pendente", "por que ainda está pendente", "paguei e nada",
      "quanto tempo demora para confirmar", "o pagamento não aparece", "o status do meu pagamento",
      "pagué y no aparece", "mi pago sigue pendiente", "cuánto tarda la confirmación", "por qué está pendiente",
      "ho già pagato", "j ai déjà payé", "ich habe schon bezahlt",
      "я уже оплатил", "оплата не пришла", "我已经付了", "付款还没确认", "支払ったのに反映されない", "دفعت ولم يظهر", "שילמתי וזה לא מופיע",
    ],
    answer:
      "The dashboard payment card and the checkout success page show the server-side status. Only a server-verified confirmation marks a payment as confirmed; card events can take a short time and bank transfers are reviewed manually. If it looks wrong, do not pay twice.",
    body:
      "The dashboard payment card and the checkout success page show the server-side status. Only a server-verified confirmation marks a payment as confirmed and unlocks onboarding; a browser redirect or a URL parameter never confirms a payment. The states the dashboard can show are created, pending, processing, manual review, confirmed, activation pending, active, failed, expired, cancelled, refunded, disputed, past due, suspended and disconnected. Card confirmations normally arrive through the payment provider webhook and can take a short time; bank transfers are reviewed manually. A lost card event can be recovered by the server reconciliation endpoint. If a payment looks wrong, do not pay twice. Contact human support with your order reference; the assistant cannot read or change your payment status.",
    relatedTopics: ["checkout", "payment_methods", "onboarding", "refunds_cancellation"],
    links: ["/checkout/success", "/dashboard"],
  },
  {
    id: "refunds_cancellation",
    category: "payment",
    title: "Refunds and cancellation",
    aliases: [
      "refund", "refunded", "cancel", "cancellation", "cancel plan", "cancel subscription", "money back", "chargeback",
      "reembolso", "cancelar", "cancelamento", "cancelar plano", "devolver", "estorno",
      "reembolso", "cancelación", "devolución", "rimborso", "annullare", "remboursement", "annuler",
      "rückerstattung", "kündigen", "возврат", "отмена", "退款", "取消", "返金", "キャンセル", "استرداد", "إلغاء", "החזר", "ביטול",
    ],
    keywords: [
      "refund", "refunded", "cancel", "cancellation", "cancel plan", "money back", "chargeback",
      "reembolso", "cancelar", "cancelamento", "cancelación", "remboursement", "annuler", "rückerstattung", "kündigen", "возврат", "отмена", "退款", "取消", "返金", "キャンセル", "استرداد", "إلغاء", "החזר", "ביטול",
    ],
    informalQuestions: [
      "can i get a refund", "how do i cancel my plan", "i want my money back", "how do i cancel the subscription",
      "quero cancelar", "quero cancelar meu plano", "posso cancelar", "como peço reembolso", "quero meu dinheiro de volta",
      "quiero cancelar", "puedo cancelar mi plan", "cómo pido un reembolso", "quiero mi dinero de vuelta",
      "voglio annullare", "je veux annuler", "ich möchte kündigen", "хочу отменить", "хочу вернуть деньги",
      "我要退款", "怎么取消", "解約したい", "أريد استرداد", "אני רוצה לבטל",
    ],
    answer:
      "The site publishes no refund schedule and no self-service cancellation button. Refund and cancellation requests are reviewed by a person — contact human support with your account email and order reference.",
    body:
      "The public pages do not publish a refund schedule or a self-service cancellation button. Refund and cancellation requests are reviewed by a person. Contact human support by email with your account email and order reference. Do not open a chargeback or pay twice while a request is being reviewed. The assistant cannot approve a refund, cancel a plan or change a payment status.",
    relatedTopics: ["payment_status", "support_procedures", "legal_documents"],
    links: ["/contact", "/terms"],
  },
  {
    id: "onboarding",
    category: "product",
    title: "Onboarding after payment",
    aliases: [
      "onboarding", "after payment", "next step", "what now", "disclosures", "account link", "link account",
      "integração", "incorporação", "próximo passo", "depois do pagamento", "o que faço agora",
      "incorporación", "siguiente paso", "después del pago", "nach der zahlung", "онбординг", "入门", "オンボーディング", "التهيئة", "קליטה",
    ],
    keywords: [
      "onboarding", "after payment", "next step", "disclosures", "start", "account link", "link account",
      "integração", "incorporação", "incorporación", "онбординг", "入门", "オンボーディング", "التهيئة", "קליטה",
    ],
    informalQuestions: [
      "what happens after payment", "what do i do after paying", "i already paid what now", "what is the next step",
      "já paguei e agora", "ja paguei e agora", "paguei o que faço agora", "qual o próximo passo", "depois de pagar o que faço",
      "o que acontece depois do pagamento", "já fiz o pagamento e agora",
      "quando chega meu acesso", "quando recebo o acesso", "quando liberam o acesso",
      "ya pagué y ahora", "qué hago después de pagar", "cuál es el siguiente paso", "ya pagué qué sigue",
      "cuándo me llega el acceso", "cuándo recibo el acceso",
      "ho pagato e adesso", "j ai payé et maintenant", "ich habe bezahlt was jetzt",
      "when do i get access", "when do i receive access", "i already paid", "i paid already",
      "já paguei", "ja paguei", "ja paguei e agora",
      "я оплатил что дальше", "付了钱之后呢", "支払った後は", "دفعت ماذا الآن", "שילמתי מה עכשיו",
    ],
    answer:
      "After a confirmed payment the dashboard shows the onboarding steps and the required disclosures. Complete them, then submit the account-link request for the external prop-firm account you will use, and an operator reviews it manually.",
    body:
      "After a confirmed payment, the dashboard shows the onboarding steps and the required disclosures: your package, the payment status and the account-link request. Complete the disclosures, then submit an account-link request for the external prop-firm account you intend to use. An operator reviews the request manually. The dashboard shows pending, in review, information requested, approved, rejected, suspended or disconnected. Braxel does not receive your provider password, API key or token, never operates your trading account and never stores broker credentials.",
    relatedTopics: ["activation", "payment_status", "dashboard_usage"],
    links: ["/dashboard", "/checkout/success"],
  },
  {
    id: "activation",
    category: "product",
    title: "Account activation",
    aliases: [
      "activate", "activation", "activate account", "account activation", "receipt", "proof of purchase", "operator review",
      "ativação", "ativar", "ativar conta", "comprovativo", "comprovante", "revisão",
      "activación", "activar", "activar cuenta", "comprobante", "revisión", "attivazione", "attivare",
      "aktivierung", "активация", "активировать", "激活", "アクティベーション", "تفعيل", "הפעלה",
    ],
    keywords: [
      "activate", "activation", "evaluation", "funded", "signals", "receipt", "proof of purchase", "operator review",
      "ativação", "ativar", "activación", "aktivierung", "активация", "激活", "アクティベーション", "تفعيل", "הפעלה",
    ],
    informalQuestions: [
      "how do i activate my account", "how do i request activation", "how long does activation take", "why is my activation pending",
      "how do i activate the plan", "what do i upload to activate",
      "como ativo minha conta", "como ativo o plano", "como peço ativação", "quanto tempo demora a ativação",
      "como ativar", "o que envio para ativar",
      "cómo activo mi cuenta", "cómo pido la activación", "cuánto tarda la activación", "cómo activo el plan",
      "come attivo", "comment activer", "wie aktiviere ich", "как активировать", "как активировать аккаунт",
      "怎么激活", "激活要多久", "どうやって有効化する", "كيف أفعل الحساب", "איך מפעילים",
      "my activation is still in review", "minha ativação está em análise", "mi activación está en revisión",
    ],
    answer:
      "Request activation in the dashboard with the firm, the plan you bought, your account login/ID at the firm, the purchase email, a receipt (image or PDF up to 10 MB) and four confirmations. An operator reviews it manually; never enter your broker password.",
    body:
      "You buy an evaluation or funded account directly from the prop firm through our affiliate link, then request activation in the dashboard. The activation form asks for the firm, the plan you bought, your account login/ID at the firm, the purchase email, a receipt (image or PDF, up to 10 MB) and four mandatory confirmations. Never enter your broker password: Braxel only needs the account login/ID and the receipt. Activation is reviewed manually by an operator; approval is not automatic and is not guaranteed. Braxel does not operate your account, does not place orders and does not process prop-firm payouts. You execute the signals yourself in your own account.",
    relatedTopics: ["onboarding", "accounts_prop_firms", "dashboard_usage"],
    links: ["/accounts", "/dashboard"],
  },
  {
    id: "dashboard_usage",
    category: "product",
    title: "Dashboard features",
    aliases: [
      "dashboard", "terminal", "panel", "performance", "audit log", "services", "my account area",
      "painel", "terminal", "desempenho", "meu painel", "onde vejo minha conta", "minha área",
      "panel", "rendimiento", "mi panel", "dónde veo mi cuenta", "tableau de bord", "übersicht", "панель", "仪表盘", "ダッシュボード", "لوحة التحكم", "לוח בקרה",
    ],
    keywords: [
      "dashboard", "terminal", "performance", "audit log", "profile", "settings", "navigation", "services", "payments", "withdrawal",
      "painel", "panel", "tableau de bord", "übersicht", "панель", "仪表盘", "ダッシュボード", "لوحة التحكم", "לוח בקרה",
    ],
    informalQuestions: [
      "what is in the dashboard", "where do i see my account", "where can i see my performance", "how do i open the panel",
      "where is my area", "what can i do in the dashboard", "where do i see my trades",
      "onde vejo minha conta", "minha conta", "minha area", "meu painel", "onde fica minha conta",
      "onde vejo meu desempenho", "como abro o painel", "o que tem no painel", "onde fica minha área",
      "dónde veo mi cuenta", "mi cuenta", "mi panel", "dónde veo mi rendimiento",
      "cómo abro el panel", "qué hay en el panel",
      "dove vedo il mio conto", "où est mon tableau de bord", "wo sehe ich mein konto",
      "my account", "where is my account", "my dashboard",
      "где посмотреть мой аккаунт", "где мой кабинет", "在哪里看我的账户", "我的面板在哪", "マイページはどこ", "أين أرى حسابي", "איפה רואה את החשבון",
    ],
    answer:
      "The dashboard has your services, the payment card, account activation, your profile, performance and an audit log. Performance is computed only from your own closed trades, and you can use the dashboard without Tradovate and without KYC.",
    body:
      "The dashboard has a services overview, a payments card, an optional Tradovate view, account activation, your profile, performance and an audit log. Performance is computed only from your own closed trades; with no closed trades you see an explicit empty state rather than a fabricated number. Every figure is real account data. The dashboard is reachable without a Tradovate connection and without KYC; identity verification is only required to request a withdrawal.",
    relatedTopics: ["activation", "tradovate_connection", "profile_and_signup", "withdrawal_kyc"],
    links: ["/dashboard"],
  },
  {
    id: "tradovate_connection",
    category: "product",
    title: "Tradovate connection (read-only)",
    aliases: [
      "tradovate", "connection", "connect", "broker connection", "account status", "disconnect", "demo", "live", "read only",
      "conexão", "conectar", "tradovate", "desconectar", "somente leitura", "conexión", "conectar", "solo lectura",
      "connexion", "verbindung", "подключение", "连接", "接続", "اتصال", "חיבור",
    ],
    keywords: [
      "tradovate", "connection", "connect", "broker", "account status", "disconnect", "demo", "live", "read-only",
      "conexão", "conectar", "conexión", "connexion", "verbindung", "подключение", "连接", "接続", "اتصال", "חיבור",
    ],
    informalQuestions: [
      "is tradovate read only", "does this connect to my prop firm account", "does it connect to tradeify", "can you trade for me",
      "can i connect my broker", "is there copy trading", "do you place orders on my account",
      "isso conecta na minha tradeify", "isso conecta na minha conta", "conecta na tradeify", "vocês operam minha conta",
      "tem copy trade", "vocês colocam ordens", "é somente leitura",
      "esto se conecta a mi cuenta", "se conecta con mi cuenta", "se conecta a mi cuenta",
      "conecta con mi cuenta", "se conecta con mi tradeify", "ustedes operan mi cuenta", "hay copy trading",
      "si collega al mio conto", "ça se connecte à mon compte", "verbindet sich das mit meinem konto",
      "como funciona a tradovate", "how does tradovate work", "como funciona tradovate",
      "это подключается к моему счету", "вы торгуете за меня", "这个连接我的账户吗", "我的账户会自动交易吗", "私の口座に接続しますか", "هل يتصل بحسابي", "זה מתחבר לחשבון שלי",
    ],
    answer:
      "Tradovate is an optional, read-only integration that never connects to your prop-firm account: you execute the signals yourself. Braxel cannot place, modify or liquidate orders, withdraw or transfer money, and never asks for your Tradovate username, password, CID or secret.",
    body:
      "Tradovate is an optional, read-only integration. When the feature is enabled, the dashboard shows a connection card and the current status; the connect flow runs inside the dashboard and defaults to the demo environment. Credentials are encrypted server-side and never returned to the browser. The user never types an account id: the server lists the accounts on the Tradovate login and auto-selects or preselects an active account. Data is collected by incremental polling, not a WebSocket. The integration is read-only: Braxel cannot place, modify or liquidate orders, withdraw funds or transfer money, and there is no copy-trading engine. It does not connect to a prop-firm account such as Tradeify or Lucid: those accounts are bought and operated by you. The support assistant cannot connect, disconnect or change your Tradovate status and will never ask for your Tradovate username, password, CID or secret. For connection errors or provider problems, contact human support.",
    relatedTopics: ["accounts_prop_firms", "dashboard_usage", "account_actions"],
    links: ["/dashboard", "/how-it-works"],
  },
  {
    id: "withdrawal_kyc",
    category: "product",
    title: "Withdrawals and identity verification",
    aliases: [
      "withdrawal", "withdraw", "kyc", "identity verification", "id verification", "document upload", "compliance", "payout",
      "levantamento", "saque", "verificação de identidade", "documento", "retirada",
      "retiro", "verificación de identidad", "documento", "retrait", "vérification", "auszahlung", "verifizierung",
      "вывод", "верификация", "提现", "身份验证", "出金", "本人確認", "سحب", "التحقق", "משיכה", "אימות",
    ],
    keywords: [
      "withdrawal", "withdraw", "kyc", "identity", "verification", "document", "selfie", "compliance", "payout",
      "levantamento", "saque", "verificação", "documento", "retiro", "verificación", "retrait", "vérification", "auszahlung", "verifizierung", "вывод", "верификация", "提现", "身份验证", "出金", "本人確認", "سحب", "التحقق", "משיכה", "אימות",
    ],
    informalQuestions: [
      "what documents are needed for a withdrawal", "do i need kyc", "is kyc required", "how do i withdraw",
      "why do you need my id", "do i have to verify my identity", "how do i send my documents",
      "preciso de kyc", "é preciso verificação", "como faço o saque", "quais documentos preciso", "onde envio meus documentos",
      "necesito kyc", "hace falta verificación", "cómo hago el retiro", "qué documentos necesito", "dónde envío mis documentos",
      "serve la verifica", "faut il une vérification", "brauche ich kyc", "нужна верификация", "как вывести", "需要身份验证吗", "出金には何が必要", "هل أحتاج التحقق", "צריך אימות",
      "como funciona o kyc", "como funciona a verificacao", "how does kyc work", "como funciona el kyc",
      "what is kyc", "o que e kyc", "que es kyc",
    ],
    answer:
      "The dashboard works without identity verification; KYC is required only when you request a withdrawal and the request is checked on the server. Upload documents through the authenticated page and never send identity documents in this chat.",
    body:
      "The terminal is usable without identity verification. KYC is required only when you request a withdrawal. Withdrawal requests are gated server-side: without an approved submission the server refuses the request, and a status sent from the browser is ignored. Documents are uploaded through an authenticated function into a private bucket; only object paths are stored, never public URLs. An AI consistency check is advisory and fails closed to human review. Never send identity documents through this chat. For a withdrawal or KYC problem, contact human support.",
    relatedTopics: ["dashboard_usage", "support_procedures", "security_privacy"],
    links: ["/dashboard", "/contact"],
  },
  {
    id: "support_procedures",
    category: "support",
    title: "Support procedures",
    aliases: [
      "support", "contact support", "human support", "talk to someone", "email support", "ticket", "complaint",
      "suporte", "contato", "falar com alguém", "atendimento", "reclamação",
      "soporte", "contacto", "hablar con alguien", "atención", "reclamación",
      "assistenza", "kontakt", "support", "поддержка", "支持", "サポート", "الدعم", "תמיכה",
    ],
    keywords: [
      "support", "contact", "human", "email", "response", "ticket", "escalation", "complaint",
      "suporte", "contato", "soporte", "contacto", "kontakt", "поддержка", "支持", "サポート", "الدعم", "תמיכה",
    ],
    informalQuestions: [
      "how do i contact support", "what is your email", "how do i reach a human", "i need help with my account",
      "who do i talk to", "how do i open a ticket", "i want to speak to someone",
      "como falo com o suporte", "qual o email de vocês", "como falo com um humano", "preciso de ajuda com minha conta",
      "com quem eu falo", "quero falar com alguém", "como abro um ticket",
      "cómo contacto al soporte", "cuál es su correo", "cómo hablo con un humano", "necesito ayuda con mi cuenta",
      "con quién hablo", "quiero hablar con alguien",
      "come contatto il supporto", "comment contacter le support", "wie erreiche ich den support",
      "как связаться с поддержкой", "какой у вас email", "怎么联系客服", "客服邮箱", "サポートに連絡するには", "كيف أتواصل مع الدعم", "איך ליצור קשר עם התמיכה",
    ],
    answer:
      "Human support is the Contact page or marketsbraxel@ouvidor.net. Include your account email, the plan or order reference and a short description, and never include passwords, card numbers or API keys.",
    body:
      "Human support is reached through the Contact page or the support email marketsbraxel@ouvidor.net. Include your account email, the plan or order reference and a short description. Never include passwords, card numbers, API keys, MFA codes or private keys in a support message. The AI assistant can explain the product and the official procedures, but it cannot change your account, payment or activation status. Payment disputes, KYC, account suspension, legal questions, provider problems, refunds and explicit human requests are always handed to a person.",
    relatedTopics: ["contact_and_company", "account_actions", "faq_help"],
    links: ["/contact"],
  },
  {
    id: "contact_and_company",
    category: "company",
    title: "Contact details and business address",
    aliases: [
      "contact", "contact details", "business address", "where are you located", "office", "opening hours", "phone number",
      "contato", "endereço", "morada", "onde ficam", "telefone", "horário",
      "contacto", "dirección", "dónde están", "teléfono", "horario", "adresse", "telefon", "öffnungszeiten",
      "контакты", "адрес", "联系", "地址", "連絡先", "العنوان", "כתובת",
    ],
    keywords: [
      "contact", "address", "email", "contact details", "email address", "business address", "where are you", "office", "hours", "phone",
      "contacto", "endereço", "morada", "dirección", "adresse", "kontakt", "адрес", "联系", "連絡先", "العنوان", "כתובת",
    ],
    informalQuestions: [
      "what is your address", "where are you located", "do you have a phone number", "what are your opening hours",
      "how do i find you", "where is your office", "what is your email address",
      "qual é o endereço de vocês", "qual o endereço de vocês", "qual o endereco de voces",
      "onde vocês estão", "vocês têm telefone", "qual o horário de atendimento",
      "como encontro vocês", "onde fica o escritório", "qual o email",
      "cuál es su dirección", "cuál es la dirección", "dónde están ubicados", "tienen teléfono",
      "cuál es su horario",
      "dónde está la oficina", "cuál es su correo",
      "qual è il vostro indirizzo", "quelle est votre adresse", "wie ist ihre adresse",
      "какой у вас адрес", "где вы находитесь", "你们的地址", "你们在哪里", "住所はどこ", "ما هو عنوانكم", "מה הכתובת שלכם",
    ],
    answer:
      "The public contact email is marketsbraxel@ouvidor.net. The business address in the footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain.",
    body:
      "The public contact email is marketsbraxel@ouvidor.net, shown on the Contact page and in the footer. The business address shown in the footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain. The Contact page also has a message form with a security challenge. Do not send passwords or identity documents through the form. The site does not publish a telephone number or a guaranteed response time; response times vary.",
    relatedTopics: ["support_procedures", "company_overview"],
    links: ["/contact"],
  },
  {
    id: "faq_help",
    category: "support",
    title: "FAQ and help topics",
    aliases: [
      "faq", "questions", "frequently asked", "beginner", "experience", "how does the system work", "help topics",
      "perguntas frequentes", "dúvidas", "iniciante", "experiência", "ajuda",
      "preguntas frecuentes", "dudas", "principiante", "experiencia", "ayuda",
      "domande frequenti", "faq", "fragen", "вопросы", "常见问题", "よくある質問", "الأسئلة الشائعة", "שאלות נפוצות",
    ],
    keywords: [
      "faq", "questions", "experience", "beginner", "risk", "cancel plan", "how does it work", "help",
      "perguntas", "dúvidas", "experiência", "risco", "preguntas", "experiencia", "riesgo", "questions", "risque", "fragen", "risiko", "вопросы", "риск", "常见问题", "风险", "よくある質問", "リスク", "الأسئلة", "المخاطر", "שאלות", "סיכון",
    ],
    informalQuestions: [
      "where can i find the faq", "do i need experience", "i am a beginner can i use this", "is it risky",
      "what are the risks", "do i need to know trading", "is this for beginners",
      "onde encontro as perguntas frequentes", "preciso de experiência", "sou iniciante posso usar", "é arriscado",
      "quais são os riscos", "preciso saber operar", "é para iniciantes",
      "dónde encuentro las preguntas frecuentes", "necesito experiencia", "soy principiante puedo usarlo", "es riesgoso",
      "cuáles son los riesgos", "necesito saber operar", "es para principiantes",
      "serve esperienza", "faut il de l expérience", "brauche ich erfahrung", "нужен ли опыт", "有风险吗", "需要经验吗", "経験は必要ですか", "هل يحتاج خبرة", "צריך ניסיון",
    ],
    answer:
      "The home page FAQ covers prior experience, risk, how the system works and cancellation. Refund and cancellation requests are handled by a person through human support.",
    body:
      "The home page FAQ covers four topics. Prior experience: the public FAQ says prior experience is not required to use the panel, but you must understand the risks. Risk: trading involves a substantial risk of loss and Braxel does not guarantee results. How it works: see the documented customer flow (account, plan, payment, onboarding, activation, self-execution of signals); the marketing pages contain illustrative and unverified statements. Cancellation: the FAQ mentions requesting cancellation; in practice refund and cancellation requests are reviewed by a person through human support, and there is no self-service cancellation button.",
    relatedTopics: ["how_it_works", "legal_documents", "support_procedures"],
    links: ["/", "/how-it-works", "/contact"],
  },
  {
    id: "account_actions",
    category: "support",
    title: "What the assistant can and cannot do",
    aliases: [
      "can you do it for me", "do it for me", "change my account", "activate for me", "connect for me", "trade for me",
      "você pode fazer", "pode ativar", "pode conectar", "faz pra mim", "você opera",
      "puedes hacerlo", "puedes activar", "puedes conectar", "hazlo por mi", "tú operas",
      "puoi farlo tu", "peux tu le faire", "kannst du das machen", "можете сделать", "可以帮我做", "代わりにやって", "هل يمكنك فعل ذلك", "אתה יכול לעשות את זה",
    ],
    keywords: [
      "can you", "do it for me", "change my", "activate my", "connect my", "place order", "trade for me", "status",
      "pode fazer", "ativar", "conectar", "executar", "puedes", "activar", "conectar", "ejecutar", "pouvez", "activer", "connecter", "können", "aktivieren", "можете", "активировать", "可以", "激活", "できます", "有効化", "يمكنك", "تفعيل", "יכול", "להפעיל",
    ],
    informalQuestions: [
      "can you activate my account for me", "can you do it for me", "can you check my payment", "can you connect my broker",
      "can you place a trade", "can you change my status", "can you approve my activation", "do it for me",
      "você pode ativar minha conta", "pode fazer isso por mim", "você pode ver meu pagamento", "pode conectar minha conta",
      "pode fazer uma ordem", "pode mudar meu status", "pode aprovar minha ativação", "faz pra mim",
      "puedes activar mi cuenta", "puedes hacerlo por mí", "puedes ver mi pago", "puedes conectar mi cuenta",
      "puedes hacer una orden", "puedes cambiar mi estado", "puedes aprobar mi activación",
      "puoi attivare il mio conto", "peux tu activer mon compte", "kannst du mein konto aktivieren",
      "можете активировать мой аккаунт", "сделай это за меня", "你能帮我激活吗", "帮我做", "有効化してもらえますか", "هل تفعل ذلك عني", "תוכל להפעיל בשבילי",
    ],
    answer:
      "I am informational only: I cannot pay, approve, activate, suspend, connect, trade, withdraw or read your account status. I can explain the official procedure and hand you to human support.",
    body:
      "The assistant is informational only. It cannot execute a payment, approve or reject a payment, activate or suspend an account, connect or disconnect a provider, place or modify a trade, request a withdrawal, change customer data or read an individual customer's payment, activation, account or trading status. It has no tools and no database access. If you ask it to perform one of these actions, it will explain the official procedure and hand you to human support where needed.",
    relatedTopics: ["support_procedures", "tradovate_connection", "payment_status"],
    links: ["/contact", "/dashboard"],
  },
  {
    id: "security_privacy",
    category: "support",
    title: "Security and chat privacy",
    aliases: [
      "security", "privacy", "my data", "is this chat stored", "do you save messages", "is it safe", "gdpr", "data protection",
      "segurança", "privacidade", "meus dados", "guarda as mensagens", "é seguro", "lgpd",
      "seguridad", "privacidad", "mis datos", "guardan los mensajes", "es seguro",
      "sicurezza", "privacy", "sécurité", "confidentialité", "sicherheit", "datenschutz", "безопасность", "安全", "隐私", "セキュリティ", "الأمان", "אבטחה",
    ],
    keywords: [
      "security", "privacy", "data", "stored", "store", "log", "conversation", "secret", "safe", "gdpr",
      "segurança", "privacidade", "dados", "guardado", "seguridad", "privacidad", "datos", "sécurité", "confidentialité", "données", "sicherheit", "datenschutz", "безопасность", "данные", "安全", "隐私", "数据", "セキュリティ", "プライバシー", "الأمان", "الخصوصية", "אבטחה", "פרטיות",
    ],
    informalQuestions: [
      "is the chat stored", "do you save my messages", "is this conversation private", "who can read this chat",
      "do you share my data", "is my data safe", "are you a bot",
      "o chat fica salvo", "vocês guardam as mensagens", "essa conversa é privada", "quem lê esse chat",
      "vocês compartilham meus dados", "meus dados estão seguros", "você é um robô",
      "el chat se guarda", "guardan los mensajes", "esta conversación es privada", "quién lee este chat",
      "comparten mis datos", "mis datos están seguros", "eres un bot",
      "la chat viene salvata", "le chat est il enregistré", "wird der chat gespeichert",
      "чат сохраняется", "вы сохраняете сообщения", "这个聊天会被保存吗", "聊天记录会被保存吗", "このチャットは保存されますか", "هل يتم حفظ المحادثة", "הצ'אט נשמר",
    ],
    answer:
      "This chat is stateless: the browser sends the recent turns, the server stores nothing and logs no message content. I never ask for passwords, card numbers, Tradovate credentials, API keys, MFA codes or private keys.",
    body:
      "The AI chat is stateless: the browser sends the recent turns with each request, the server stores nothing, logs no message content and returns Cache-Control: no-store. The conversation stays in browser memory only; there is no conversation table, so one customer cannot read another customer's chat. The assistant never asks for passwords, card numbers, Tradovate credentials, API keys, MFA codes or private keys. Customer sessions use bearer tokens, KYC documents live in a private bucket, and provider credentials are encrypted server-side. The published Privacy Policy is a DRAFT pending legal review; data-rights requests go to human support.",
    relatedTopics: ["legal_documents", "support_procedures", "withdrawal_kyc"],
    links: ["/privacy", "/contact"],
  },
  {
    id: "languages",
    category: "support",
    title: "Supported languages",
    aliases: [
      "language", "languages", "english", "portuguese", "spanish", "italian", "french", "german", "russian", "chinese", "japanese", "arabic", "hebrew",
      "idioma", "idiomas", "língua", "langue", "sprache", "язык", "语言", "言語", "اللغة", "שפה",
    ],
    keywords: [
      "language", "languages", "english", "portuguese", "spanish", "italian", "french", "german", "russian", "chinese", "japanese", "arabic", "hebrew",
      "idioma", "idiomas", "língua", "langue", "sprache", "язык", "语言", "言語", "اللغة", "שפה",
    ],
    informalQuestions: [
      "which languages do you support", "do you speak portuguese", "can you answer in spanish", "is there a portuguese version",
      "does the site have other languages", "do you speak my language",
      "quais idiomas vocês falam", "vocês falam português", "tem versão em português", "o site tem outros idiomas",
      "você fala minha língua",
      "qué idiomas hablan", "hablan español", "hay versión en español", "el sitio tiene otros idiomas",
      "che lingue parlate", "quelles langues parlez vous", "welche sprachen sprechen sie",
      "какие языки поддерживаются", "вы говорите по-русски", "支持哪些语言", "有中文版吗", "どの言語に対応していますか", "ما اللغات المدعومة", "אילו שפות",
    ],
    answer:
      "The site and this assistant support 11 languages: English, Portuguese, Italian, Spanish, French, German, Russian, Chinese, Japanese, Arabic and Hebrew. I answer in the language of your latest message.",
    body:
      "The website and the support assistant support 11 locales: English, Portuguese, Italian, Spanish, French, German, Russian, Chinese, Japanese, Arabic and Hebrew. The assistant answers in the language of your latest message, not the website locale. Right-to-left layouts are supported for Arabic and Hebrew.",
    relatedTopics: ["public_routes", "support_procedures"],
    links: ["/", "/contact"],
  },
  {
    id: "legal_documents",
    category: "legal",
    title: "Terms, Privacy, Disclaimer and risk warning",
    aliases: [
      "terms", "privacy policy", "disclaimer", "risk warning", "legal", "policy", "contract", "liability", "refund policy",
      "termos", "privacidade", "aviso", "risco", "política", "contrato",
      "términos", "privacidad", "aviso", "riesgo", "política", "contrato",
      "termini", "condizioni", "confidentialité", "agb", "datenschutz", "условия", "隐私", "利用規約", "الشروط", "תנאים",
    ],
    keywords: [
      "terms", "privacy", "disclaimer", "risk", "legal", "policy", "gdpr", "data", "contract", "liability",
      "termos", "privacidade", "aviso", "risco", "términos", "privacidad", "conditions", "confidentialité", "agb", "datenschutz", "условия", "隐私", "利用規約", "الشروط", "תנאים",
    ],
    informalQuestions: [
      "what are the terms", "where is the privacy policy", "where is the disclaimer", "is there a risk warning",
      "what does the contract say", "do you guarantee results", "is there a refund policy",
      "quais são os termos", "onde está a política de privacidade", "onde está o aviso", "tem aviso de risco",
      "o contrato diz o quê", "vocês garantem resultado", "existe política de reembolso",
      "cuáles son los términos", "dónde está la política de privacidad", "dónde está el aviso", "hay aviso de riesgo",
      "qué dice el contrato", "ustedes garantizan resultados", "hay política de reembolso",
      "quali sono i termini", "où est la politique de confidentialité", "wo sind die agb",
      "какие условия", "где политика конфиденциальности", "条款是什么", "隐私政策在哪", "利用規約はどこ", "ما هي الشروط", "איפה התנאים",
    ],
    answer:
      "The Terms, Privacy Policy and Financial Disclaimer pages are drafts pending legal review. Trading involves a substantial risk of loss, past performance does not indicate future results and Braxel does not guarantee returns.",
    body:
      "The published Terms, Privacy Policy and Financial Disclaimer pages are DRAFTS pending legal review. Trading in financial markets involves a substantial risk of loss and is not suitable for every investor. Past performance is not indicative of future results. Braxel does not guarantee returns, payouts, approval or safety. The assistant does not provide legal advice; legal questions and data-rights requests go to human support. Do not treat marketing statements on the site as contractual promises.",
    relatedTopics: ["security_privacy", "faq_help", "refunds_cancellation"],
    links: ["/terms", "/privacy", "/disclaimer"],
  },
  {
    id: "requirements_and_eligibility",
    category: "start",
    title: "Requirements and eligibility",
    aliases: [
      "requirements", "what do i need", "what is required", "eligibility", "who can join",
      "requisitos", "o que preciso", "o que e necessario", "elegibilidade", "quem pode participar",
      "requisitos", "que necesito", "elegibilidad", "quien puede participar",
      "requisiti", "voraussetzungen", "exigences", "требования", "要求", "要件", "المتطلبات", "דרישות",
    ],
    keywords: [
      "requirement", "requirements", "need", "needed", "required", "document", "documents",
      "eligible", "eligibility", "country", "countries", "region", "where",
      "requisito", "requisitos", "preciso", "necessario", "documento", "documentos", "pais", "paises",
      "necesito", "necesario", "documento", "documentos", "pais", "paises", "elegible",
      "requisiti", "documenti", "voraussetzungen", "dokumente", "exigences", "documents",
      "требования", "документы", "要求", "要件", "المتطلبات", "דרישות",
    ],
    informalQuestions: [
      "what do i need to get started", "what do i need to start", "what are the requirements",
      "what documents do i need", "do i need an account", "can i use it from my country",
      "is it available in my country", "which countries do you support", "who can join",
      "o que preciso para comecar", "o que preciso para comecar", "o que e necessario para comecar",
      "quais documentos preciso", "posso usar do meu pais", "voces atendem o meu pais",
      "quais paises voces atendem", "quem pode participar", "preciso de conta",
      "que necesito para empezar", "que necesito para comenzar", "que documentos necesito",
      "puedo usarlo desde mi pais", "que paises atienden", "quien puede participar",
      "cosa serve per iniziare", "was brauche ich", "que faut il pour commencer",
      "что нужно чтобы начать", "какие документы нужны", "开始需要什么", "始めるには何が必要",
      "ماذا احتاج للبدء", "מה צריך כדי להתחיל",
    ],
    answer:
      "The documented requirements are an email address, a Braxel account, one of the four monthly plans and completion of checkout and onboarding. Activation also needs your own external prop-firm account (Tradeify or Lucid) and a third-party tool to execute the signals yourself. No country-by-country eligibility list is published; contact human support for a specific country.",
    body:
      "To start: an email address, a Braxel account created on /register, one of the four monthly plans on /pricing, and completion of /checkout and the onboarding disclosures. To request activation you also need your own external prop-firm account bought directly from the firm (Tradeify or Lucid) and a third-party tool to execute the signals yourself; an operator reviews the activation manually. Braxel never asks for a broker password, card number, API key or identity document in this chat. The app does not publish a country-by-country eligibility list, so country availability cannot be confirmed here: contact human support with your country. Identity verification (KYC) is required only when a withdrawal is requested.",
    relatedTopics: ["getting_started", "account_creation", "activation", "accounts_prop_firms"],
    links: ["/register", "/pricing", "/accounts", "/contact"],
  },
  {
    id: "benefits_and_features",
    category: "product",
    title: "Benefits and features",
    aliases: [
      "benefits", "advantages", "features", "what do i get", "what is included",
      "why braxel", "why choose braxel",
      "vantagens", "beneficios", "o que eu recebo", "o que recebo", "por que braxel",
      "por que escolher a braxel", "ventajas", "beneficios", "que obtengo", "que recibo",
      "vantaggi", "vorteile", "avantages", "преимущества", "好处", "メリット", "المزايا", "יתרונות",
    ],
    keywords: [
      "benefit", "benefits", "feature", "features", "include", "included", "receive", "get",
      "advantage", "vantagem", "vantagens", "beneficio", "beneficios", "recebo", "incluido",
      "ventaja", "ventajas", "recibo", "incluido", "vantaggio", "vorteil", "avantage",
      "преимущество", "好处", "メリット", "ميزة", "יתרון",
    ],
    informalQuestions: [
      "what do i get", "what do i receive", "what is included", "why should i use braxel",
      "why choose braxel", "what are the benefits", "o que eu recebo", "o que recebo",
      "o que tenho direito", "quais as vantagens", "por que usar a braxel", "por que escolher a braxel",
      "que obtengo", "que recibo", "cuales son los beneficios", "por que elegir braxel",
      "cosa ottengo", "was bekomme ich", "qu est ce que je recois", "что я получаю",
      "我能得到什么", "何が得られますか", "ماذا احصل", "מה מקבלים",
    ],
    answer:
      "The documented offering is a fixed monthly signals plan with four tiers, a dashboard that shows only your own data, an optional read-only Tradovate integration, manual activation review and support in 11 languages. Braxel does not operate your account, does not custody funds and does not promise returns.",
    body:
      "The documented features are: four monthly signals plans (see /pricing for the canonical prices), a dashboard that computes performance only from your own closed trades and shows explicit empty states, an optional read-only Tradovate integration that Braxel cannot use to place, modify or liquidate orders, a manual operator review of account activation, a profile and billing prefill, and support in 11 languages. Braxel does not operate your trading account, does not custody customer funds, does not process prop-firm payouts and does not promise profits or returns. Trading involves a substantial risk of loss; read the Financial Disclaimer on /disclaimer.",
    relatedTopics: ["plans", "dashboard_usage", "tradovate_connection", "legal_documents"],
    links: ["/pricing", "/how-it-works", "/dashboard"],
  },
];
/** Lookup table. Built once; entries are immutable data. */
export const KNOWLEDGE_BY_ID: Record<string, KnowledgeArticle> = Object.fromEntries(
  KNOWLEDGE_ARTICLES.map((a) => [a.id, a]),
);

/** Weighted phrase index for one entry: informal phrasings weigh the most. */
export function indexArticle(article: KnowledgeArticle): IndexedEntry {
  return {
    id: article.id,
    phrases: compact([
      ...article.informalQuestions.map((q) => phrase(q, FIELD_WEIGHTS.informal)),
      ...article.aliases.map((a) => phrase(a, FIELD_WEIGHTS.alias)),
      ...article.keywords.map((k) => phrase(k, FIELD_WEIGHTS.keyword)),
      phrase(article.title, FIELD_WEIGHTS.title),
    ]),
  };
}

/** Index built once at module load over the approved knowledge base. */
export const KNOWLEDGE_INDEX: IndexedEntry[] = KNOWLEDGE_ARTICLES.map(indexArticle);

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

export function articlesForIds(
  ids: string[],
  articles: KnowledgeArticle[] = KNOWLEDGE_ARTICLES,
): KnowledgeArticle[] {
  const out: KnowledgeArticle[] = [];
  for (const id of ids) {
    const found = articleById(id, articles);
    if (found && !out.includes(found)) out.push(found);
  }
  return out;
}

/** Approved neighbours of an article, primary first. */
export function relatedArticles(
  id: string,
  articles: KnowledgeArticle[] = KNOWLEDGE_ARTICLES,
  limit = 2,
): KnowledgeArticle[] {
  const article = articleById(id, articles);
  if (!article) return [];
  return articlesForIds(article.relatedTopics, articles).slice(0, limit);
}

/**
 * Deterministic retrieval by phrase overlap. Used to (a) ground the model with
 * the most relevant approved articles and (b) answer without a provider.
 * Returns at most `limit` articles, strongest first. No match => [].
 */
export function selectRelevantArticles(
  message: string,
  articles: KnowledgeArticle[] = KNOWLEDGE_ARTICLES,
  limit = 3,
): KnowledgeArticle[] {
  const byId = new Map(articles.map((a) => [a.id, a]));
  const index = articles === KNOWLEDGE_ARTICLES ? KNOWLEDGE_INDEX : articles.map(indexArticle);
  const out: KnowledgeArticle[] = [];
  for (const hit of rankEntries(message, index)) {
    const article = byId.get(hit.id);
    if (!article) continue;
    out.push(article);
    if (out.length >= limit) break;
  }
  return out;
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
