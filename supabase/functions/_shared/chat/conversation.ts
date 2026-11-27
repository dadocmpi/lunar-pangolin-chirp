// ============================================================================
// High-level conversational intent classification for the support chatbot.
//
// The knowledge matcher (intent.ts) decides WHICH approved article answers a
// question. This module decides WHAT KIND of message it is, before any article
// is chosen, so the assistant behaves like a first-line support agent:
//
//   "Oiiiiiiiiii"                     -> greeting
//   "quero começar"                   -> customer_interest
//   "qual plano devo escolher?"       -> plans
//   "o que preciso para começar?"     -> requirements
//   "is Braxel a prop firm?"          -> company_overview
//   "isso é uma vergonha"             -> complaint
//   "qual é a capital da França?"     -> off_topic
//   "hmm"                             -> unclear
//
// It also resolves conversational follow-ups from the supplied history
// ("e depois?", "qual deles?", "já criei", "me explica melhor"), and decides
// whether a message is even about Braxel.
//
// Pure and deterministic: no I/O, no model call, no randomness, no user data.
// The classifier never answers and never touches a provider or the database.
// ============================================================================

import {
  contextIntentFromHistory,
  detectPlanReference,
  isAcknowledgement,
  isExplainRequest,
  isFarewell,
  isGreeting,
  isReferential,
  isThanks,
  isTopicless,
  MIN_INTENT_SCORE,
} from "./intent.ts";
import { articleById, KNOWLEDGE_INDEX } from "./knowledge.ts";
import { rankEntries } from "./match.ts";
import {
  CJK_RE,
  isKeyboardMash,
  normalizeElongated,
  normalizeQuery,
  tokenize,
} from "./normalize.ts";
import type { ChatTurn } from "./types.ts";

export const CONVERSATIONAL_INTENTS = [
  // Social / meta
  "greeting",
  "farewell",
  "thanks",
  "acknowledgement",
  "language_switch",
  // Company and public information
  "company_overview",
  "company_identity",
  "what_we_do",
  "how_it_works",
  "benefits",
  "eligibility",
  "requirements",
  // Customer journey
  "customer_interest",
  "becoming_customer",
  "plans",
  "pricing",
  "plan_discovery",
  "plan_comparison",
  "cheapest_plan",
  "plan_recommendation",
  "onboarding",
  "activation",
  // Account and access
  "account_creation",
  "profile_completion",
  "email_confirmation",
  "password_recovery",
  "login_problem",
  // Checkout and payments
  "payment_info",
  "checkout",
  "card_payment",
  "crypto_payment",
  "bank_transfer",
  "payment_pending",
  "payment_processing",
  "payment_failed",
  "payment_confirmation",
  // Product
  "dashboard",
  "tradovate",
  "read_only_limits",
  // Support and conversation shape
  "support",
  "complaint",
  "frustration",
  "confusion",
  "simpler_explanation",
  "more_detail",
  "repeat",
  "follow_up",
  "contextual_reference",
  "topic_change",
  "unclear",
  "off_topic",
  /** Internal: answer the matched approved article directly. */
  "knowledge_topic",
] as const;

export type ConversationalIntent = (typeof CONVERSATIONAL_INTENTS)[number];

export type FollowUpKind =
  | "explain"
  | "next_step"
  | "which_plan"
  | "already_created"
  | "already_paid"
  | "reference"
  | "repeat"
  | "duration";

export interface ConversationResult {
  intent: ConversationalIntent;
  /** 0..1 confidence in the classification. */
  confidence: number;
  /** Approved article id that grounds the answer, when there is one. */
  topic: string | null;
  /** True when the message could reasonably be about Braxel. */
  inDomain: boolean;
  /** Plan named by price, capital tier or name. */
  planId: string | null;
  /** Follow-up shape resolved from the conversation, if any. */
  followUp: FollowUpKind | null;
  /** True when the topic came from the conversation history. */
  contextUsed: boolean;
  /** True when the customer asked for a simpler or step-by-step explanation. */
  explain: boolean;
  /** True when the message has no usable content ("hmm", "aaaa", "??"). */
  unclear: boolean;
  /** True when an explicit, curated intent phrase matched. */
  matchedRule: boolean;
  /** Elongation-tolerant normalised form used for matching. */
  normalized: string;
}

// ---------------------------------------------------------------------------
// Intent phrases
//
// Written in the three most common customer languages plus the other supported
// locales where a phrase is distinctive. Every phrase is normalised with
// normalizeElongated, so "quero começarrr" and "quero comecar" are the same.
// The most specific (longest) matching phrase wins.
// ---------------------------------------------------------------------------

interface IntentRule {
  intent: ConversationalIntent;
  topic: string | null;
  phrases: string[];
}

