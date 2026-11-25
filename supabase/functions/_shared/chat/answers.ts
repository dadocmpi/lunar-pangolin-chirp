// ============================================================================
// Localized short answers for the support chatbot.
//
// The knowledge base (knowledge.ts) is written in English. A model provider can
// translate it on the fly, but the assistant must also answer correctly with no
// provider configured, in the language the customer actually used. This module
// holds one short, faithful answer per core topic in all 11 locales, plus the
// topic labels used by the clarifying question.
//
// Rules:
//   * every sentence mirrors the approved English knowledge — no new facts;
//   * prices are never written here: {{plans}} is replaced with the canonical
//     plan table at runtime, so a price change can never drift;
//   * no promise, no advice, no legal claim, no customer data.
//
// Pure data + pure lookup. No I/O, no model, no user data.
// ============================================================================

import type { SupportedLocale } from "./language.ts";
import { PLANS, PLAN_IDS } from "../plans.ts";

/** Topics with a localized short answer. */
export const ANSWER_KEYS = [
  "getting_started",
  "account_creation",
  "email_confirmation",
  "password_recovery",
  "plans",
  "checkout",
  "payment_methods",
  "payment_status",
  "onboarding",
  "activation",
  "dashboard_usage",
  "tradovate_connection",
  "withdrawal_kyc",
  "support_procedures",
  "company_overview",
] as const;

export type AnswerKey = (typeof ANSWER_KEYS)[number];

/** Topics with a localized label (used by the clarifying question). */
export const TOPIC_KEYS = [
  "getting_started",
  "account_creation",
  "plans",
  "checkout",
  "payment_status",
  "activation",
  "dashboard_usage",
  "tradovate_connection",
] as const;

export type TopicKey = (typeof TOPIC_KEYS)[number];

export interface LocaleAnswers {
  answers: Record<AnswerKey, string>;
  topics: Record<TopicKey, string>;
  /** "Did you mean {{a}} or {{b}}?" */
  clarifyPair: string;
  /** Generic clarifying question when no topic was detected at all. */
  clarifyOpen: string;
  greeting: string;
  thanks: string;
}

/** Canonical plan sentence built from the server plan table (never hard-coded). */
export function planSummary(): string {
  return PLAN_IDS.map((id) => {
    const plan = PLANS[id];
    return `${plan.name}: $${(plan.priceCents / 100).toFixed(2)} USD/month (${plan.managedCapitalUsd.toLocaleString("en-US")} USD managed capital reference).`;
  }).join(" ");
}

const PLAN_PLACEHOLDER = "{{plans}}";

export function fillPlaceholders(text: string): string {
  return text.split(PLAN_PLACEHOLDER).join(planSummary());
}

/** The localized short answer for a topic, or null when there is none. */
export function localizedAnswer(
  locale: SupportedLocale,
  id: string,
): string | null {
  const table = LOCALIZED_ANSWERS[locale] ?? LOCALIZED_ANSWERS.en;
  const value = (table.answers as Record<string, string | undefined>)[id];
  return value ? fillPlaceholders(value) : null;
}

export function topicLabel(locale: SupportedLocale, id: string): string | null {
  const table = LOCALIZED_ANSWERS[locale] ?? LOCALIZED_ANSWERS.en;
  return (table.topics as Record<string, string | undefined>)[id] ?? null;
}

/**
 * One short clarifying question. With two candidate topics it names both;
 * otherwise it asks an open question with a few examples.
 */
export function clarifyQuestion(
  locale: SupportedLocale,
  topicIds: string[] = [],
): string {
  const table = LOCALIZED_ANSWERS[locale] ?? LOCALIZED_ANSWERS.en;
  const labels = topicIds
    .map((id) => topicLabel(locale, id))
    .filter((label): label is string => Boolean(label));
  if (labels.length >= 2) {
    return table.clarifyPair.split("{{a}}").join(labels[0]).split("{{b}}").join(labels[1]);
  }
  return table.clarifyOpen;
}

export function greetingReply(locale: SupportedLocale): string {
  return (LOCALIZED_ANSWERS[locale] ?? LOCALIZED_ANSWERS.en).greeting;
}

export function thanksReply(locale: SupportedLocale): string {
  return (LOCALIZED_ANSWERS[locale] ?? LOCALIZED_ANSWERS.en).thanks;
}