const RULES: IntentRule[] = [
  {
    intent: "cheapest_plan",
    topic: "plans",
    phrases: [
      "qual e o mais barato", "qual o mais barato", "plano mais barato", "mais barato",
      "mais barata", "menor preco", "o mais em conta", "qual custa menos",
      "cheapest plan", "cheapest", "least expensive", "which is the cheapest",
      "which one is the cheapest", "which one is cheapest", "which plan is the cheapest",
      "the cheapest one", "lowest price", "which plan is cheapest",
      "cual es el mas barato", "el mas barato", "plan mas barato", "el mas economico",
      "mas barato", "cual cuesta menos",
      "il piu economico", "am gunstigsten", "le moins cher", "самый дешевый",
      "最便宜的", "哪个最便宜", "一番安い", "الأرخص", "הזול ביותר",
    ],
  },
  {
    intent: "plan_comparison",
    topic: "plans",
    phrases: [
      "diferenca entre os planos", "qual a diferenca entre os planos",
      "diferenca dos planos", "comparar planos", "comparacao dos planos",
      "difference between plans", "difference between the plans", "compare plans",
      "plan comparison", "what is the difference between the plans",
      "diferencia entre planes", "comparar planes", "cual es la diferencia entre los planes",
      "unterschied zwischen den planen", "difference entre les forfaits",
      "разница между тарифами", "套餐区别", "套餐的区别", "プランの違い", "الفرق بين الخطط",
      "ההבדל בין התוכניות",
    ],
  },
  {
    intent: "plan_recommendation",
    topic: "plans",
    phrases: [
      "qual plano devo escolher", "qual plano voce recomenda", "me recomenda um plano",
      "qual plano e melhor para mim", "qual plano escolher", "que plano escolher",
      "which plan should i choose", "which plan do you recommend", "recommend a plan",
      "which plan is best for me", "help me choose a plan", "what plan should i pick",
      "que plan deberia elegir", "que plan me recomiendas", "cual plan elijo",
      "welchen plan empfehlen", "quel forfait recommandez", "какой тариф выбрать",
      "哪个套餐适合我", "どのプランがおすすめ", "أي خطة تنصح", "איזו תוכנית מתאימה",
    ],
  },
  {
    intent: "plan_discovery",
    topic: "plans",
    phrases: [
      "quais planos", "quais sao os planos", "quais os planos", "ver os planos",
      "mostrar os planos", "me mostra os planos", "lista de planos", "os planos",
      "what plans", "what plans do you have", "show me the plans", "see the plans",
      "list the plans", "which plans do you offer", "plans and prices",
      "que planes tienen", "cuales son los planes", "mostrar planes", "ver los planes",
      "planes y precios", "welche plane", "quels forfaits", "какие тарифы",
      "有哪些套餐", "プラン一覧", "ما هي الخطط", "אילו תוכניות",
    ],
  },
  {
    intent: "becoming_customer",
    topic: "getting_started",
    phrases: [
      "como viro cliente", "como me torno cliente", "como ser cliente",
      "como faco para ser cliente", "como me hago cliente",
      "how do i become a customer", "how to become a customer", "how can i be a customer",
      "quiero ser cliente", "como puedo ser cliente",
    ],
  },
  {
    intent: "company_identity",
    topic: "company_overview",
    phrases: [
      "quem sao voces", "quem e a braxel", "quem e braxel", "o que e a braxel",
      "o que e braxel", "quem esta por tras da braxel",
      "who are you", "who is braxel", "what is braxel", "who is behind braxel",
      "que es braxel", "quienes son", "quien es braxel",
      "wer seid ihr", "qui etes vous", "кто вы", "что такое braxel",
      "你们是谁", "braxel 是什么", "braxel とは", "من انتم", "מי אתם",
    ],
  },
  {
    intent: "login_problem",
    topic: "login_problem",
    phrases: [
      "nao consigo entrar", "nao consigo acessar", "nao consigo fazer login",
      "nao consigo logar", "erro ao entrar", "problema para entrar", "problema no login",
      "can not log in", "cannot log in", "cant log in", "cant login", "can not login",
      "login problem", "login not working", "unable to log in", "unable to login",
      "no puedo entrar", "no puedo iniciar sesion", "no puedo acceder",
      "problema al iniciar sesion",
      "kann mich nicht anmelden", "impossible de me connecter",
      "не могу войти", "登录不了", "无法登录", "ログインできない",
      "لا أستطيع تسجيل الدخول", "לא מצליח להתחבר",
    ],
  },
  {
    intent: "email_confirmation",
    topic: "email_confirmation",
    phrases: [
      "confirmar email", "confirmacao de email", "nao recebi o email",
      "nao recebi o e mail", "email de confirmacao", "confirmar o email",
      "confirm email", "email confirmation", "did not get the email",
      "didnt get the email", "no confirmation email", "resend confirmation",
      "confirmar correo", "confirmacion de correo", "no recibi el correo",
      "bestatigungsemail", "email de confirmation", "подтвердить почту",
      "确认邮箱", "邮箱确认", "メール確認", "تأكيد البريد", "אימות אימייל",
    ],
  },
  {
    intent: "password_recovery",
    topic: "password_recovery",
    phrases: [
      "esqueci a senha", "esqueci minha senha", "redefinir senha", "recuperar senha",
      "trocar a senha", "resetar a senha", "forgot password", "reset password",
      "recover password", "change my password", "password reset",
      "olvide mi contraseña", "recuperar contraseña", "restablecer contraseña",
      "passwort vergessen", "mot de passe oublie", "забыл пароль", "сбросить пароль",
      "忘记密码", "忘记密码了", "パスワードを忘れ", "パスワードをリセット",
      "نسيت كلمة المرور", "שכחתי סיסמה",
    ],
  },
  {
    intent: "profile_completion",
    topic: "profile_and_signup",
    phrases: [
      "completar perfil", "preencher perfil", "completar o perfil", "perfil incompleto",
      "complete profile", "complete my profile", "finish my profile", "profile incomplete",
      "completar mi perfil", "perfil incompleto", "profil vervollstandigen",
      "completer mon profil", "заполнить профиль", "完善资料", "完善个人资料",
      "プロフィールを完成", "أكمل ملفي", "להשלים פרופיל",
    ],
  },
  {
    intent: "checkout",
    topic: "checkout",
    phrases: [
      "finalizar compra", "ir para o checkout", "como pago no checkout",
      "pagina de pagamento", "fazer o pagamento", "go to checkout", "finish checkout",
      "checkout page", "complete the purchase", "pay now", "pagar ahora",
      "finalizar la compra", "ir al checkout", "zur kasse", "passer au paiement",
      "перейти к оплате", "去结账", "支払いへ進む", "الانتقال للدفع", "למעבר לתשלום",
    ],
  },
  {
    intent: "card_payment",
    topic: "card_payment",
    phrases: [
      "pagar com cartao", "cartao de credito", "cartao de debito", "pagamento com cartao",
      "pay by card", "card payment", "credit card", "debit card", "pay with a card",
      "pagar con tarjeta", "tarjeta de credito", "pago con tarjeta",
      "mit karte zahlen", "payer par carte", "оплата картой", "信用卡付款",
      "信用卡", "カード払い", "クレジットカード", "الدفع بالبطاقة", "כרטיס אשראי",
    ],
  },
  {
    intent: "crypto_payment",
    topic: "crypto_payment",
    phrases: [
      "pagar com cripto", "pagamento com cripto", "pagar com crypto", "criptomoeda",
      "bitcoin", "usdt", "pay with crypto", "crypto payment", "pay in bitcoin",
      "pagar con cripto", "pago con cripto", "mit krypto zahlen",
      "payer en crypto", "оплата криптой", "криптовалюта", "加密货币", "加密货币支付",
      "仮想通貨", "ビットコイン", "الدفع بالعملات الرقمية", "קריפטו",
    ],
  },
  {
    intent: "bank_transfer",
    topic: "bank_transfer",
    phrases: [
      "transferencia bancaria", "transferencia", "deposito bancario", "pagar por transferencia",
      "bank transfer", "wire transfer", "wise", "bank deposit", "pay by bank",
      "virement bancaire", "bankuberweisung",
      "банковский перевод", "银行转账", "銀行振込", "تحويل بنكي", "העברה בנקאית",
    ],
  },
  {
    intent: "payment_pending",
    topic: "payment_status",
    phrases: [
      "pagamento pendente", "pagamento esta pendente", "aguardando pagamento",
      "payment pending", "pending payment", "payment is pending", "still pending",
      "pago pendiente", "el pago esta pendiente", "zahlung ausstehend",
      "paiement en attente", "платеж в обработке", "付款待处理", "支払い待ち",
      "الدفع معلق", "תשלום ממתין",
    ],
  },
  {
    intent: "payment_processing",
    topic: "payment_status",
    phrases: [
      "pagamento em processamento", "processando pagamento", "pagamento em analise",
      "payment processing", "payment is processing", "processing payment",
      "pago en proceso", "pago en procesamiento", "zahlung wird verarbeitet",
      "paiement en cours", "платеж обрабатывается", "付款处理中", "処理中",
      "قيد المعالجة", "בעיבוד",
    ],
  },
  {
    intent: "payment_failed",
    topic: "payment_failures",
    phrases: [
      "pagamento falhou", "pagamento recusado", "cartao recusado", "pagamento nao passou",
      "payment failed", "payment declined", "card declined", "payment did not go through",
      "pago fallido", "pago rechazado", "tarjeta rechazada",
      "zahlung fehlgeschlagen", "paiement echoue", "платеж отклонен", "оплата не прошла",
      "付款失败", "支付失败", "支払い失敗", "فشل الدفع", "התשלום נכשל",
    ],
  },
  {
    intent: "payment_confirmation",
    topic: "payment_status",
    phrases: [
      "pagamento confirmado", "confirmacao de pagamento", "meu pagamento foi aprovado",
      "payment confirmed", "confirmation of payment", "did my payment go through",
      "was my payment confirmed", "payment approved",
      "pago confirmado", "confirmacion de pago", "zahlung bestatigt",
      "paiement confirme", "платеж подтвержден", "付款成功", "付款确认",
      "支払い確認", "تم الدفع", "התשלום אושר",
    ],
  },
  {
    intent: "activation",
    topic: "activation",
    phrases: [
      "ativacao", "ativar conta", "ativar a conta", "minha ativacao", "pedido de ativacao",
      "activation", "activate account", "account activation", "activation request",
      "activacion", "activar cuenta", "aktivierung", "konto aktivieren",
      "activation du compte", "активация", "активировать аккаунт", "激活", "账户激活",
      "アクティベーション", "تفعيل", "הפעלת חשבון",
    ],
  },
  {
    intent: "dashboard",
    topic: "dashboard_usage",
    phrases: [
      "painel", "meu painel", "area de membros", "dashboard", "my dashboard",
      "painel do cliente", "panel", "mi panel", "tablero", "tableau de bord",
      "armaturenbrett", "панель", "仪表盘", "ダッシュボード", "لوحة التحكم", "לוח בקרה",
    ],
  },
  {
    intent: "tradovate",
    topic: "tradovate_connection",
    phrases: [
      "tradovate", "conectar tradovate", "integracao tradovate", "tradovate connection",
      "tradovate integration", "подключить tradovate", "tradovate 連携",
    ],
  },
  {
    intent: "read_only_limits",
    topic: "read_only_limits",
    phrases: [
      "voce opera minha conta", "voces operam minha conta", "pode operar por mim",
      "operar por mim", "copy trade", "copytrading", "copy trading",
      "faz trade por mim", "executa as ordens por mim", "voces fazem copy trading",
      "do you trade for me", "can you trade for me", "trade on my behalf",
      "do you copy trade", "execute trades for me",
      "pueden operar por mi", "operan mi cuenta", "puedo copiar",
      "konnen sie fur mich handeln", "pouvez vous trader pour moi",
      "вы торгуете за меня", "копи трейдинг", "替我交易", "代我交易", "复制交易",
      "代行", "コピートレード", "هل تتداولون", "نسخ التداول", "תסחרו בשבילי",
    ],
  },
  {
    intent: "frustration",
    topic: "support_procedures",
    phrases: [
      "estou frustrado", "estou frustrada", "isso e frustrante", "que raiva",
      "estou irritado", "estou irritada", "estou chateado", "estou chateada",
      "i am frustrated", "im frustrated", "this is frustrating", "so frustrating",
      "i am angry", "im angry", "i am upset", "this is annoying",
      "estoy frustrado", "estoy frustrada", "esto es frustrante", "estoy molesto",
      "ich bin frustriert", "je suis frustre", "я расстроен", "меня это злит",
      "我很沮丧", "很烦", "イライラする", "محبط", "אני מתוסכל",
    ],
  },
  {
    intent: "confusion",
    topic: null,
    phrases: [
      "nao entendi", "nao entendi nada", "nao entendi nada disso", "nao ficou claro",
      "estou confuso", "estou confusa", "i dont understand", "i do not understand",
      "i dont get it", "i did not get it", "confusing", "not clear",
      "no entiendo", "no lo entiendo", "no me quedo claro", "estoy confundido",
      "non ho capito", "ich verstehe nicht", "je ne comprends pas",
      "не понимаю", "не понял", "没看懂", "不明白", "わからない",
      "لا أفهم", "לא מבין", "לא הבנתי",
    ],
  },
  {
    intent: "simpler_explanation",
    topic: null,
    phrases: [
      "explica de um jeito simples", "explica simples", "de forma simples",
      "em palavras simples", "explica como se eu fosse leigo", "bem simples",
      "explain simply", "in simple terms", "explain it simply", "simpler please",
      "explain like i am a beginner",
      "explicame facil", "explicame de forma simple", "en palabras simples",
      "einfach erklaren", "explique simplement", "объясни проще", "简单解释",
      "簡単に説明", "اشرح ببساطة", "תסביר בפשטות",
    ],
  },
  {
    intent: "more_detail",
    topic: null,
    phrases: [
      "me explica melhor", "explica melhor", "explica mais", "quero mais detalhes",
      "mais detalhes", "me conta mais", "quero saber mais", "continua explicando",
      "explain more", "explain better", "tell me more", "more details",
      "go deeper", "can you elaborate", "elaborate",
      "explicame mejor", "explica mejor", "mas detalles", "quiero saber mas",
      "erklare mir mehr", "explique mieux", "plus de details", "объясни подробнее",
      "再详细一点", "多说一点", "もっと詳しく", "اشرح أكثر", "תסביר יותר",
    ],
  },
  {
    intent: "repeat",
    topic: null,
    phrases: [
      "repete", "pode repetir", "repita", "repete isso", "repete por favor",
      "repeat", "repeat that", "say that again", "can you repeat", "repeat please",
      "repiteme", "otra vez", "repite", "wiederholen", "повтори",
      "再说一遍", "もう一度", "أعد", "תחזור",
    ],
  },
  {
    intent: "topic_change",
    topic: null,
    phrases: [
      "mudando de assunto", "outra pergunta", "nova pergunta", "outro assunto",
      "changing topic", "different question", "another question", "new question",
      "cambiando de tema", "otra pregunta", "otra cosa",
      "andere frage", "autre question", "другой вопрос", "另一个问题",
      "別の質問", "سؤال آخر", "שאלה אחרת",
    ],
  },
  {
    intent: "complaint",
    topic: "support_procedures",
    phrases: [
      "nada funciona", "nao funciona nada", "nada esta funcionando", "isso nao funciona",
      "estou insatisfeito", "estou insatisfeita", "pessimo atendimento", "atendimento pessimo",
      "quero reclamar", "fazer uma reclamacao", "uma vergonha", "isso e um golpe",
      "e um golpe", "e uma fraude", "isso e fraude", "estou frustrado", "estou frustrada",
      "nothing works", "this is a scam", "its a scam", "this is fraud", "i am angry",
      "im angry", "i am frustrated", "im frustrated", "i want to complain", "make a complaint",
      "terrible service", "awful service", "this is unacceptable",
      "no funciona nada", "esto es una estafa", "es una estafa", "quiero quejarme",
      "estoy frustrado", "estoy frustrada", "pesimo servicio", "esto es inaceptable",
      "cest une arnaque", "das ist eine frechheit", "это мошенничество", "这是骗局",
      "これは詐欺です", "هذا احتيال", "זו הונאה",
    ],
  },
  {
    intent: "requirements",
    topic: "requirements_and_eligibility",
    phrases: [
      "o que preciso para comecar", "o que eu preciso para comecar", "o que preciso para iniciar",
      "o que e necessario para comecar", "quais sao os requisitos", "quais os requisitos",
      "o que preciso", "requisitos",
      "what do i need to get started", "what do i need to start", "what do i need",
      "what are the requirements", "what is required", "requirements",
      "que necesito para empezar", "que necesito para comenzar", "que necesito",
      "cuales son los requisitos", "requisitos",
      "cosa mi serve per iniziare", "was brauche ich", "que faut il pour commencer",
      "что нужно чтобы начать", "开始需要什么", "始めるには何が必要", "ماذا احتاج للبدء", "מה צריך כדי להתחיל",
    ],
  },
  {
    intent: "eligibility",
    topic: "requirements_and_eligibility",
    phrases: [
      "posso usar do meu pais", "posso usar no meu pais", "funciona no meu pais",
      "posso usar a plataforma do meu pais", "posso usar isso no meu pais",
      "a plataforma funciona no meu pais", "voces atuam no meu pais",
      "atendem o meu pais", "voces atendem meu pais", "quais paises", "quem pode participar",
      "quem pode usar", "sou elegivel", "elegibilidade", "tem restricao de pais",
      "can i use it from my country", "can i use from my country", "is it available in my country",
      "can i use the platform from my country", "can i use this from my country",
      "is the platform available in my country", "do you operate in my country",
      "do you accept my country", "which countries", "who can join", "who is eligible",
      "eligibility", "country restrictions",
      "puedo usarlo desde mi pais", "puedo usar la plataforma desde mi pais",
      "esta disponible en mi pais", "trabajan en mi pais", "que paises",
      "quien puede participar", "soy elegible", "elegibilidad",
      "posso usarlo dal mio paese", "kann ich es in meinem land nutzen",
      "puis je l utiliser depuis mon pays", "могу ли я пользоваться из своей страны",
      "我可以在我的国家使用吗", "自分の国から使えますか", "هل يمكنني الاستخدام من بلدي", "אפשר להשתמש מהמדינה שלי",
    ],
  },
  {
    intent: "benefits",
    topic: "benefits_and_features",
    phrases: [
      "vantagens", "quais as vantagens", "beneficios", "quais os beneficios",
      "por que usar a braxel", "porque usar a braxel", "por que escolher a braxel",
      "porque escolher a braxel", "o que eu recebo", "o que recebo", "o que tenho direito",
      "benefits", "advantages", "why should i use braxel", "why choose braxel",
      "what do i get", "what do i receive", "what is included",
      "beneficios", "ventajas", "que obtengo", "que recibo", "por que elegir braxel",
      "vantaggi", "avantages", "vorteile", "преимущества", "好处", "メリット", "المزايا", "יתרונות",
    ],
  },
  {
    intent: "plans",
    topic: "plans",
    phrases: [
      "qual plano", "qual e o plano", "qual deles", "qual delas", "qual plano devo escolher",
      "quero saber qual plano escolher", "planos e precos", "quais planos", "os planos",
      "ver os planos", "mostrar os planos", "planos", "plano",
      "which plan", "which one", "which plan should i choose", "plans and prices",
      "see the plans", "show me the plans", "plans", "plan",
      "que plan", "que plan deberia elegir", "cual plan", "planes y precios",
      "ver los planes", "planes", "plan",
      "quale piano", "welcher plan", "quel forfait", "какой тариф", "哪个套餐", "どのプラン",
      "اي خطة", "איזו תוכנית",
    ],
  },
  {
    intent: "pricing",
    topic: "plans",
    phrases: [
      "quanto custa", "quanto e", "qual o preco", "qual o valor", "precos", "preco",
      "valor do plano", "custo", "how much", "how much does it cost", "what is the price",
      "pricing", "price", "prices", "cost", "cuanto cuesta", "cuanto es", "precio",
      "precios", "costo", "combien", "prix", "wie viel", "preis", "сколько стоит",
      "价格", "多少钱", "料金", "كم السعر", "כמה עולה",
    ],
  },
  {
    intent: "company_overview",
    topic: "accounts_prop_firms",
    phrases: [
      "is braxel connected to tradeify", "is braxel tradeify", "are you tradeify",
      "braxel e a tradeify", "braxel tem ligacao com a tradeify", "voces sao da tradeify",
      "braxel trabalha com a tradeify", "braxel e ligada a tradeify",
      "es braxel tradeify", "braxel esta conectada con tradeify", "braxel es tradeify",
      "is braxel connected to lucid", "braxel e a lucid", "braxel tem ligacao com a lucid",
    ],
  },
  {
    intent: "company_overview",
    topic: "company_overview",
    phrases: [
      "o que e a braxel", "o que e braxel", "quem e a braxel", "quem e braxel",
      "quem sao voces", "sobre a empresa", "sobre voces", "sobre a braxel",
      "me fala da empresa", "fala da empresa", "quero conhecer a empresa",
      "quero conhecer melhor a empresa", "conhecer melhor a empresa", "conhecer a braxel",
      "a braxel e uma prop firm", "braxel e uma prop firm", "o que e a empresa",
      "what is braxel", "what is the company", "who are you", "who is braxel",
      "tell me about your company", "tell me about the company", "tell me about braxel",
      "about your company", "about the company", "about braxel", "your company",
      "is braxel a prop firm", "are you a prop firm", "are you a prop",
      "is braxel a prop", "braxel is a prop firm", "voces sao uma prop",
      "voces sao uma prop firm", "voce e uma prop", "sao uma prop firm",
      "son una prop firm", "son una prop", "ustedes son una prop firm",
      "es braxel una prop", "braxel es una prop firm",
      "is braxel connected to tradovate",
      "i want to learn more about the company", "learn more about the company",
      "que es braxel", "quienes son", "quien es braxel", "sobre la empresa", "sobre ustedes",
      "es braxel una prop firm", "conocer la empresa", "conoce la empresa",
      "quiero conocer mejor la empresa", "quiero conocer la empresa",
      "chi siete", "wer seid ihr", "qui etes vous", "кто вы", "что такое braxel",
      "你们是谁", "braxel 是什么", "braxel とは", "من انتم", "מי אתם",
    ],
  },
  {
    intent: "what_we_do",
    topic: "company_overview",
    phrases: [
      "o que voces fazem", "o que a braxel faz", "o que voces oferecem", "quais servicos",
      "que servicos voces oferecem", "o que a empresa faz", "qual e o servico",
      "what do you do", "what does braxel do", "what services do you offer",
      "what services", "what do you offer", "what do you sell", "what is your product",
      "que hacen", "que ofrece", "que servicios", "a que se dedica",
      "cosa fate", "was macht braxel", "que faites vous", "чем вы занимаетесь",
      "你们做什么", "braxel は何をしますか", "ماذا تفعلون", "מה אתם עושים",
    ],
  },
  {
    intent: "how_it_works",
    topic: "how_it_works",
    phrases: [
      "como funciona o servico", "como funciona o processo", "qual e o processo",
      "explica o processo", "explica o processo todo", "explica tudo",
      "how does your business work",
      "how does the service work", "explain the whole process", "what is the process",
      "explain the whole thing", "explain everything", "explain it all",
      "explain the whole thing simply", "explain the whole process simply",
      "me explica tudo", "explica tudo", "explica tudo de forma simples",
      "explicame todo", "explicame todo facil", "explicame todo de forma simple",
      "como funciona el proceso", "cual es el proceso", "en que consiste",
      "wie funktioniert das", "как это работает",
      "怎么运作", "これはどういう仕組み", "كيف يعمل", "איך זה עובד",
    ],
  },
  {
    intent: "onboarding",
    topic: "onboarding",
    phrases: [
      "o que acontece depois", "o que acontece depois de pagar", "depois de pagar",
      "e depois do pagamento", "depois do pagamento", "o que faco depois",
      "what happens after i join", "what happens after i pay", "what happens after i purchase",
      "what happens after purchase", "after purchase", "what happens after buying",
      "after payment", "after i pay", "what happens next",
      "o que acontece depois da compra", "depois da compra", "apos a compra",
      "que pasa despues de la compra", "despues de la compra",
      "que pasa despues", "despues de pagar", "que pasa luego",
      "cosa succede dopo", "was passiert danach", "que se passe t il apres",
      "что происходит после", "之后会发生什么", "そのあとどうなりますか", "ماذا يحدث بعد", "מה קורה אחר כך",
    ],
  },
  {
    intent: "payment_info",
    topic: "payment_methods",
    phrases: [
      "como pago", "como eu pago", "como pagar", "como faco o pagamento", "como faco para pagar",
      "كيف يعمل الدفع", "طرق الدفع", "كيف أدفع",
      "formas de pagamento", "metodos de pagamento", "meios de pagamento", "pagamento",
      "how do i pay", "how to pay", "how can i pay", "payment methods", "how does payment work",
      "como pagar", "como se paga", "metodos de pago", "formas de pago", "pago",
      "come pago", "wie bezahle ich", "comment payer", "как оплатить", "怎么付款",
      "支払い方法", "كيف ادفع", "איך משלמים",
    ],
  },
  {
    intent: "account_creation",
    topic: "account_creation",
    phrases: [
      "criar conta", "criar uma conta", "como me cadastro", "como faco o cadastro",
      "como faco para me cadastrar", "quero me cadastrar", "cadastro", "registrar",
      "create an account", "how do i sign up", "how to sign up", "sign up", "register",
      "crear cuenta", "como me registro", "registrarme", "inscribirme",
      "creare un conto", "konto erstellen", "creer un compte", "создать аккаунт",
      "创建账户", "アカウント作成", "انشاء حساب", "לפתוח חשבון",
    ],
  },
  {
    intent: "support",
    topic: "support_procedures",
    phrases: [
      "falar com o suporte", "falar com suporte", "como contacto o suporte", "contato",
      "atendimento", "preciso de ajuda",
      "contact support", "how do i contact support", "help me",
      "contactar soporte", "soporte", "ayuda", "supporto", "assistance", "hilfe",
      "поддержка", "поддержку", "支持", "サポート", "الدعم", "תמיכה",
    ],
  },
  {
    intent: "customer_interest",
    topic: "getting_started",
    phrases: [
      "quero comecar", "quero comecarr", "quero iniciar", "quero entrar", "quero participar",
      "quero aderir", "quero contratar", "quero contratar um plano", "quero ser cliente",
      "quero me tornar cliente", "quero investir com voces", "quero investir",
      "tenho interesse", "tenho interesse em comecar", "tenho interesse em participar",
      "estou interessado", "estou interessada", "estou pensando em comecar",
      "como faco para entrar", "como faco pra entrar", "como funciona para participar",
      "como funciona para entrar", "como faco para participar",
      "como faco para comecar", "como faco pra comecar", "como participo", "como viro cliente",
      "nao sei por onde comecar", "nao sei como comecar", "nao sei por onde comecar",
      "no se como comenzar", "no se por donde empezar", "no se como empezar",
      "no se por donde comenzar", "i dont know where to start", "i do not know where to start",
      "como me torno cliente", "como eu entro", "quero conhecer", "quero saber mais sobre a braxel",
      "i want to get started", "i want to start", "i want to join", "i want in",
      "i am interested", "im interested", "i am interested in joining",
      "interested in your services", "how can i start", "how can i start with braxel",
      "how do i start with braxel", "how do i join", "how can i join", "how do i become a customer",
      "how do i get started", "i want to learn more",
      "sign me up", "i want to invest with you", "i want to invest", "i am thinking about starting",
      "quiero empezar", "quiero comenzar", "quiero entrar", "quiero participar",
      "estoy interesado", "estoy interesada", "estoy interesado en comenzar",
      "quiero conocer mejor la empresa", "quiero conocer la empresa", "quiero saber mas",
      "como puedo unirme", "como me hago cliente", "como me uno", "como participo",
      "quiero contratar", "quiero invertir con ustedes", "quiero ser cliente",
      "voglio iniziare", "ich mochte anfangen", "je veux commencer", "хочу начать",
      "我想开始", "始めたい", "أريد أن أبدأ", "אני רוצה להתחיל",
    ],
  },
];