export const LOCALIZED_ANSWERS: Record<SupportedLocale, LocaleAnswers> = {
  en: {
    answers: {
      getting_started:
        "Start by creating an account, confirming your email, choosing a plan and paying at checkout. After the payment is confirmed you complete the onboarding disclosures and request activation of your external prop-firm account.",
      account_creation:
        "Create your account on the Register page: name, email, a password of at least 6 characters and acceptance of the Terms and Privacy Policy. Step 2 asks for phone, country and address.",
      email_confirmation:
        "After signup we send a confirmation email. Open the link in it to activate sign-in; if it did not arrive, check the spam folder and resend it from the Login page.",
      password_recovery:
        "Use 'Forgot password?' on the Login page. We email a recovery link that opens the Reset Password page, where you set a new password. The link expires and can only be used once.",
      plans:
        "We have four monthly plans, all charged in USD: {{plans}} The amount shown at checkout is the authoritative one.",
      checkout:
        "Checkout is one page: plan summary, your billing details and the payment method. Accept the Terms and Privacy Policy, then pay by card (Stripe hosted page), bank transfer or crypto when it is configured.",
      payment_methods:
        "Card payments open Stripe's hosted checkout and our app never sees your card number. Bank transfer shows the bank details and a reference and is reviewed manually. Crypto works only on the networks configured on the server, and everything is charged in USD.",
      payment_status:
        "Your payment status is shown in the dashboard and on the checkout success page. Only a server-verified confirmation marks it as confirmed; card confirmations usually arrive through the provider webhook and bank transfers are reviewed manually. If something looks wrong, do not pay twice — contact support.",
      onboarding:
        "After a confirmed payment, complete the onboarding disclosures and submit the account-link request for your own prop-firm account. An operator reviews it manually and the dashboard shows the status.",
      activation:
        "You buy the account directly from the prop firm (Tradeify or Lucid) through our affiliate link, then request activation in the dashboard with the firm, plan, account login/ID, purchase email and a receipt. An operator reviews it manually — never enter your broker password.",
      dashboard_usage:
        "The dashboard shows your services, the payment card, account activation, your profile, performance and an audit log. Performance comes only from your own closed trades, and you can open the dashboard without Tradovate and without KYC.",
      tradovate_connection:
        "Tradovate is an optional, read-only integration and it does not connect to your prop-firm account: you execute the signals yourself. Braxel cannot place, modify or liquidate orders, withdraw funds or transfer money, and never asks for your Tradovate credentials.",
      withdrawal_kyc:
        "You can use the dashboard without identity verification. KYC is required only when you request a withdrawal and the request is checked on the server. Upload documents through the authenticated page and never send identity documents in this chat.",
      support_procedures:
        "Human support is the Contact page or marketsbraxel@ouvidor.net. Include your account email, the plan or order reference and a short description, and never include passwords, card numbers or API keys.",
      company_overview:
        "Braxel Markets is a trading-technology and managed-service brand, not a prop firm: it does not custody customer funds or process prop-firm payouts, and it does not guarantee returns. The address in the footer is Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain.",
    },
    topics: {
      getting_started: "getting started",
      account_creation: "creating an account",
      plans: "plans and prices",
      checkout: "payment at checkout",
      payment_status: "payment status",
      activation: "account activation",
      dashboard_usage: "the dashboard",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Just to be sure: do you mean {{a}} or {{b}}?",
    clarifyOpen:
      "I want to make sure I answer the right thing. Is your question about plans and prices, payment, account activation, or the dashboard?",
    greeting:
      "Hi! I'm the Braxel Markets assistant. I can explain the plans, checkout, payment status, activation, the dashboard and Tradovate. What would you like to know?",
    thanks: "You're welcome! Is there anything else about Braxel I can help you with?",
  },
  pt: {
    answers: {
      getting_started:
        "Comece por criar a conta, confirmar o email, escolher um plano e pagar no checkout. Depois de o pagamento ser confirmado, complete as declarações de integração e peça a ativação da sua conta de prop firm.",
      account_creation:
        "Crie a conta na página de registo: nome, email, uma palavra-passe com pelo menos 6 caracteres e aceitação dos Termos e da Política de Privacidade. O passo 2 pede telefone, país e endereço.",
      email_confirmation:
        "Depois do registo enviamos um email de confirmação. Abra a ligação desse email para ativar o início de sessão; se não chegou, verifique o spam e reenvie na página de início de sessão.",
      password_recovery:
        "Use a ligação «Esqueceu-se da palavra-passe?» na página de início de sessão. Enviamos um link de recuperação que abre a página de reposição, onde define uma nova palavra-passe. O link expira e só pode ser usado uma vez.",
      plans:
        "Temos quatro planos mensais, todos cobrados em USD: {{plans}} O valor mostrado no checkout é o valor oficial.",
      checkout:
        "O checkout é uma só página: resumo do plano, dados de faturação e método de pagamento. Aceite os Termos e a Privacidade e pague com cartão (página do Stripe), transferência bancária ou cripto quando estiver configurado.",
      payment_methods:
        "O cartão abre a página segura do Stripe e a nossa aplicação nunca vê o número do cartão. A transferência bancária mostra os dados e uma referência e é revista manualmente. A cripto só funciona nas redes configuradas no servidor, e tudo é cobrado em USD.",
      payment_status:
        "O estado do pagamento aparece no painel e na página de sucesso do checkout. Só uma confirmação verificada no servidor marca o pagamento como confirmado; o cartão costuma confirmar pelo webhook e a transferência é revista manualmente. Se algo parecer errado, não pague duas vezes — contacte o suporte.",
      onboarding:
        "Depois do pagamento confirmado, complete as declarações de integração e envie o pedido de ligação da conta da sua prop firm. Um operador revê o pedido manualmente e o painel mostra o estado.",
      activation:
        "Compra a conta diretamente à prop firm (Tradeify ou Lucid) pela nossa ligação de afiliado e depois pede a ativação no painel, com a firma, o plano, o login/ID da conta, o email da compra e o comprovativo. Um operador revê manualmente — nunca introduza a palavra-passe da corretora.",
      dashboard_usage:
        "O painel mostra os seus serviços, o cartão de pagamento, a ativação da conta, o perfil, o desempenho e o registo de auditoria. O desempenho vem apenas das suas operações fechadas, e pode abrir o painel sem Tradovate e sem KYC.",
      tradovate_connection:
        "A Tradovate é uma integração opcional e só de leitura, e não se liga à sua conta de prop firm: é você que executa os sinais. A Braxel não coloca, altera nem liquida ordens, não levanta nem transfere dinheiro e nunca pede as suas credenciais Tradovate.",
      withdrawal_kyc:
        "Pode usar o painel sem verificação de identidade. O KYC só é necessário quando pede um levantamento, e o pedido é verificado no servidor. Envie os documentos pela página autenticada e nunca envie documentos de identidade neste chat.",
      support_procedures:
        "O suporte humano é a página de contacto ou marketsbraxel@ouvidor.net. Indique o email da conta, a referência do plano ou da encomenda e uma descrição curta, e nunca inclua palavras-passe, números de cartão ou chaves de API.",
      company_overview:
        "A Braxel Markets é uma marca de tecnologia e serviços de negociação, não é uma prop firm: não guarda fundos de clientes nem processa pagamentos de prop firms, e não garante retornos. A morada no rodapé é Calle de la Haya, 28935, Parque Coimbra, Madrid, Espanha.",
    },
    topics: {
      getting_started: "começar",
      account_creation: "criar uma conta",
      plans: "planos e preços",
      checkout: "pagamento no checkout",
      payment_status: "estado do pagamento",
      activation: "ativação da conta",
      dashboard_usage: "o painel",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Só para confirmar: quer saber sobre {{a}} ou sobre {{b}}?",
    clarifyOpen:
      "Quero responder à pergunta certa. A sua dúvida é sobre planos e preços, pagamento, ativação da conta ou o painel?",
    greeting:
      "Olá! Sou o assistente da Braxel Markets. Posso explicar os planos, o checkout, o estado do pagamento, a ativação, o painel e a Tradovate. O que quer saber?",
    thanks: "De nada! Posso ajudar com mais alguma coisa sobre a Braxel?",
  },
  es: {
    answers: {
      getting_started:
        "Empieza creando la cuenta, confirmando tu correo, eligiendo un plan y pagando en el checkout. Cuando el pago esté confirmado, completa las declaraciones de incorporación y pide la activación de tu cuenta de prop firm.",
      account_creation:
        "Crea la cuenta en la página de registro: nombre, correo, una contraseña de al menos 6 caracteres y aceptación de los Términos y la Política de Privacidad. El paso 2 pide teléfono, país y dirección.",
      email_confirmation:
        "Después del registro enviamos un correo de confirmación. Abre el enlace de ese correo para activar el inicio de sesión; si no llegó, revisa el spam y reenvíalo desde la página de inicio de sesión.",
      password_recovery:
        "Usa «¿Olvidaste tu contraseña?» en la página de inicio de sesión. Te enviamos un enlace de recuperación que abre la página para poner una contraseña nueva. El enlace caduca y solo se puede usar una vez.",
      plans:
        "Tenemos cuatro planes mensuales, todos cobrados en USD: {{plans}} El importe que muestra el checkout es el oficial.",
      checkout:
        "El checkout es una sola página: resumen del plan, datos de facturación y método de pago. Acepta los Términos y la Privacidad y paga con tarjeta (página de Stripe), transferencia bancaria o cripto cuando esté configurado.",
      payment_methods:
        "La tarjeta abre la página segura de Stripe y nuestra aplicación nunca ve el número de la tarjeta. La transferencia muestra los datos y una referencia y se revisa manualmente. La cripto solo funciona en las redes configuradas en el servidor, y todo se cobra en USD.",
      payment_status:
        "El estado del pago aparece en el panel y en la página de éxito del checkout. Solo una confirmación verificada en el servidor marca el pago como confirmado; la tarjeta suele confirmar por el webhook y la transferencia se revisa manualmente. Si algo parece mal, no pagues dos veces: contacta con el soporte.",
      onboarding:
        "Después del pago confirmado, completa las declaraciones de incorporación y envía la solicitud de vinculación de la cuenta de tu prop firm. Un operador la revisa manualmente y el panel muestra el estado.",
      activation:
        "Compras la cuenta directamente a la prop firm (Tradeify o Lucid) con nuestro enlace de afiliado y luego pides la activación en el panel, con la firma, el plan, el login/ID de la cuenta, el correo de compra y el comprobante. Un operador la revisa manualmente: nunca introduzcas tu contraseña del bróker.",
      dashboard_usage:
        "El panel muestra tus servicios, la tarjeta de pago, la activación de la cuenta, tu perfil, el rendimiento y el registro de auditoría. El rendimiento sale solo de tus operaciones cerradas, y puedes abrir el panel sin Tradovate y sin KYC.",
      tradovate_connection:
        "Tradovate es una integración opcional y de solo lectura, y no se conecta a tu cuenta de prop firm: las señales las ejecutas tú. Braxel no pone, modifica ni liquida órdenes, no retira ni transfiere dinero y nunca pide tus credenciales de Tradovate.",
      withdrawal_kyc:
        "Puedes usar el panel sin verificación de identidad. El KYC solo es necesario cuando pides un retiro, y la solicitud se verifica en el servidor. Sube los documentos por la página autenticada y nunca envíes documentos de identidad por este chat.",
      support_procedures:
        "El soporte humano es la página de contacto o marketsbraxel@ouvidor.net. Incluye el correo de tu cuenta, la referencia del plan o del pedido y una descripción corta, y nunca incluyas contraseñas, números de tarjeta ni claves de API.",
      company_overview:
        "Braxel Markets es una marca de tecnología y servicios de trading, no es una prop firm: no custodia fondos de clientes ni procesa pagos de prop firms, y no garantiza rentabilidades. La dirección del pie de página es Calle de la Haya, 28935, Parque Coimbra, Madrid, España.",
    },
    topics: {
      getting_started: "empezar",
      account_creation: "crear una cuenta",
      plans: "planes y precios",
      checkout: "el pago en el checkout",
      payment_status: "el estado del pago",
      activation: "la activación de la cuenta",
      dashboard_usage: "el panel",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Para asegurarme: ¿te refieres a {{a}} o a {{b}}?",
    clarifyOpen:
      "Quiero responder a la pregunta correcta. ¿Tu duda es sobre planes y precios, pago, activación de la cuenta o el panel?",
    greeting:
      "¡Hola! Soy el asistente de Braxel Markets. Puedo explicar los planes, el checkout, el estado del pago, la activación, el panel y Tradovate. ¿Qué quieres saber?",
    thanks: "¡De nada! ¿Puedo ayudarte con algo más sobre Braxel?",
  },
  it: {
    answers: {
      getting_started:
        "Inizia creando l'account, confermando l'email, scegliendo un piano e pagando al checkout. Dopo la conferma del pagamento completa le dichiarazioni di onboarding e richiedi l'attivazione del tuo conto prop firm.",
      account_creation:
        "Crea l'account nella pagina di registrazione: nome, email, una password di almeno 6 caratteri e accettazione dei Termini e della Privacy. Il passo 2 chiede telefono, paese e indirizzo.",
      email_confirmation:
        "Dopo la registrazione inviamo un'email di conferma. Apri il link di quell'email per attivare l'accesso; se non è arrivata, controlla lo spam e richiedila dalla pagina di accesso.",
      password_recovery:
        "Usa «Password dimenticata?» nella pagina di accesso. Ti inviamo un link di recupero che apre la pagina per impostare una nuova password. Il link scade e si può usare una sola volta.",
      plans:
        "Abbiamo quattro piani mensili, tutti addebitati in USD: {{plans}} L'importo mostrato al checkout è quello ufficiale.",
      checkout:
        "Il checkout è una sola pagina: riepilogo del piano, dati di fatturazione e metodo di pagamento. Accetta Termini e Privacy e paga con carta (pagina Stripe), bonifico o cripto quando è configurato.",
      payment_methods:
        "La carta apre la pagina sicura di Stripe e la nostra applicazione non vede mai il numero della carta. Il bonifico mostra i dati e un riferimento ed è verificato manualmente. Le cripto funzionano solo sulle reti configurate sul server, e tutto è addebitato in USD.",
      payment_status:
        "Lo stato del pagamento è nel pannello e nella pagina di successo del checkout. Solo una conferma verificata sul server segna il pagamento come confermato; la carta di solito conferma tramite webhook e il bonifico è verificato manualmente. Se qualcosa non torna, non pagare due volte: contatta il supporto.",
      onboarding:
        "Dopo il pagamento confermato, completa le dichiarazioni di onboarding e invia la richiesta di collegamento del conto della tua prop firm. Un operatore la verifica manualmente e il pannello mostra lo stato.",
      activation:
        "Compri il conto direttamente dalla prop firm (Tradeify o Lucid) con il nostro link affiliato, poi richiedi l'attivazione nel pannello con la firma, il piano, il login/ID del conto, l'email di acquisto e la ricevuta. Un operatore verifica manualmente: non inserire mai la password del broker.",
      dashboard_usage:
        "Il pannello mostra i tuoi servizi, la carta di pagamento, l'attivazione del conto, il profilo, le performance e il registro di audit. Le performance derivano solo dalle tue operazioni chiuse e puoi aprire il pannello senza Tradovate e senza KYC.",
      tradovate_connection:
        "Tradovate è un'integrazione opzionale e di sola lettura e non si collega al tuo conto prop firm: i segnali li esegui tu. Braxel non inserisce, modifica o chiude ordini, non preleva né trasferisce denaro e non chiede mai le tue credenziali Tradovate.",
      withdrawal_kyc:
        "Puoi usare il pannello senza verifica dell'identità. Il KYC serve solo quando richiedi un prelievo e la richiesta è verificata sul server. Carica i documenti dalla pagina autenticata e non inviare mai documenti d'identità in questa chat.",
      support_procedures:
        "Il supporto umano è la pagina dei contatti o marketsbraxel@ouvidor.net. Indica l'email dell'account, il riferimento del piano o dell'ordine e una breve descrizione, e non includere mai password, numeri di carta o chiavi API.",
      company_overview:
        "Braxel Markets è un marchio di tecnologia e servizi di trading, non è una prop firm: non custodisce fondi dei clienti, non gestisce pagamenti di prop firm e non garantisce rendimenti. L'indirizzo nel footer è Calle de la Haya, 28935, Parque Coimbra, Madrid, Spagna.",
    },
    topics: {
      getting_started: "iniziare",
      account_creation: "creare un account",
      plans: "piani e prezzi",
      checkout: "il pagamento al checkout",
      payment_status: "lo stato del pagamento",
      activation: "l'attivazione del conto",
      dashboard_usage: "il pannello",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Per essere sicuro: intendi {{a}} o {{b}}?",
    clarifyOpen:
      "Voglio rispondere alla domanda giusta. La tua domanda riguarda piani e prezzi, pagamento, attivazione del conto o il pannello?",
    greeting:
      "Ciao! Sono l'assistente di Braxel Markets. Posso spiegare i piani, il checkout, lo stato del pagamento, l'attivazione, il pannello e Tradovate. Cosa vuoi sapere?",
    thanks: "Prego! Posso aiutarti con altro su Braxel?",
  },
  fr: {
    answers: {
      getting_started:
        "Commencez par créer un compte, confirmer votre e-mail, choisir un forfait et payer. Une fois le paiement confirmé, complétez les déclarations d'intégration et demandez l'activation de votre compte prop firm.",
      account_creation:
        "Créez votre compte sur la page d'inscription : nom, e-mail, un mot de passe d'au moins 6 caractères et acceptation des Conditions et de la Confidentialité. L'étape 2 demande téléphone, pays et adresse.",
      email_confirmation:
        "Après l'inscription nous envoyons un e-mail de confirmation. Ouvrez le lien de cet e-mail pour activer la connexion ; s'il n'est pas arrivé, vérifiez les spams et renvoyez-le depuis la page de connexion.",
      password_recovery:
        "Utilisez « Mot de passe oublié ? » sur la page de connexion. Nous envoyons un lien de récupération qui ouvre la page de réinitialisation, où vous définissez un nouveau mot de passe. Le lien expire et ne sert qu'une fois.",
      plans:
        "Nous proposons quatre forfaits mensuels, tous facturés en USD : {{plans}} Le montant affiché au paiement est le montant officiel.",
      checkout:
        "Le paiement tient sur une page : récapitulatif du forfait, coordonnées de facturation et moyen de paiement. Acceptez les Conditions et la Confidentialité puis payez par carte (page Stripe), virement ou crypto lorsque c'est configuré.",
      payment_methods:
        "La carte ouvre la page sécurisée de Stripe et notre application ne voit jamais le numéro de carte. Le virement affiche les coordonnées et une référence et est vérifié manuellement. La crypto ne fonctionne que sur les réseaux configurés sur le serveur, et tout est facturé en USD.",
      payment_status:
        "Le statut du paiement est visible dans le tableau de bord et sur la page de succès. Seule une confirmation vérifiée côté serveur marque le paiement comme confirmé ; la carte confirme par webhook et le virement est vérifié manuellement. Si quelque chose semble anormal, ne payez pas deux fois : contactez le support.",
      onboarding:
        "Après un paiement confirmé, complétez les déclarations d'intégration et envoyez la demande de rattachement du compte de votre prop firm. Un opérateur la vérifie manuellement et le tableau de bord affiche le statut.",
      activation:
        "Vous achetez le compte directement auprès de la prop firm (Tradeify ou Lucid) via notre lien d'affiliation, puis vous demandez l'activation dans le tableau de bord avec la firme, le forfait, l'identifiant du compte, l'e-mail d'achat et le justificatif. Un opérateur vérifie manuellement : ne saisissez jamais votre mot de passe de courtier.",
      dashboard_usage:
        "Le tableau de bord montre vos services, la carte de paiement, l'activation du compte, votre profil, les performances et le journal d'audit. Les performances viennent uniquement de vos transactions clôturées, et vous pouvez ouvrir le tableau de bord sans Tradovate et sans KYC.",
      tradovate_connection:
        "Tradovate est une intégration facultative et en lecture seule, et elle ne se connecte pas à votre compte prop firm : c'est vous qui exécutez les signaux. Braxel ne passe, ne modifie ni ne liquide d'ordres, ne retire ni ne transfère d'argent et ne demande jamais vos identifiants Tradovate.",
      withdrawal_kyc:
        "Vous pouvez utiliser le tableau de bord sans vérification d'identité. Le KYC n'est requis que pour une demande de retrait, et la demande est vérifiée côté serveur. Téléversez les documents depuis la page authentifiée et n'envoyez jamais de pièce d'identité dans ce chat.",
      support_procedures:
        "Le support humain est la page de contact ou marketsbraxel@ouvidor.net. Indiquez l'e-mail du compte, la référence du forfait ou de la commande et une courte description, et n'incluez jamais de mot de passe, de numéro de carte ou de clé API.",
      company_overview:
        "Braxel Markets est une marque de technologie et de services de trading, pas une prop firm : elle ne détient pas les fonds des clients, ne traite pas les paiements des prop firms et ne garantit aucun rendement. L'adresse du pied de page est Calle de la Haya, 28935, Parque Coimbra, Madrid, Espagne.",
    },
    topics: {
      getting_started: "commencer",
      account_creation: "créer un compte",
      plans: "les forfaits et les prix",
      checkout: "le paiement",
      payment_status: "le statut du paiement",
      activation: "l'activation du compte",
      dashboard_usage: "le tableau de bord",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Pour être sûr : parlez-vous de {{a}} ou de {{b}} ?",
    clarifyOpen:
      "Je veux répondre à la bonne question. Votre question porte-t-elle sur les forfaits et les prix, le paiement, l'activation du compte ou le tableau de bord ?",
    greeting:
      "Bonjour ! Je suis l'assistant de Braxel Markets. Je peux expliquer les forfaits, le paiement, le statut du paiement, l'activation, le tableau de bord et Tradovate. Que voulez-vous savoir ?",
    thanks: "Avec plaisir ! Puis-je vous aider sur autre chose concernant Braxel ?",
  },
  de: {
    answers: {
      getting_started:
        "Beginnen Sie mit einem Konto, bestätigen Sie die E-Mail, wählen Sie einen Plan und zahlen Sie im Checkout. Nach der bestätigten Zahlung füllen Sie die Onboarding-Erklärungen aus und beantragen die Aktivierung Ihres Prop-Firm-Kontos.",
      account_creation:
        "Erstellen Sie das Konto auf der Registrierungsseite: Name, E-Mail, ein Passwort mit mindestens 6 Zeichen und die Zustimmung zu AGB und Datenschutz. Schritt 2 fragt Telefon, Land und Adresse.",
      email_confirmation:
        "Nach der Registrierung senden wir eine Bestätigungs-E-Mail. Öffnen Sie den Link darin, um die Anmeldung zu aktivieren; wenn sie nicht ankam, prüfen Sie den Spam-Ordner und senden Sie sie auf der Anmeldeseite erneut.",
      password_recovery:
        "Nutzen Sie „Passwort vergessen?“ auf der Anmeldeseite. Wir senden einen Wiederherstellungslink, der die Seite zum Setzen eines neuen Passworts öffnet. Der Link läuft ab und funktioniert nur einmal.",
      plans:
        "Es gibt vier monatliche Pläne, alle in USD abgerechnet: {{plans}} Der im Checkout angezeigte Betrag ist der offizielle.",
      checkout:
        "Der Checkout ist eine Seite: Planübersicht, Rechnungsdaten und Zahlungsart. Akzeptieren Sie AGB und Datenschutz und zahlen Sie per Karte (Stripe-Seite), Überweisung oder Krypto, wenn es eingerichtet ist.",
      payment_methods:
        "Die Karte öffnet die sichere Seite von Stripe, unsere App sieht die Kartennummer nie. Die Überweisung zeigt Bankdaten und eine Referenz und wird manuell geprüft. Krypto geht nur in den auf dem Server eingerichteten Netzwerken, und alles wird in USD abgerechnet.",
      payment_status:
        "Der Zahlungsstatus steht im Dashboard und auf der Erfolgsseite des Checkouts. Nur eine serverseitig geprüfte Bestätigung markiert die Zahlung als bestätigt; Karten bestätigen meist über den Webhook und Überweisungen werden manuell geprüft. Wenn etwas falsch aussieht, zahlen Sie nicht doppelt – kontaktieren Sie den Support.",
      onboarding:
        "Nach einer bestätigten Zahlung füllen Sie die Onboarding-Erklärungen aus und senden die Verknüpfungsanfrage für Ihr Prop-Firm-Konto. Ein Mitarbeiter prüft sie manuell und das Dashboard zeigt den Status.",
      activation:
        "Sie kaufen das Konto direkt bei der Prop-Firm (Tradeify oder Lucid) über unseren Affiliate-Link und beantragen dann die Aktivierung im Dashboard mit Firma, Plan, Konto-Login/ID, Kauf-E-Mail und Beleg. Ein Mitarbeiter prüft manuell – geben Sie niemals Ihr Broker-Passwort ein.",
      dashboard_usage:
        "Das Dashboard zeigt Ihre Dienste, die Zahlungskarte, die Kontoaktivierung, Ihr Profil, die Performance und das Audit-Log. Die Performance stammt nur aus Ihren geschlossenen Trades, und Sie können das Dashboard ohne Tradovate und ohne KYC öffnen.",
      tradovate_connection:
        "Tradovate ist eine optionale Integration mit Nur-Lese-Zugriff und verbindet sich nicht mit Ihrem Prop-Firm-Konto: Sie führen die Signale selbst aus. Braxel kann keine Orders platzieren, ändern oder schließen, kein Geld abheben oder überweisen und fragt nie nach Ihren Tradovate-Zugangsdaten.",
      withdrawal_kyc:
        "Sie können das Dashboard ohne Identitätsprüfung nutzen. KYC ist nur für eine Auszahlung nötig, und die Anfrage wird auf dem Server geprüft. Laden Sie Dokumente über die authentifizierte Seite hoch und senden Sie nie Ausweisdokumente in diesem Chat.",
      support_procedures:
        "Der menschliche Support ist die Kontaktseite oder marketsbraxel@ouvidor.net. Nennen Sie die Konto-E-Mail, die Plan- oder Bestellreferenz und eine kurze Beschreibung und niemals Passwörter, Kartennummern oder API-Schlüssel.",
      company_overview:
        "Braxel Markets ist eine Marke für Trading-Technologie und -Dienstleistungen, keine Prop-Firm: Sie verwahrt keine Kundengelder, verarbeitet keine Prop-Firm-Auszahlungen und garantiert keine Renditen. Die Adresse in der Fußzeile ist Calle de la Haya, 28935, Parque Coimbra, Madrid, Spanien.",
    },
    topics: {
      getting_started: "der Einstieg",
      account_creation: "ein Konto erstellen",
      plans: "Pläne und Preise",
      checkout: "die Zahlung im Checkout",
      payment_status: "der Zahlungsstatus",
      activation: "die Kontoaktivierung",
      dashboard_usage: "das Dashboard",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Nur zur Sicherheit: meinen Sie {{a}} oder {{b}}?",
    clarifyOpen:
      "Ich möchte die richtige Frage beantworten. Geht es um Pläne und Preise, die Zahlung, die Kontoaktivierung oder das Dashboard?",
    greeting:
      "Hallo! Ich bin der Assistent von Braxel Markets. Ich kann Pläne, Checkout, Zahlungsstatus, Aktivierung, Dashboard und Tradovate erklären. Was möchten Sie wissen?",
    thanks: "Gern! Kann ich noch bei etwas anderem zu Braxel helfen?",
  },
  ru: {
    answers: {
      getting_started:
        "Начните с создания аккаунта, подтверждения почты, выбора тарифа и оплаты. После подтверждения оплаты заполните онбординг-декларации и запросите активацию вашего счёта в проп-фирме.",
      account_creation:
        "Создайте аккаунт на странице регистрации: имя, почта, пароль не короче 6 символов и согласие с Условиями и Политикой конфиденциальности. На втором шаге нужны телефон, страна и адрес.",
      email_confirmation:
        "После регистрации мы отправляем письмо с подтверждением. Откройте ссылку в письме, чтобы включить вход; если письма нет, проверьте спам и отправьте его снова со страницы входа.",
      password_recovery:
        "Нажмите «Забыли пароль?» на странице входа. Мы отправим ссылку для восстановления, она открывает страницу смены пароля. Ссылка действует один раз и затем истекает.",
      plans:
        "У нас четыре месячных тарифа, все в USD: {{plans}} Сумма в оформлении заказа является основной.",
      checkout:
        "Оформление — одна страница: состав тарифа, платёжные данные и способ оплаты. Примите Условия и Политику, затем оплатите картой (страница Stripe), переводом или криптой, если это настроено.",
      payment_methods:
        "Карта открывает защищённую страницу Stripe, и наше приложение не видит номер карты. Перевод показывает банковские реквизиты и назначение и проверяется вручную. Крипта работает только в сетях, настроенных на сервере, и всё списывается в USD.",
      payment_status:
        "Статус оплаты виден в панели и на странице успешной оплаты. Только подтверждение, проверенное на сервере, помечает платёж оплаченным; карта обычно подтверждается через webhook, а перевод проверяется вручную. Если что-то не так, не платите дважды — напишите в поддержку.",
      onboarding:
        "После подтверждённой оплаты заполните онбординг-декларации и отправьте запрос на привязку счёта вашей проп-фирмы. Сотрудник проверяет его вручную, а панель показывает статус.",
      activation:
        "Вы покупаете счёт напрямую в проп-фирме (Tradeify или Lucid) по нашей партнёрской ссылке, затем запрашиваете активацию в панели: фирма, тариф, логин/ID счёта, почта покупки и чек. Сотрудник проверяет вручную — никогда не вводите пароль брокера.",
      dashboard_usage:
        "В панели есть ваши услуги, карта оплаты, активация аккаунта, профиль, результаты и журнал действий. Результаты считаются только по вашим закрытым сделкам, и панель открывается без Tradovate и без KYC.",
      tradovate_connection:
        "Tradovate — необязательная интеграция только для чтения, и она не подключается к вашему счёту в проп-фирме: сигналы вы исполняете сами. Braxel не выставляет, не меняет и не закрывает ордера, не выводит и не переводит деньги и никогда не просит ваши данные Tradovate.",
      withdrawal_kyc:
        "Панелью можно пользоваться без проверки личности. KYC нужен только для вывода, и запрос проверяется на сервере. Загружайте документы на защищённой странице и никогда не отправляйте документы в этот чат.",
      support_procedures:
        "Поддержка — страница контактов или marketsbraxel@ouvidor.net. Укажите почту аккаунта, номер тарифа или заказа и короткое описание, и никогда не присылайте пароли, номера карт или ключи API.",
      company_overview:
        "Braxel Markets — бренд технологий и услуг для трейдинга, а не проп-фирма: он не хранит средства клиентов, не обрабатывает выплаты проп-фирм и не гарантирует доходность. Адрес в подвале сайта: Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain.",
    },
    topics: {
      getting_started: "с чего начать",
      account_creation: "создание аккаунта",
      plans: "тарифы и цены",
      checkout: "оплата",
      payment_status: "статус оплаты",
      activation: "активация аккаунта",
      dashboard_usage: "панель",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "Уточню: вы про {{a}} или про {{b}}?",
    clarifyOpen:
      "Хочу ответить на правильный вопрос. Речь о тарифах и ценах, оплате, активации аккаунта или панели?",
    greeting:
      "Здравствуйте! Я ассистент Braxel Markets. Могу объяснить тарифы, оплату, статус платежа, активацию, панель и Tradovate. Что вы хотите узнать?",
    thanks: "Пожалуйста! Могу помочь с чем-то ещё по Braxel?",
  },
  zh: {
    answers: {
      getting_started:
        "先创建账户、确认邮箱、选择套餐并完成付款。支付确认后，填写入门声明并申请激活你的自营交易账户。",
      account_creation:
        "在注册页面创建账户：姓名、邮箱、至少 6 个字符的密码，并接受条款和隐私政策。第二步填写电话、国家和地址。",
      email_confirmation:
        "注册后我们会发送确认邮件。打开邮件中的链接即可启用登录；如果没收到，请检查垃圾邮件，并在登录页面重新发送。",
      password_recovery:
        "请在登录页面点击“忘记密码？”。我们会发送重置链接，打开后即可设置新密码。链接会过期，并且只能使用一次。",
      plans:
        "我们有四个按月套餐，全部以美元计费：{{plans}} 结账页面显示的金额为准。",
      checkout:
        "结账只有一个页面：套餐摘要、账单信息和支付方式。接受条款和隐私政策后，可用银行卡（Stripe 页面）、银行转账或已配置的加密货币支付。",
      payment_methods:
        "银行卡会打开 Stripe 的安全页面，我们的应用不会看到卡号。银行转账会显示银行信息和参考号，并由人工核对。加密货币只支持服务器已配置的网络，所有费用均以美元结算。",
      payment_status:
        "支付状态显示在仪表盘和结账成功页面。只有服务器验证的确认才会把支付标记为已确认；银行卡通常通过 webhook 确认，银行转账由人工核对。如果看起来不对，请不要重复付款，请联系支持。",
      onboarding:
        "支付确认后，请填写入门声明并提交自营交易账户的绑定申请。运营人员会人工审核，仪表盘会显示状态。",
      activation:
        "你先通过我们的推广链接直接在自营交易公司（Tradeify 或 Lucid）购买账户，然后在仪表盘申请激活，填写公司、套餐、账户登录名/ID、购买邮箱和收据。运营人员会人工审核——切勿输入券商密码。",
      dashboard_usage:
        "仪表盘显示你的服务、支付卡片、账户激活、个人资料、业绩和审计日志。业绩只根据你自己已平仓的交易计算，无需 Tradovate 或 KYC 也能打开仪表盘。",
      tradovate_connection:
        "Tradovate 是可选的只读集成，不会连接你的自营交易账户：信号由你自己执行。Braxel 不能下单、修改或平仓，不能取款或转账，也绝不会索取你的 Tradovate 凭据。",
      withdrawal_kyc:
        "无需身份验证即可使用仪表盘。只有申请提现时才需要 KYC，且请求会在服务器端校验。请通过已登录的页面上传文件，切勿在此聊天中发送身份证件。",
      support_procedures:
        "人工支持请使用联系页面或 marketsbraxel@ouvidor.net。请提供账户邮箱、套餐或订单编号和简短说明，切勿包含密码、卡号或 API 密钥。",
      company_overview:
        "Braxel Markets 是交易技术与服务品牌，不是自营交易公司：它不保管客户资金、不处理自营交易公司的出金，也不保证收益。页脚地址为 Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain。",
    },
    topics: {
      getting_started: "如何开始",
      account_creation: "创建账户",
      plans: "套餐和价格",
      checkout: "结账付款",
      payment_status: "支付状态",
      activation: "账户激活",
      dashboard_usage: "仪表盘",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "确认一下：你是指{{a}}还是{{b}}？",
    clarifyOpen: "我想回答正确的问题。你是想了解套餐和价格、付款、账户激活，还是仪表盘？",
    greeting:
      "你好！我是 Braxel Markets 助手。我可以说明套餐、结账、支付状态、账户激活、仪表盘和 Tradovate。你想了解什么？",
    thanks: "不客气！关于 Braxel 还有其他问题吗？",
  },
  ja: {
    answers: {
      getting_started:
        "アカウント作成、メール確認、プラン選択、チェックアウトでの支払いから始めます。支払い確認後、オンボーディングの開示に同意し、プロップファーム口座の有効化を申請します。",
      account_creation:
        "登録ページでアカウントを作成します。氏名、メール、6文字以上のパスワード、利用規約とプライバシーポリシーへの同意が必要です。ステップ2で電話番号、国、住所を入力します。",
      email_confirmation:
        "登録後に確認メールを送ります。メール内のリンクを開くとログインが有効になります。届かない場合は迷惑メールを確認し、ログインページから再送してください。",
      password_recovery:
        "ログインページの「パスワードをお忘れですか？」を使ってください。再設定用のリンクをメールで送り、新しいパスワードを設定できます。リンクは有効期限があり、1回だけ使えます。",
      plans:
        "月額プランは4つで、すべてUSDでの請求です：{{plans}} 実際の金額はチェックアウトに表示される金額が正式です。",
      checkout:
        "チェックアウトは1ページです。プラン概要、請求情報、支払い方法を入力します。規約とプライバシーに同意し、カード（Stripeのページ）、銀行振込、設定済みの場合は暗号資産で支払います。",
      payment_methods:
        "カードはStripeの安全なページで処理され、当アプリはカード番号を保持しません。銀行振込は振込先と参照番号を表示し、手動で確認します。暗号資産はサーバーで設定されたネットワークのみ利用でき、すべてUSDでの請求です。",
      payment_status:
        "支払い状況はダッシュボードとチェックアウト完了ページに表示されます。サーバーで確認された場合のみ「確認済み」になります。カードは通常Webhookで確認され、銀行振込は手動で確認します。おかしいと感じたら二重に支払わず、サポートに連絡してください。",
      onboarding:
        "支払い確認後、オンボーディングの開示を完了し、プロップファーム口座の連携申請を送信します。担当者が手動で確認し、ダッシュボードに状況が表示されます。",
      activation:
        "口座はプロップファーム（TradeifyまたはLucid）から提携リンクで直接購入し、ダッシュボードで会社名、プラン、口座ログイン/ID、購入メール、領収書を添えて有効化を申請します。担当者が手動で確認します。ブローカーのパスワードは絶対に入力しないでください。",
      dashboard_usage:
        "ダッシュボードにはサービス、支払いカード、口座の有効化、プロフィール、パフォーマンス、監査ログがあります。パフォーマンスはご自身の決済済み取引のみから計算され、TradovateやKYCなしでも開けます。",
      tradovate_connection:
        "Tradovateは任意の読み取り専用連携で、プロップファーム口座には接続しません。シグナルはご自身で執行します。Braxelは注文の発注・変更・決済、出金・送金ができず、Tradovateの認証情報を求めることもありません。",
      withdrawal_kyc:
        "本人確認なしでダッシュボードを使えます。KYCは出金を申請するときだけ必要で、申請はサーバー側で確認されます。書類は認証済みページからアップロードし、このチャットで身分証明書を送らないでください。",
      support_procedures:
        "有人サポートはお問い合わせページまたは marketsbraxel@ouvidor.net です。アカウントのメール、プランまたは注文番号、簡単な説明を添えてください。パスワード、カード番号、APIキーは記載しないでください。",
      company_overview:
        "Braxel Markets はトレーディング技術とサービスのブランドで、プロップファームではありません。顧客資金を保管せず、プロップファームの出金処理も行わず、利益を保証しません。フッターの住所は Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain です。",
    },
    topics: {
      getting_started: "始め方",
      account_creation: "アカウント作成",
      plans: "プランと料金",
      checkout: "チェックアウトの支払い",
      payment_status: "支払い状況",
      activation: "口座の有効化",
      dashboard_usage: "ダッシュボード",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "確認させてください：{{a}}と{{b}}のどちらですか？",
    clarifyOpen:
      "正しい質問に答えたいので確認します。プランと料金、支払い、口座の有効化、ダッシュボードのどれについてですか？",
    greeting:
      "こんにちは。Braxel Markets のアシスタントです。プラン、チェックアウト、支払い状況、有効化、ダッシュボード、Tradovateについて説明できます。何を知りたいですか？",
    thanks: "どういたしまして。Braxel について他にご質問はありますか？",
  },
  ar: {
    answers: {
      getting_started:
        "ابدأ بإنشاء الحساب وتأكيد البريد واختيار خطة والدفع. بعد تأكيد الدفع أكمل إقرارات التهيئة ثم اطلب تفعيل حساب شركة التداول الخاص بك.",
      account_creation:
        "أنشئ الحساب من صفحة التسجيل: الاسم والبريد وكلمة مرور من 6 أحرف على الأقل والموافقة على الشروط وسياسة الخصوصية. الخطوة الثانية تطلب الهاتف والدولة والعنوان.",
      email_confirmation:
        "بعد التسجيل نرسل بريد تأكيد. افتح الرابط في البريد لتفعيل تسجيل الدخول؛ إذا لم يصل، تحقق من مجلد الرسائل غير المرغوبة وأعد إرساله من صفحة تسجيل الدخول.",
      password_recovery:
        "استخدم «هل نسيت كلمة المرور؟» في صفحة تسجيل الدخول. نرسل رابط استرداد يفتح صفحة تعيين كلمة مرور جديدة. الرابط ينتهي ويُستخدم مرة واحدة فقط.",
      plans:
        "لدينا أربع خطط شهرية، وكلها بالدولار الأمريكي: {{plans}} المبلغ الظاهر في الدفع هو المبلغ الرسمي.",
      checkout:
        "الدفع في صفحة واحدة: ملخص الخطة وبيانات الفاتورة وطريقة الدفع. وافق على الشروط والخصوصية ثم ادفع بالبطاقة (صفحة Stripe) أو بالتحويل البنكي أو بالعملات الرقمية عند تفعيلها.",
      payment_methods:
        "البطاقة تفتح صفحة Stripe الآمنة ولا يرى تطبيقنا رقم البطاقة. التحويل البنكي يعرض بيانات البنك ومرجعًا ويُراجع يدويًا. العملات الرقمية تعمل فقط على الشبكات المهيأة على الخادم، وكل المبالغ بالدولار.",
      payment_status:
        "حالة الدفع تظهر في لوحة التحكم وفي صفحة نجاح الدفع. لا تُعدّ الدفعة مؤكدة إلا بتأكيد متحقق على الخادم؛ البطاقة تُؤكد عادة عبر webhook والتحويل يُراجع يدويًا. إذا بدا شيء خطأ فلا تدفع مرتين وتواصل مع الدعم.",
      onboarding:
        "بعد تأكيد الدفع أكمل إقرارات التهيئة وأرسل طلب ربط حساب شركة التداول. يراجع موظف الطلب يدويًا وتظهر الحالة في لوحة التحكم.",
      activation:
        "تشتري الحساب مباشرة من شركة التداول (Tradeify أو Lucid) عبر رابط الإحالة، ثم تطلب التفعيل في لوحة التحكم مع الشركة والخطة ومعرّف الحساب وبريد الشراء والإيصال. يراجع موظف الطلب يدويًا — لا تُدخل كلمة مرور الوسيط أبدًا.",
      dashboard_usage:
        "تعرض لوحة التحكم خدماتك وبطاقة الدفع وتفعيل الحساب وملفك والأداء وسجل التدقيق. الأداء يُحسب فقط من صفقاتك المغلقة، ويمكنك فتح اللوحة دون Tradovate ودون التحقق من الهوية.",
      tradovate_connection:
        "Tradovate تكامل اختياري للقراءة فقط ولا يتصل بحساب شركة التداول: أنت تنفّذ الإشارات بنفسك. لا تستطيع Braxel وضع أو تعديل أو إغلاق الأوامر ولا سحب أو تحويل الأموال ولا تطلب بيانات Tradovate الخاصة بك.",
      withdrawal_kyc:
        "يمكنك استخدام اللوحة دون التحقق من الهوية. التحقق (KYC) مطلوب فقط عند طلب السحب، ويُفحص الطلب على الخادم. ارفع المستندات من الصفحة المحمية ولا ترسل مستندات الهوية في هذه المحادثة.",
      support_procedures:
        "الدعم البشري عبر صفحة الاتصال أو marketsbraxel@ouvidor.net. اذكر بريد الحساب ومرجع الخطة أو الطلب ووصفًا قصيرًا، ولا تُدرج كلمات المرور أو أرقام البطاقات أو مفاتيح API.",
      company_overview:
        "Braxel Markets علامة لتقنية وخدمات التداول وليست شركة تداول: لا تحتفظ بأموال العملاء ولا تعالج مدفوعات شركات التداول ولا تضمن أي عوائد. العنوان في التذييل هو Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain.",
    },
    topics: {
      getting_started: "كيف تبدأ",
      account_creation: "إنشاء حساب",
      plans: "الخطط والأسعار",
      checkout: "الدفع",
      payment_status: "حالة الدفع",
      activation: "تفعيل الحساب",
      dashboard_usage: "لوحة التحكم",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "للتوضيح: هل تقصد {{a}} أم {{b}}؟",
    clarifyOpen:
      "أريد الإجابة عن السؤال الصحيح. هل سؤالك عن الخطط والأسعار أم الدفع أم تفعيل الحساب أم لوحة التحكم؟",
    greeting:
      "مرحبًا! أنا مساعد Braxel Markets. يمكنني شرح الخطط والدفع وحالة الدفع والتفعيل ولوحة التحكم وTradovate. ما الذي تريد معرفته؟",
    thanks: "على الرحب والسعة! هل أساعدك في شيء آخر عن Braxel؟",
  },
  he: {
    answers: {
      getting_started:
        "התחל ביצירת חשבון, אימות הדוא״ל, בחירת תוכנית ותשלום בקופה. לאחר אישור התשלום מלא את הצהרות הקליטה ובקש הפעלה של חשבון חברת הנכסים שלך.",
      account_creation:
        "צור חשבון בעמוד ההרשמה: שם, דוא״ל, סיסמה של 6 תווים לפחות ואישור התנאים ומדיניות הפרטיות. בשלב 2 ממלאים טלפון, מדינה וכתובת.",
      email_confirmation:
        "לאחר ההרשמה נשלח דוא״ל אימות. פתח את הקישור שבו כדי להפעיל את הכניסה; אם הוא לא הגיע, בדוק את תיקיית הספאם ושלח אותו שוב מעמוד הכניסה.",
      password_recovery:
        "השתמש בקישור ״שכחת סיסמה?״ בעמוד הכניסה. נשלח קישור לאיפוס שפותח את העמוד לקביעת סיסמה חדשה. הקישור פג תוקף וניתן להשתמש בו פעם אחת בלבד.",
      plans:
        "יש ארבע תוכניות חודשיות, כולן בדולר אמריקאי: {{plans}} הסכום המוצג בקופה הוא הסכום הרשמי.",
      checkout:
        "התשלום בעמוד אחד: סיכום התוכנית, פרטי החיוב ואמצעי התשלום. אשר את התנאים והפרטיות ושלם בכרטיס (עמוד Stripe), בהעברה בנקאית או בקריפטו כשזה מוגדר.",
      payment_methods:
        "כרטיס פותח את העמוד המאובטח של Stripe והאפליקציה שלנו לא רואה את מספר הכרטיס. העברה בנקאית מציגה את פרטי הבנק ומספר אסמכתא ונבדקת ידנית. קריפטו פועל רק ברשתות שהוגדרו בשרת, והכל מחויב בדולר.",
      payment_status:
        "סטטוס התשלום מוצג בלוח הבקרה ובעמוד ההצלחה. רק אישור שנבדק בשרת מסמן את התשלום כמאושר; כרטיס מאושר בדרך כלל דרך webhook והעברה נבדקת ידנית. אם משהו נראה שגוי, אל תשלם פעמיים ופנה לתמיכה.",
      onboarding:
        "לאחר תשלום מאושר מלא את הצהרות הקליטה ושלח בקשת קישור לחשבון חברת הנכסים שלך. איש צוות בודק אותה ידנית והלוח מציג את הסטטוס.",
      activation:
        "אתה קונה את החשבון ישירות מחברת הנכסים (Tradeify או Lucid) דרך קישור השותפים, ואז מבקש הפעלה בלוח הבקרה עם החברה, התוכנית, מזהה החשבון, דוא״ל הרכישה והקבלה. איש צוות בודק ידנית — לעולם אל תזין את סיסמת הברוקר.",
      dashboard_usage:
        "לוח הבקרה מציג את השירותים, כרטיס התשלום, הפעלת החשבון, הפרופיל, הביצועים ויומן הביקורת. הביצועים מחושבים רק מהעסקאות הסגורות שלך, ואפשר לפתוח את הלוח בלי Tradovate ובלי KYC.",
      tradovate_connection:
        "Tradovate היא אינטגרציה אופציונלית לקריאה בלבד והיא אינה מתחברת לחשבון חברת הנכסים שלך: אתה מבצע את האיתותים בעצמך. Braxel לא יכולה לפתוח, לשנות או לסגור פקודות, לא למשוך או להעביר כסף, ולעולם לא מבקשת את פרטי Tradovate שלך.",
      withdrawal_kyc:
        "אפשר להשתמש בלוח בלי אימות זהות. KYC נדרש רק בעת בקשת משיכה, והבקשה נבדקת בשרת. העלה מסמכים דרך העמוד המאומת ואל תשלח מסמכי זהות בצ׳אט הזה.",
      support_procedures:
        "תמיכה אנושית היא עמוד יצירת הקשר או marketsbraxel@ouvidor.net. ציין את דוא״ל החשבון, מספר התוכנית או ההזמנה ותיאור קצר, ואל תכלול סיסמאות, מספרי כרטיס או מפתחות API.",
      company_overview:
        "Braxel Markets הוא מותג של טכנולוגיה ושירותי מסחר, לא חברת נכסים: היא לא מחזיקה כספי לקוחות, לא מעבדת תשלומים של חברות נכסים ולא מבטיחה תשואות. הכתובת בתחתית האתר היא Calle de la Haya, 28935, Parque Coimbra, Madrid, Spain.",
    },
    topics: {
      getting_started: "איך מתחילים",
      account_creation: "יצירת חשבון",
      plans: "תוכניות ומחירים",
      checkout: "התשלום בקופה",
      payment_status: "סטטוס התשלום",
      activation: "הפעלת החשבון",
      dashboard_usage: "לוח הבקרה",
      tradovate_connection: "Tradovate",
    },
    clarifyPair: "רק כדי לוודא: התכוונת ל{{a}} או ל{{b}}?",
    clarifyOpen:
      "אני רוצה לענות על השאלה הנכונה. השאלה שלך על תוכניות ומחירים, תשלום, הפעלת חשבון או לוח הבקרה?",
    greeting:
      "שלום! אני העוזר של Braxel Markets. אני יכול להסביר תוכניות, תשלום, סטטוס תשלום, הפעלה, לוח בקרה ו-Tradovate. מה תרצה לדעת?",
    thanks: "בשמחה! אפשר לעזור במשהו נוסף בנושא Braxel?",
  },
};