interface CompiledRule extends IntentRule {
  order: number;
  compiled: string[];
}

const COMPILED_RULES: CompiledRule[] = RULES.map((rule, order) => ({
  ...rule,
  order,
  compiled: rule.phrases.map((p) => normalizeElongated(p)).filter(Boolean),
}));

/** Words that show the message is about Braxel even without an exact phrase. */
const DOMAIN_TERMS = [
  "braxel", "company", "empresa", "servico", "service", "plano", "plan", "conta",
  "account", "pagamento", "payment", "checkout", "ativacao", "activation",
  "dashboard", "painel", "tradovate", "tradeify", "lucid", "prop firm", "kyc",
  "saque", "withdrawal", "suporte", "support", "sinal", "signals", "preco", "price",
  "trading", "trader", "corretora", "broker", "cadastro", "signup",
  "onboarding", "integracao", "reembolso", "refund", "cartao", "card", "cripto",
  "crypto", "stripe", "deposito", "deposit", "conta de cliente", "customer",
];

const FOLLOW_UP_EXPLAIN = [
  "me explica melhor", "explica melhor", "explica mais", "explica isso melhor",
  "explica de novo", "quero saber mais", "quero saber mais sobre isso", "pode continuar",
  "pode continuar explicando", "continua", "continue", "prossegue", "mais detalhes",
  "nao entendi", "nao entendi nada", "nao ficou claro", "ficou confuso",
  "explain more", "explain better", "tell me more", "more details", "go on", "continue",
  "i dont understand", "i did not understand", "i dont get it", "that is not clear",
  "como faco isso", "como faco isto", "como eu faco isso", "how do i do that",
  "how do i do this", "how do i do it", "como hago eso", "como hago esto",
  "comment je fais", "wie mache ich das", "как это сделать",
  "explicame mejor", "explica mejor", "quiero saber mas", "continua", "mas detalles",
  "no entendi", "no lo entendi", "no me quedo claro",
  "spiegami meglio", "erklare mir mehr", "explique mieux", "объясни подробнее",
  "再说详细一点", "もっと詳しく", "اشرح اكثر", "תסביר יותר",
];

const FOLLOW_UP_NEXT = [
  "e depois", "e agora", "o que faco agora", "o que fazer agora", "proximo passo",
  "qual o proximo passo", "e depois disso", "depois disso",
  "and now", "what now", "what next", "what is next",
  "what is the next step", "next step", "what happens after that", "and after that",
  "after that", "what happens next", "and then", "then what", "and what next",
  "y ahora", "y despues", "que hago ahora", "y despues de eso", "despues de eso",
  "que pasa ahora", "proximo paso", "und jetzt", "et maintenant", "что теперь",
  "然后呢", "次は", "وماذا بعد", "ומה עכשיו",
];

const FOLLOW_UP_DURATION = [
  "how long does it take", "how long does it takes", "how long will it take",
  "how long does that take", "how long does this take", "how long",
  "quanto tempo demora", "quanto tempo leva", "quanto demora",
  "cuanto tarda", "cuanto tiempo tarda", "cuanto demora",
  "wie lange dauert", "combien de temps", "quanto tempo",
];

const FOLLOW_UP_WHICH_PLAN = [
  "qual deles", "qual delas", "qual eu escolho", "qual devo escolher", "esse de",
  "essa de", "o de", "aquele de", "o segundo", "a segunda", "o terceiro",
  "which one", "which of them", "which should i choose",
  "that one", "the one for", "the second one", "the second", "second one",
  "number two", "the third one", "cual de ellos", "cual de ellas", "cual elijo",
  "ese de", "el de", "el segundo", "la segunda", "quale dei due", "welchen davon",
  "lequel", "le deuxieme",
];

const FOLLOW_UP_ALREADY_CREATED = [
  "ja criei", "ja criei a conta", "ja criei minha conta", "ja me cadastrei", "ja fiz isso",
  "i already created", "i already signed up", "i created my account", "account created",
  "i already did it", "already did it", "i did it already",
  "ya cree", "ya cree la cuenta", "ya me registre", "ya lo hice", "ya hice eso",
  "ho gia creato", "habe schon erstellt",
];

const FOLLOW_UP_ALREADY_PAID = [
  "ja paguei", "ja efetuei o pagamento", "pagamento feito", "i already paid", "i paid",
  "payment done", "payment made", "ya pague", "ya lo pague", "he pagado",
  "ho gia pagato", "habe schon bezahlt", "j ai deja paye",
];

const CJK = CJK_RE;

const ORDINAL_PLANS: Array<[RegExp, string]> = [
  [/\b(second|segundo|segunda|deuxieme|zweite|segunda|второй|第二|2nd)\b/, "professional"],
  [/\b(third|terceiro|terceira|troisieme|dritte|третий|第三|3rd)\b/, "business"],
  [/\b(fourth|quarto|quarta|quatrieme|vierte|четвертый|第四|4th)\b/, "enterprise"],
];

/** "the second one" -> the second canonical plan, if the message names one. */
function ordinalPlan(normalized: string): string | null {
  for (const [pattern, plan] of ORDINAL_PLANS) {
    if (pattern.test(normalized)) return plan;
  }
  return null;
}

/** True when the message itself names the topic (not just "explain more"). */
function namesTopic(normalized: string, topic: string | null): boolean {
  if (!topic) return false;
  const entry = articleById(topic);
  if (!entry) return false;
  const words = new Set<string>([
    ...tokenize(entry.title),
    ...entry.aliases.flatMap((a) => tokenize(a)),
    ...entry.keywords.flatMap((k) => tokenize(k)),
  ]);
  return tokenize(normalized).some((t) => t.length > 2 && words.has(t));
}

function matches(normalized: string, phrase: string): boolean {
  if (!phrase) return false;
  if (CJK.test(phrase)) return normalized.includes(phrase);
  return ` ${normalized} `.includes(` ${phrase} `);
}

function matchesAny(normalized: string, phrases: string[]): string | null {
  let best: string | null = null;
  for (const phrase of phrases) {
    const compiled = normalizeElongated(phrase);
    if (!compiled || !matches(normalized, compiled)) continue;
    if (!best || tokenize(compiled).length > tokenize(best).length) best = compiled;
  }
  return best;
}

function matchRule(normalized: string): { rule: CompiledRule; words: number } | null {
  let best: { rule: CompiledRule; words: number } | null = null;
  for (const rule of COMPILED_RULES) {
    for (const phrase of rule.compiled) {
      if (!matches(normalized, phrase)) continue;
      const words = tokenize(phrase).length || 1;
      if (
        !best || words > best.words ||
        (words === best.words && rule.order < best.rule.order)
      ) {
        best = { rule, words };
      }
    }
  }
  return best;
}

function inDomain(normalized: string, rankedScore: number): boolean {
  if (rankedScore >= MIN_INTENT_SCORE) return true;
  return DOMAIN_TERMS.some((term) => matches(normalized, normalizeElongated(term)));
}

/** Approved topic -> high-level intent, used when the knowledge matcher wins. */
export function intentForTopic(topic: string | null): ConversationalIntent {
  switch (topic) {
    case "getting_started":
      return "customer_interest";
    case "plans":
      return "plans";
    case "company_overview":
    case "accounts_prop_firms":
    case "contact_and_company":
      return "company_overview";
    case "how_it_works":
      return "how_it_works";
    case "onboarding":
      return "onboarding";
    case "activation":
      return "activation";
    case "payment_methods":
      return "payment_info";
    case "checkout":
      return "checkout";
    case "card_payment":
      return "card_payment";
    case "crypto_payment":
      return "crypto_payment";
    case "bank_transfer":
      return "bank_transfer";
    case "payment_status":
      return "payment_info";
    case "payment_failures":
      return "payment_failed";
    case "account_creation":
      return "account_creation";
    case "profile_and_signup":
      return "profile_completion";
    case "email_confirmation":
      return "email_confirmation";
    case "password_recovery":
      return "password_recovery";
    case "login_problem":
      return "login_problem";
    case "dashboard_usage":
      return "dashboard";
    case "tradovate_connection":
      return "tradovate";
    case "read_only_limits":
      return "read_only_limits";
    case "support_procedures":
    case "faq_help":
      return "support";
    case "benefits_and_features":
      return "benefits";
    case "requirements_and_eligibility":
      return "requirements";
    default:
      return "knowledge_topic";
  }
}

/** Topics whose natural follow-up question is the next onboarding step. */
const PAYMENT_TOPICS = new Set([
  "checkout",
  "payment_methods",
  "card_payment",
  "crypto_payment",
  "bank_transfer",
  "payment_status",
  "payment_failures",
]);

export interface ConversationOptions {
  history?: ChatTurn[];
}

/**
 * Classify the high-level conversational intent of one message.
 * Deterministic and pure; never answers and never calls a provider.
 */
export function classifyConversation(
  message: string,
  options: ConversationOptions = {},
): ConversationResult {
  const normalized = normalizeElongated(message);
  const query = normalizeQuery(message);
  const tokens = tokenize(normalized);
  const history = options.history ?? [];
  const contextTopic = contextIntentFromHistory(history);
  const planId = detectPlanReference(query);
  const explain = isExplainRequest(message);
  const mash = isKeyboardMash(message);
  const topicless = isTopicless(normalized) || mash;
  const ranked = rankEntries(message, KNOWLEDGE_INDEX).filter((r) => r.score >= MIN_INTENT_SCORE);
  const knowledgeTopic = ranked[0]?.id ?? null;
  const domain = inDomain(normalized, ranked[0]?.score ?? 0);

  const base = {
    confidence: 0.5,
    topic: null as string | null,
    inDomain: domain,
    planId,
    followUp: null as FollowUpKind | null,
    contextUsed: false,
    explain,
    unclear: false,
    matchedRule: false,
    normalized,
  };

  // 1. Social messages first: they must never be answered with an article.
  if (isGreeting(query, message)) {
    return { ...base, intent: "greeting", confidence: 0.95 };
  }
  if (isFarewell(normalized)) {
    return { ...base, intent: "farewell", confidence: 0.9 };
  }
  if (isThanks(query)) {
    return { ...base, intent: "thanks", confidence: 0.9 };
  }
  const confused = matchesAny(normalized, FOLLOW_UP_EXPLAIN) !== null;
  if (isAcknowledgement(normalized) && !isReferential(query) && !explain && !confused) {
    return { ...base, intent: "acknowledgement", confidence: 0.85 };
  }

  // 2. An explicit intent phrase ("quero começar", "qual plano", ...).
  const rule = matchRule(normalized);
  if (rule) {
    const intent = rule.rule.intent;
    // Conversational follow-up intents have no topic of their own: they refer
    // to the topic in play ("me explica melhor", "não entendi", "repete").
    const followUpKind: FollowUpKind | null =
      intent === "confusion" || intent === "simpler_explanation" || intent === "more_detail"
        ? "explain"
        : intent === "repeat"
          ? "repeat"
          : null;
    if (intent === "topic_change" && knowledgeTopic) {
      return {
        ...base,
        intent: intentForTopic(knowledgeTopic),
        topic: knowledgeTopic,
        confidence: 0.7,
        matchedRule: true,
        inDomain: true,
      };
    }
    const topic = rule.rule.topic ??
      (intent === "topic_change" ? null : contextTopic ?? knowledgeTopic);
    return {
      ...base,
      intent,
      topic,
      confidence: Math.min(0.95, 0.7 + rule.words * 0.03),
      matchedRule: true,
      inDomain: true,
      followUp: followUpKind,
      contextUsed: Boolean(!rule.rule.topic && topic),
      explain: intent === "simpler_explanation" || intent === "more_detail" ||
        intent === "confusion" || explain,
    };
  }

  // 3. An "explain it simply / step by step" request stays on the topic in
  //    play (or the article it already matched); it is never off-topic.
  if (explain) {
    // "explain the checkout" names a topic; only a topicless "explain more"
    // falls back to the topic already in play.
    const topic = namesTopic(normalized, knowledgeTopic)
      ? knowledgeTopic
      : contextTopic ?? knowledgeTopic;
    if (topic) {
      return {
        ...base,
        intent: intentForTopic(topic),
        topic,
        followUp: "explain",
        contextUsed: topic === contextTopic,
        confidence: 0.7,
      };
    }
  }

  // 4. Follow-ups: resolve the shape, then the topic from the conversation.
  const explainPhrase = matchesAny(normalized, FOLLOW_UP_EXPLAIN);
  if (explainPhrase) {
    if (namesTopic(normalized, knowledgeTopic) && knowledgeTopic) {
      return {
        ...base,
        intent: intentForTopic(knowledgeTopic),
        topic: knowledgeTopic,
        followUp: "explain",
        explain: true,
        confidence: 0.7,
      };
    }
    if (knowledgeTopic && !contextTopic) {
      return {
        ...base,
        intent: intentForTopic(knowledgeTopic),
        topic: knowledgeTopic,
        followUp: "explain",
        explain: true,
        confidence: 0.7,
      };
    }
    if (contextTopic) {
      return {
        ...base,
        intent: intentForTopic(contextTopic),
        topic: contextTopic,
        followUp: "explain",
        contextUsed: true,
        explain: true,
        confidence: 0.75,
      };
    }
    return { ...base, intent: "unclear", unclear: true, explain: true, confidence: 0.5 };
  }

  const duration = matchesAny(normalized, FOLLOW_UP_DURATION);
  if (duration && contextTopic) {
    const topic = PAYMENT_TOPICS.has(contextTopic) ? "payment_status" : contextTopic;
    return {
      ...base,
      intent: intentForTopic(topic),
      topic,
      followUp: "duration",
      contextUsed: true,
      confidence: 0.7,
    };
  }

  const whichPlan = matchesAny(normalized, FOLLOW_UP_WHICH_PLAN);
  if (whichPlan) {
    return {
      ...base,
      intent: "plans",
      topic: "plans",
      planId: ordinalPlan(normalized) ?? planId,
      followUp: "which_plan",
      contextUsed: Boolean(contextTopic),
      confidence: 0.75,
    };
  }

  const alreadyCreated = matchesAny(normalized, FOLLOW_UP_ALREADY_CREATED);
  if (alreadyCreated) {
    const topic = contextTopic === "account_creation" || contextTopic === "profile_and_signup"
      ? "plans"
      : contextTopic ?? "plans";
    return {
      ...base,
      intent: intentForTopic(topic),
      topic,
      followUp: "already_created",
      contextUsed: Boolean(contextTopic),
      confidence: 0.7,
    };
  }

  const alreadyPaid = matchesAny(normalized, FOLLOW_UP_ALREADY_PAID);
  if (alreadyPaid) {
    return {
      ...base,
      intent: "onboarding",
      topic: "onboarding",
      followUp: "already_paid",
      contextUsed: Boolean(contextTopic),
      confidence: 0.8,
    };
  }

  const nextStep = matchesAny(normalized, FOLLOW_UP_NEXT);
  if (nextStep && contextTopic) {
    // "And then?" after a payment answer is a question about the next step,
    // which is onboarding — not a second payment explanation.
    const NEXT_STEP_TOPIC: Record<string, string> = {
      account_creation: "checkout",
      profile_and_signup: "checkout",
      email_confirmation: "checkout",
    };
    const topic = PAYMENT_TOPICS.has(contextTopic)
      ? "onboarding"
      : NEXT_STEP_TOPIC[contextTopic] ?? contextTopic;
    return {
      ...base,
      intent: "follow_up",
      topic,
      followUp: "next_step",
      contextUsed: true,
      confidence: 0.7,
    };
  }

  // 5. A bare reference ("como faço isso?", "e esse?") is about the topic in
  //    play, never off-topic, when there is a conversation.
  if (isReferential(query) && contextTopic) {
    return {
      ...base,
      intent: "contextual_reference",
      topic: contextTopic,
      followUp: "reference",
      contextUsed: true,
      confidence: 0.65,
    };
  }

  // 6. A named plan without any other topic is a plans question.
  if (planId) {
    return { ...base, intent: "plans", topic: "plans", confidence: 0.7 };
  }

  // 7. The approved knowledge matcher found a topic: answer it.
  if (knowledgeTopic) {
    return {
      ...base,
      intent: intentForTopic(knowledgeTopic),
      topic: knowledgeTopic,
      confidence: 0.6,
    };
  }

  // 8. Short/vague or keyboard-mash input: ask one question, never guess.
  //    CJK text has no spaces, so one long token is a full sentence.
  if (topicless || (tokens.length <= 2 && !CJK.test(normalized)) ||
    (isReferential(query) && !contextTopic)) {
    return { ...base, intent: "unclear", unclear: true, confidence: 0.4 };
  }

  // 9. A complete message about Braxel that we cannot place: clarify.
  if (domain) {
    return { ...base, intent: "unclear", unclear: true, confidence: 0.45 };
  }

  // 10. Clearly unrelated to Braxel.
  return { ...base, intent: "off_topic", confidence: 0.8 };
}

/** True when the reply should be a short conversational line, not an article. */
export function isSocialIntent(intent: ConversationalIntent): boolean {
  return intent === "greeting" || intent === "farewell" || intent === "thanks" ||
    intent === "acknowledgement";
}

/** True when a localized conversational reply exists for this intent. */
export function hasConversationalReply(intent: ConversationalIntent): boolean {
  return intent === "customer_interest" || intent === "requirements" ||
    intent === "eligibility" || intent === "benefits" || intent === "what_we_do" ||
    intent === "complaint" || intent === "farewell" || intent === "acknowledgement";
}
