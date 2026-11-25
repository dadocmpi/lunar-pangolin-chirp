// ============================================================================
// Deterministic multilingual chatbot messages.
//
// Every message the assistant can produce WITHOUT a model (provider error,
// timeout, rate limit, disabled feature, unknown question, refusal, human
// handoff) is written here in all 11 supported locales. The reply language is
// the language detected from the customer's latest message, so these strings
// are the guarantee that a Portuguese, Spanish or Japanese customer never gets
// an English fallback.
//
// Pure data + pure lookup. No I/O, no model, no user data.
// ============================================================================

import type { SupportedLocale } from "./language.ts";
import type { EscalationCategory } from "./types.ts";

export type ChatMessageKey =
  | "unknown"
  | "timeout"
  | "providerError"
  | "rateLimited"
  | "disabled"
  | "invalidMessage"
  | "knowledgeFallback"
  | "secret"
  | "advice"
  | "injection"
  | "promise";

interface LocaleMessages {
  unknown: string;
  timeout: string;
  providerError: string;
  rateLimited: string;
  disabled: string;
  invalidMessage: string;
  knowledgeFallback: string;
  secret: string;
  advice: string;
  injection: string;
  promise: string;
  escalation: Record<EscalationCategory, string>;
}

export const CHAT_MESSAGES: Record<SupportedLocale, LocaleMessages> = {
  en: {
    unknown:
      "I don't have a verified answer to that in the approved Braxel content, so I won't guess. Please contact human support.",
    timeout:
      "The assistant took too long to respond. Please try again, or contact human support.",
    providerError:
      "The assistant is unavailable right now. Please try again later, or contact human support.",
    rateLimited:
      "Too many messages. Please wait a moment and try again, or contact human support.",
    disabled:
      "The support assistant is currently unavailable. Please contact human support by email.",
    invalidMessage:
      "Your message is empty or too long. Please shorten it and try again.",
    knowledgeFallback:
      "I found an official Braxel page about this topic. Open the link below for the approved details. If you need more help, contact human support.",
    secret:
      "For your security I never ask for and cannot accept passwords, card numbers, Tradovate credentials, API keys, MFA codes or private keys. Please do not share them here. To reset your password, use the Forgot password link on the Login page. For account or payment issues, contact human support.",
    advice:
      "I can't give financial, investment, trading, tax or legal advice. I can explain how Braxel works, the plans and the official procedures, but not what you should buy, sell or invest in. Trading involves a substantial risk of loss. Please read the Financial Disclaimer.",
    injection:
      "I can't follow instructions that try to change my rules or reveal my configuration. I can still help with Braxel account, payment, onboarding and support questions.",
    promise:
      "I can't promise profits, payouts, account approval, safety or returns. Trading involves a substantial risk of loss. I can explain the official Braxel procedures instead.",
    escalation: {
      payment_dispute:
        "Payment disputes must be handled by a person. Please contact human support by email and do not pay twice.",
      kyc:
        "Identity verification (KYC) is handled by a person. Please contact human support by email; never send identity documents through this chat.",
      account_suspension:
        "Account suspension and access issues must be handled by a person. Please contact human support by email.",
      legal:
        "Legal questions and data-rights requests must go to a person. Please contact human support by email.",
      provider_problem:
        "Provider and connection problems must be checked by a person. Please contact human support by email.",
      refund:
        "Refund requests must be handled by a person. Please contact human support by email with your order reference.",
      human_request:
        "A human support agent can help with this. Please contact Braxel support by email.",
    },
  },
  pt: {
    unknown:
      "Não tenho uma resposta verificada sobre isso no conteúdo aprovado da Braxel, por isso não vou adivinhar. Contacte o suporte humano.",
    timeout:
      "O assistente demorou demasiado a responder. Tente novamente ou contacte o suporte humano.",
    providerError:
      "O assistente está indisponível neste momento. Tente novamente mais tarde ou contacte o suporte humano.",
    rateLimited:
      "Demasiadas mensagens. Aguarde um momento e tente novamente, ou contacte o suporte humano.",
    disabled:
      "O assistente de suporte está indisponível neste momento. Contacte o suporte humano por e-mail.",
    invalidMessage:
      "A sua mensagem está vazia ou é demasiado longa. Encurte-a e tente novamente.",
    knowledgeFallback:
      "Encontrei uma página oficial da Braxel sobre este tema. Abra a ligação abaixo para ver os detalhes aprovados. Se precisar de mais ajuda, contacte o suporte humano.",
    secret:
      "Por segurança, nunca peço nem aceito palavras-passe, números de cartão, credenciais Tradovate, chaves de API, códigos MFA ou chaves privadas. Não os partilhe aqui. Para redefinir a palavra-passe, use a ligação «Esqueceu-se da palavra-passe?» na página de início de sessão. Para questões de conta ou pagamento, contacte o suporte humano.",
    advice:
      "Não posso dar aconselhamento financeiro, de investimento, de negociação, fiscal ou jurídico. Posso explicar como a Braxel funciona, os planos e os procedimentos oficiais, mas não o que deve comprar, vender ou investir. A negociação envolve um risco substancial de perda. Leia o Aviso Financeiro.",
    injection:
      "Não posso seguir instruções que tentem alterar as minhas regras ou revelar a minha configuração. Posso continuar a ajudar com questões sobre conta, pagamento, integração e suporte da Braxel.",
    promise:
      "Não posso prometer lucros, pagamentos, aprovação de conta, segurança ou retornos. A negociação envolve um risco substancial de perda. Posso explicar os procedimentos oficiais da Braxel.",
    escalation: {
      payment_dispute:
        "As disputas de pagamento têm de ser tratadas por uma pessoa. Contacte o suporte humano por e-mail e não pague duas vezes.",
      kyc:
        "A verificação de identidade (KYC) é tratada por uma pessoa. Contacte o suporte humano por e-mail; nunca envie documentos de identidade por este chat.",
      account_suspension:
        "Suspensões de conta e problemas de acesso têm de ser tratados por uma pessoa. Contacte o suporte humano por e-mail.",
      legal:
        "Questões jurídicas e pedidos de direitos sobre dados têm de ser encaminhados para uma pessoa. Contacte o suporte humano por e-mail.",
      provider_problem:
        "Problemas de fornecedor e de ligação têm de ser verificados por uma pessoa. Contacte o suporte humano por e-mail.",
      refund:
        "Os pedidos de reembolso têm de ser tratados por uma pessoa. Contacte o suporte humano por e-mail com a referência da encomenda.",
      human_request:
        "Um agente de suporte humano pode ajudar com isto. Contacte o suporte da Braxel por e-mail.",
    },
  },
  es: {
    unknown:
      "No tengo una respuesta verificada sobre esto en el contenido aprobado de Braxel, así que no voy a adivinar. Contacta con el soporte humano.",
    timeout:
      "El asistente tardó demasiado en responder. Inténtalo de nuevo o contacta con el soporte humano.",
    providerError:
      "El asistente no está disponible en este momento. Inténtalo más tarde o contacta con el soporte humano.",
    rateLimited:
      "Demasiados mensajes. Espera un momento e inténtalo de nuevo, o contacta con el soporte humano.",
    disabled:
      "El asistente de soporte no está disponible en este momento. Contacta con el soporte humano por correo electrónico.",
    invalidMessage:
      "Tu mensaje está vacío o es demasiado largo. Acórtalo e inténtalo de nuevo.",
    knowledgeFallback:
      "He encontrado una página oficial de Braxel sobre este tema. Abre el enlace de abajo para ver los detalles aprobados. Si necesitas más ayuda, contacta con el soporte humano.",
    secret:
      "Por tu seguridad, nunca pido ni acepto contraseñas, números de tarjeta, credenciales de Tradovate, claves de API, códigos MFA ni claves privadas. No los compartas aquí. Para restablecer la contraseña, usa el enlace «¿Olvidaste tu contraseña?» en la página de inicio de sesión. Para asuntos de cuenta o pago, contacta con el soporte humano.",
    advice:
      "No puedo dar asesoramiento financiero, de inversión, de trading, fiscal ni jurídico. Puedo explicar cómo funciona Braxel, los planes y los procedimientos oficiales, pero no qué comprar, vender o invertir. El trading conlleva un riesgo sustancial de pérdida. Lee el Aviso Financiero.",
    injection:
      "No puedo seguir instrucciones que intenten cambiar mis reglas o revelar mi configuración. Puedo seguir ayudando con asuntos de cuenta, pago, incorporación y soporte de Braxel.",
    promise:
      "No puedo prometer beneficios, pagos, aprobación de cuenta, seguridad ni rentabilidades. El trading conlleva un riesgo sustancial de pérdida. Puedo explicar los procedimientos oficiales de Braxel.",
    escalation: {
      payment_dispute:
        "Las disputas de pago debe gestionarlas una persona. Contacta con el soporte humano por correo electrónico y no pagues dos veces.",
      kyc:
        "La verificación de identidad (KYC) la gestiona una persona. Contacta con el soporte humano por correo electrónico; nunca envíes documentos de identidad por este chat.",
      account_suspension:
        "Las suspensiones de cuenta y los problemas de acceso debe gestionarlos una persona. Contacta con el soporte humano por correo electrónico.",
      legal:
        "Las cuestiones legales y las solicitudes de derechos de datos deben ir a una persona. Contacta con el soporte humano por correo electrónico.",
      provider_problem:
        "Los problemas del proveedor y de conexión debe revisarlos una persona. Contacta con el soporte humano por correo electrónico.",
      refund:
        "Las solicitudes de reembolso debe gestionarlas una persona. Contacta con el soporte humano por correo electrónico con la referencia de tu pedido.",
      human_request:
        "Un agente de soporte humano puede ayudarte con esto. Contacta con el soporte de Braxel por correo electrónico.",
    },
  },
  it: {
    unknown:
      "Non ho una risposta verificata su questo nel contenuto approvato di Braxel, quindi non tirerò a indovinare. Contatta il supporto umano.",
    timeout:
      "L'assistente ha impiegato troppo tempo a rispondere. Riprova o contatta il supporto umano.",
    providerError:
      "L'assistente non è disponibile in questo momento. Riprova più tardi o contatta il supporto umano.",
    rateLimited:
      "Troppi messaggi. Attendi un momento e riprova, oppure contatta il supporto umano.",
    disabled:
      "L'assistente di supporto non è disponibile in questo momento. Contatta il supporto umano via e-mail.",
    invalidMessage:
      "Il tuo messaggio è vuoto o troppo lungo. Accorcialo e riprova.",
    knowledgeFallback:
      "Ho trovato una pagina ufficiale di Braxel su questo argomento. Apri il link qui sotto per i dettagli approvati. Se ti serve altro aiuto, contatta il supporto umano.",
    secret:
      "Per la tua sicurezza non chiedo mai e non accetto password, numeri di carta, credenziali Tradovate, chiavi API, codici MFA o chiavi private. Non condividerli qui. Per reimpostare la password, usa il link «Password dimenticata?» nella pagina di accesso. Per problemi di account o pagamento, contatta il supporto umano.",
    advice:
      "Non posso fornire consulenza finanziaria, di investimento, di trading, fiscale o legale. Posso spiegare come funziona Braxel, i piani e le procedure ufficiali, ma non cosa comprare, vendere o in cui investire. Il trading comporta un rischio sostanziale di perdita. Leggi l'Avviso Finanziario.",
    injection:
      "Non posso seguire istruzioni che tentano di cambiare le mie regole o rivelare la mia configurazione. Posso continuare ad aiutarti con account, pagamenti, onboarding e supporto Braxel.",
    promise:
      "Non posso promettere profitti, pagamenti, approvazione dell'account, sicurezza o rendimenti. Il trading comporta un rischio sostanziale di perdita. Posso spiegare le procedure ufficiali di Braxel.",
    escalation: {
      payment_dispute:
        "Le contestazioni di pagamento devono essere gestite da una persona. Contatta il supporto umano via e-mail e non pagare due volte.",
      kyc:
        "La verifica dell'identità (KYC) è gestita da una persona. Contatta il supporto umano via e-mail; non inviare mai documenti d'identità tramite questa chat.",
      account_suspension:
        "Le sospensioni dell'account e i problemi di accesso devono essere gestiti da una persona. Contatta il supporto umano via e-mail.",
      legal:
        "Le questioni legali e le richieste sui diritti dei dati devono essere gestite da una persona. Contatta il supporto umano via e-mail.",
      provider_problem:
        "I problemi del fornitore e di connessione devono essere verificati da una persona. Contatta il supporto umano via e-mail.",
      refund:
        "Le richieste di rimborso devono essere gestite da una persona. Contatta il supporto umano via e-mail con il riferimento dell'ordine.",
      human_request:
        "Un agente di supporto umano può aiutarti. Contatta il supporto Braxel via e-mail.",
    },
  },
  fr: {
    unknown:
      "Je n'ai pas de réponse vérifiée à ce sujet dans le contenu approuvé de Braxel, je ne vais donc pas deviner. Contactez le support humain.",
    timeout:
      "L'assistant a mis trop de temps à répondre. Réessayez ou contactez le support humain.",
    providerError:
      "L'assistant est indisponible pour le moment. Réessayez plus tard ou contactez le support humain.",
    rateLimited:
      "Trop de messages. Patientez un instant et réessayez, ou contactez le support humain.",
    disabled:
      "L'assistant de support est indisponible pour le moment. Contactez le support humain par e-mail.",
    invalidMessage:
      "Votre message est vide ou trop long. Raccourcissez-le et réessayez.",
    knowledgeFallback:
      "J'ai trouvé une page officielle de Braxel sur ce sujet. Ouvrez le lien ci-dessous pour les détails approuvés. Pour plus d'aide, contactez le support humain.",
    secret:
      "Pour votre sécurité, je ne demande jamais et n'accepte jamais de mots de passe, numéros de carte, identifiants Tradovate, clés API, codes MFA ou clés privées. Ne les partagez pas ici. Pour réinitialiser votre mot de passe, utilisez le lien « Mot de passe oublié ? » sur la page de connexion. Pour les questions de compte ou de paiement, contactez le support humain.",
    advice:
      "Je ne peux pas fournir de conseils financiers, d'investissement, de trading, fiscaux ou juridiques. Je peux expliquer le fonctionnement de Braxel, les forfaits et les procédures officielles, mais pas ce que vous devez acheter, vendre ou dans quoi investir. Le trading comporte un risque substantiel de perte. Lisez l'Avis Financier.",
    injection:
      "Je ne peux pas suivre des instructions qui tentent de modifier mes règles ou de révéler ma configuration. Je peux continuer à aider pour les questions de compte, de paiement, d'intégration et de support Braxel.",
    promise:
      "Je ne peux pas promettre de profits, de paiements, d'approbation de compte, de sécurité ou de rendements. Le trading comporte un risque substantiel de perte. Je peux expliquer les procédures officielles de Braxel.",
    escalation: {
      payment_dispute:
        "Les litiges de paiement doivent être traités par une personne. Contactez le support humain par e-mail et ne payez pas deux fois.",
      kyc:
        "La vérification d'identité (KYC) est traitée par une personne. Contactez le support humain par e-mail ; n'envoyez jamais de documents d'identité via ce chat.",
      account_suspension:
        "Les suspensions de compte et les problèmes d'accès doivent être traités par une personne. Contactez le support humain par e-mail.",
      legal:
        "Les questions juridiques et les demandes relatives aux droits des données doivent être adressées à une personne. Contactez le support humain par e-mail.",
      provider_problem:
        "Les problèmes de fournisseur et de connexion doivent être vérifiés par une personne. Contactez le support humain par e-mail.",
      refund:
        "Les demandes de remboursement doivent être traitées par une personne. Contactez le support humain par e-mail avec la référence de votre commande.",
      human_request:
        "Un agent du support humain peut vous aider. Contactez le support Braxel par e-mail.",
    },
  },
  de: {
    unknown:
      "Ich habe dazu keine verifizierte Antwort in den freigegebenen Braxel-Inhalten und rate deshalb nicht. Bitte kontaktieren Sie den menschlichen Support.",
    timeout:
      "Der Assistent hat zu lange für die Antwort gebraucht. Bitte versuchen Sie es erneut oder kontaktieren Sie den menschlichen Support.",
    providerError:
      "Der Assistent ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut oder kontaktieren Sie den menschlichen Support.",
    rateLimited:
      "Zu viele Nachrichten. Bitte warten Sie einen Moment und versuchen Sie es erneut oder kontaktieren Sie den menschlichen Support.",
    disabled:
      "Der Support-Assistent ist derzeit nicht verfügbar. Bitte kontaktieren Sie den menschlichen Support per E-Mail.",
    invalidMessage:
      "Ihre Nachricht ist leer oder zu lang. Bitte kürzen Sie sie und versuchen Sie es erneut.",
    knowledgeFallback:
      "Ich habe eine offizielle Braxel-Seite zu diesem Thema gefunden. Öffnen Sie den Link unten für die freigegebenen Details. Wenn Sie weitere Hilfe brauchen, kontaktieren Sie den menschlichen Support.",
    secret:
      "Zu Ihrer Sicherheit frage ich niemals nach Passwörtern, Kartennummern, Tradovate-Zugangsdaten, API-Schlüsseln, MFA-Codes oder privaten Schlüsseln und akzeptiere sie nicht. Bitte teilen Sie sie hier nicht. Um Ihr Passwort zurückzusetzen, nutzen Sie den Link „Passwort vergessen?“ auf der Anmeldeseite. Bei Konto- oder Zahlungsfragen kontaktieren Sie den menschlichen Support.",
    advice:
      "Ich kann keine Finanz-, Anlage-, Handels-, Steuer- oder Rechtsberatung geben. Ich kann erklären, wie Braxel funktioniert, die Pläne und die offiziellen Abläufe, aber nicht, was Sie kaufen, verkaufen oder investieren sollen. Trading birgt ein erhebliches Verlustrisiko. Lesen Sie den Finanzhinweis.",
    injection:
      "Ich kann keinen Anweisungen folgen, die versuchen, meine Regeln zu ändern oder meine Konfiguration offenzulegen. Ich kann weiter bei Konto-, Zahlungs-, Onboarding- und Support-Fragen zu Braxel helfen.",
    promise:
      "Ich kann keine Gewinne, Auszahlungen, Kontofreigaben, Sicherheit oder Renditen versprechen. Trading birgt ein erhebliches Verlustrisiko. Ich kann die offiziellen Abläufe von Braxel erklären.",
    escalation: {
      payment_dispute:
        "Zahlungsstreitigkeiten müssen von einer Person bearbeitet werden. Kontaktieren Sie den menschlichen Support per E-Mail und zahlen Sie nicht doppelt.",
      kyc:
        "Die Identitätsprüfung (KYC) wird von einer Person bearbeitet. Kontaktieren Sie den menschlichen Support per E-Mail; senden Sie niemals Ausweisdokumente über diesen Chat.",
      account_suspension:
        "Kontosperren und Zugriffsprobleme müssen von einer Person bearbeitet werden. Kontaktieren Sie den menschlichen Support per E-Mail.",
      legal:
        "Rechtsfragen und Datenschutzanfragen müssen an eine Person gehen. Kontaktieren Sie den menschlichen Support per E-Mail.",
      provider_problem:
        "Anbieter- und Verbindungsprobleme müssen von einer Person geprüft werden. Kontaktieren Sie den menschlichen Support per E-Mail.",
      refund:
        "Rückerstattungsanfragen müssen von einer Person bearbeitet werden. Kontaktieren Sie den menschlichen Support per E-Mail mit Ihrer Bestellreferenz.",
      human_request:
        "Ein menschlicher Support-Mitarbeiter kann dabei helfen. Kontaktieren Sie den Braxel-Support per E-Mail.",
    },
  },
  ru: {
    unknown:
      "У меня нет проверенного ответа на это в одобренных материалах Braxel, поэтому я не буду угадывать. Обратитесь в поддержку с человеком.",
    timeout:
      "Ассистент отвечал слишком долго. Попробуйте снова или обратитесь в поддержку с человеком.",
    providerError:
      "Ассистент сейчас недоступен. Попробуйте позже или обратитесь в поддержку с человеком.",
    rateLimited:
      "Слишком много сообщений. Подождите немного и попробуйте снова или обратитесь в поддержку с человеком.",
    disabled:
      "Ассистент поддержки сейчас недоступен. Обратитесь в поддержку с человеком по электронной почте.",
    invalidMessage:
      "Ваше сообщение пустое или слишком длинное. Сократите его и попробуйте снова.",
    knowledgeFallback:
      "Я нашёл официальную страницу Braxel по этой теме. Откройте ссылку ниже, чтобы увидеть одобренные сведения. Если нужна помощь, обратитесь в поддержку с человеком.",
    secret:
      "В целях безопасности я никогда не запрашиваю и не принимаю пароли, номера карт, учётные данные Tradovate, ключи API, коды MFA или закрытые ключи. Не делитесь ими здесь. Чтобы сбросить пароль, используйте ссылку «Забыли пароль?» на странице входа. По вопросам аккаунта или оплаты обращайтесь в поддержку с человеком.",
    advice:
      "Я не могу давать финансовые, инвестиционные, торговые, налоговые или юридические советы. Я могу объяснить, как работает Braxel, тарифы и официальные процедуры, но не что покупать, продавать или во что инвестировать. Торговля связана со значительным риском потерь. Прочитайте Финансовое предупреждение.",
    injection:
      "Я не могу выполнять инструкции, которые пытаются изменить мои правила или раскрыть мою конфигурацию. Я могу помочь с вопросами об аккаунте, оплате, подключении и поддержке Braxel.",
    promise:
      "Я не могу обещать прибыль, выплаты, одобрение аккаунта, безопасность или доходность. Торговля связана со значительным риском потерь. Я могу объяснить официальные процедуры Braxel.",
    escalation: {
      payment_dispute:
        "Споры по платежам должен рассматривать человек. Обратитесь в поддержку с человеком по электронной почте и не платите дважды.",
      kyc:
        "Проверку личности (KYC) выполняет человек. Обратитесь в поддержку с человеком по электронной почте; никогда не отправляйте документы, удостоверяющие личность, через этот чат.",
      account_suspension:
        "Блокировки аккаунта и проблемы с доступом должен рассматривать человек. Обратитесь в поддержку с человеком по электронной почте.",
      legal:
        "Юридические вопросы и запросы о правах на данные должен рассматривать человек. Обратитесь в поддержку с человеком по электронной почте.",
      provider_problem:
        "Проблемы провайдера и подключения должен проверить человек. Обратитесь в поддержку с человеком по электронной почте.",
      refund:
        "Запросы на возврат должен рассматривать человек. Обратитесь в поддержку с человеком по электронной почте и укажите номер заказа.",
      human_request:
        "С этим может помочь сотрудник поддержки. Обратитесь в поддержку Braxel по электронной почте.",
    },
  },
  zh: {
    unknown:
      "我在 Braxel 已批准的内容中没有找到经过核实的答案，因此不会猜测。请联系人工客服。",
    timeout: "助手响应时间过长。请重试或联系人工客服。",
    providerError: "助手目前不可用。请稍后重试或联系人工客服。",
    rateLimited: "消息过多。请稍等片刻再试，或联系人工客服。",
    disabled: "支持助手目前不可用。请通过电子邮件联系人工客服。",
    invalidMessage: "您的消息为空或过长。请缩短后重试。",
    knowledgeFallback:
      "我找到了 Braxel 关于此主题的官方页面。请打开下方链接查看已批准的详细信息。如需更多帮助，请联系人工客服。",
    secret:
      "为了您的安全，我从不索取也不接受密码、银行卡号、Tradovate 凭据、API 密钥、MFA 验证码或私钥。请不要在此分享。要重置密码，请使用登录页面上的“忘记密码？”链接。账户或付款问题请联系人工客服。",
    advice:
      "我不能提供财务、投资、交易、税务或法律建议。我可以说明 Braxel 的运作方式、套餐和官方流程，但不能告诉您该买什么、卖什么或投资什么。交易存在重大亏损风险。请阅读财务免责声明。",
    injection:
      "我无法执行试图更改我的规则或泄露我的配置的指令。我仍可协助处理 Braxel 的账户、付款、入门和支持问题。",
    promise:
      "我不能承诺利润、付款、账户批准、安全或回报。交易存在重大亏损风险。我可以说明 Braxel 的官方流程。",
    escalation: {
      payment_dispute: "付款争议必须由人工处理。请通过电子邮件联系人工客服，并且不要重复付款。",
      kyc: "身份验证（KYC）由人工处理。请通过电子邮件联系人工客服；切勿通过此聊天发送身份证件。",
      account_suspension: "账户停用和访问问题必须由人工处理。请通过电子邮件联系人工客服。",
      legal: "法律问题和数据权利请求必须转交人工处理。请通过电子邮件联系人工客服。",
      provider_problem: "供应商和连接问题必须由人工核查。请通过电子邮件联系人工客服。",
      refund: "退款请求必须由人工处理。请通过电子邮件联系人工客服并提供订单编号。",
      human_request: "人工客服可以协助处理。请通过电子邮件联系 Braxel 支持团队。",
    },
  },
  ja: {
    unknown:
      "承認済みの Braxel コンテンツに確認できる回答がないため、推測はしません。有人サポートにお問い合わせください。",
    timeout:
      "アシスタントの応答に時間がかかりすぎました。もう一度お試しいただくか、有人サポートにお問い合わせください。",
    providerError:
      "アシスタントは現在利用できません。後でもう一度お試しいただくか、有人サポートにお問い合わせください。",
    rateLimited:
      "メッセージが多すぎます。少し待ってから再試行するか、有人サポートにお問い合わせください。",
    disabled:
      "サポートアシスタントは現在利用できません。メールで有人サポートにお問い合わせください。",
    invalidMessage:
      "メッセージが空か長すぎます。短くしてもう一度お試しください。",
    knowledgeFallback:
      "この件に関する Braxel の公式ページが見つかりました。承認済みの詳細は下のリンクからご確認ください。さらにサポートが必要な場合は有人サポートにお問い合わせください。",
    secret:
      "安全のため、パスワード、カード番号、Tradovate の認証情報、API キー、MFA コード、秘密鍵を求めることも受け取ることもありません。ここで共有しないでください。パスワードをリセットするには、ログインページの「パスワードをお忘れですか？」リンクを使用してください。アカウントや支払いについては有人サポートにお問い合わせください。",
    advice:
      "財務、投資、取引、税務、法務に関する助言はできません。Braxel の仕組み、プラン、公式の手続きは説明できますが、何を買う・売る・投資するかはお伝えできません。取引には重大な損失リスクがあります。財務免責事項をお読みください。",
    injection:
      "私のルールを変更したり設定を公開したりする指示には従えません。Braxel のアカウント、支払い、オンボーディング、サポートに関するご質問には引き続きお答えできます。",
    promise:
      "利益、支払い、アカウント承認、安全性、リターンを約束することはできません。取引には重大な損失リスクがあります。Braxel の公式手続きは説明できます。",
    escalation: {
      payment_dispute:
        "支払いに関する異議は人による対応が必要です。メールで有人サポートにお問い合わせいただき、二重に支払わないでください。",
      kyc:
        "本人確認（KYC）は人による対応です。メールで有人サポートにお問い合わせください。このチャットで身分証明書を送らないでください。",
      account_suspension:
        "アカウント停止やアクセスの問題は人による対応が必要です。メールで有人サポートにお問い合わせください。",
      legal:
        "法務上の質問やデータ権利の請求は人にお伝えする必要があります。メールで有人サポートにお問い合わせください。",
      provider_problem:
        "プロバイダーや接続の問題は人による確認が必要です。メールで有人サポートにお問い合わせください。",
      refund:
        "返金のご依頼は人による対応が必要です。注文番号を添えてメールで有人サポートにお問い合わせください。",
      human_request:
        "有人サポート担当者が対応できます。メールで Braxel サポートにお問い合わせください。",
    },
  },
  ar: {
    unknown:
      "ليس لدي إجابة موثّقة عن ذلك في محتوى Braxel المعتمد، لذلك لن أخمّن. يرجى التواصل مع الدعم البشري.",
    timeout:
      "استغرق المساعد وقتًا طويلاً للرد. يرجى المحاولة مرة أخرى أو التواصل مع الدعم البشري.",
    providerError:
      "المساعد غير متاح حاليًا. يرجى المحاولة لاحقًا أو التواصل مع الدعم البشري.",
    rateLimited:
      "عدد الرسائل كبير جدًا. يرجى الانتظار قليلاً والمحاولة مرة أخرى، أو التواصل مع الدعم البشري.",
    disabled:
      "مساعد الدعم غير متاح حاليًا. يرجى التواصل مع الدعم البشري عبر البريد الإلكتروني.",
    invalidMessage:
      "رسالتك فارغة أو طويلة جدًا. يرجى تقصيرها والمحاولة مرة أخرى.",
    knowledgeFallback:
      "وجدت صفحة رسمية من Braxel حول هذا الموضوع. يرجى فتح الرابط أدناه للاطلاع على التفاصيل المعتمدة. إذا كنت بحاجة إلى مزيد من المساعدة، فتواصل مع الدعم البشري.",
    secret:
      "لأمانك، لا أطلب أبدًا كلمات المرور أو أرقام البطاقات أو بيانات اعتماد Tradovate أو مفاتيح API أو رموز MFA أو المفاتيح الخاصة، ولا أقبلها. يرجى عدم مشاركتها هنا. لإعادة تعيين كلمة المرور، استخدم رابط «هل نسيت كلمة المرور؟» في صفحة تسجيل الدخول. لمسائل الحساب أو الدفع، تواصل مع الدعم البشري.",
    advice:
      "لا يمكنني تقديم مشورة مالية أو استثمارية أو تجارية أو ضريبية أو قانونية. يمكنني شرح كيفية عمل Braxel والخطط والإجراءات الرسمية، لكن ليس ما يجب أن تشتريه أو تبيعه أو تستثمر فيه. التداول ينطوي على مخاطر خسارة كبيرة. يرجى قراءة إخلاء المسؤولية المالية.",
    injection:
      "لا يمكنني اتباع تعليمات تحاول تغيير قواعدي أو الكشف عن إعداداتي. ما زال بإمكاني المساعدة في أسئلة الحساب والدفع والتهيئة والدعم الخاصة بـ Braxel.",
    promise:
      "لا يمكنني الوعد بالأرباح أو المدفوعات أو الموافقة على الحساب أو الأمان أو العوائد. التداول ينطوي على مخاطر خسارة كبيرة. يمكنني شرح الإجراءات الرسمية لـ Braxel.",
    escalation: {
      payment_dispute:
        "يجب أن يتولى شخص معالجة نزاعات الدفع. تواصل مع الدعم البشري عبر البريد الإلكتروني ولا تدفع مرتين.",
      kyc:
        "يتولى شخص معالجة التحقق من الهوية (KYC). تواصل مع الدعم البشري عبر البريد الإلكتروني؛ لا ترسل مستندات الهوية عبر هذه المحادثة.",
      account_suspension:
        "يجب أن يتولى شخص معالجة تعليق الحساب ومشكلات الوصول. تواصل مع الدعم البشري عبر البريد الإلكتروني.",
      legal:
        "يجب تحويل الأسئلة القانونية وطلبات حقوق البيانات إلى شخص. تواصل مع الدعم البشري عبر البريد الإلكتروني.",
      provider_problem:
        "يجب أن يتحقق شخص من مشكلات المزوّد والاتصال. تواصل مع الدعم البشري عبر البريد الإلكتروني.",
      refund:
        "يجب أن يتولى شخص معالجة طلبات الاسترداد. تواصل مع الدعم البشري عبر البريد الإلكتروني مع مرجع الطلب.",
      human_request:
        "يمكن لموظف دعم بشري المساعدة في ذلك. تواصل مع دعم Braxel عبر البريد الإلكتروني.",
    },
  },
  he: {
    unknown:
      "אין לי תשובה מאומתת לכך בתוכן המאושר של Braxel, ולכן לא אשער. אנא פנה לתמיכה אנושית.",
    timeout: "העוזר לקח יותר מדי זמן להשיב. נסה שוב או פנה לתמיכה אנושית.",
    providerError: "העוזר אינו זמין כעת. נסה שוב מאוחר יותר או פנה לתמיכה אנושית.",
    rateLimited: "יותר מדי הודעות. המתן רגע ונסה שוב, או פנה לתמיכה אנושית.",
    disabled: "עוזר התמיכה אינו זמין כעת. פנה לתמיכה אנושית בדוא״ל.",
    invalidMessage:
      "ההודעה שלך ריקה או ארוכה מדי. קצר אותה ונסה שוב.",
    knowledgeFallback:
      "מצאתי עמוד רשמי של Braxel בנושא זה. פתח את הקישור למטה לפרטים המאושרים. אם צריך עזרה נוספת, פנה לתמיכה אנושית.",
    secret:
      "למען אבטחתך, איני מבקש ואיני מקבל סיסמאות, מספרי כרטיס, פרטי התחברות ל-Tradovate, מפתחות API, קודי MFA או מפתחות פרטיים. אנא אל תשתף אותם כאן. לאיפוס הסיסמה, השתמש בקישור ״שכחת סיסמה?״ בעמוד הכניסה. בענייני חשבון או תשלום, פנה לתמיכה אנושית.",
    advice:
      "איני יכול לתת ייעוץ פיננסי, השקעות, מסחר, מיסוי או משפטי. אני יכול להסביר כיצד Braxel פועל, את התוכניות ואת ההליכים הרשמיים, אך לא מה לקנות, למכור או להשקיע בו. מסחר כרוך בסיכון מהותי להפסד. קרא את כתב הוויתור הפיננסי.",
    injection:
      "איני יכול לבצע הוראות שמנסות לשנות את הכללים שלי או לחשוף את התצורה שלי. אני יכול להמשיך לעזור בשאלות חשבון, תשלום, קליטה ותמיכה של Braxel.",
    promise:
      "איני יכול להבטיח רווחים, תשלומים, אישור חשבון, בטיחות או תשואות. מסחר כרוך בסיכון מהותי להפסד. אני יכול להסביר את ההליכים הרשמיים של Braxel.",
    escalation: {
      payment_dispute:
        "מחלוקות תשלום חייבות להיות מטופלות בידי אדם. פנה לתמיכה אנושית בדוא״ל ואל תשלם פעמיים.",
      kyc:
        "אימות זהות (KYC) מטופל בידי אדם. פנה לתמיכה אנושית בדוא״ל; אל תשלח מסמכי זהות בצ׳אט הזה.",
      account_suspension:
        "השעיית חשבון ובעיות גישה חייבות להיות מטופלות בידי אדם. פנה לתמיכה אנושית בדוא״ל.",
      legal:
        "שאלות משפטיות ובקשות לזכויות מידע חייבות לעבור לאדם. פנה לתמיכה אנושית בדוא״ל.",
      provider_problem:
        "בעיות ספק וחיבור חייבות להיבדק בידי אדם. פנה לתמיכה אנושית בדוא״ל.",
      refund:
        "בקשות החזר חייבות להיות מטופלות בידי אדם. פנה לתמיכה אנושית בדוא״ל עם מספר ההזמנה.",
      human_request: "נציג תמיכה אנושי יכול לעזור בכך. פנה לתמיכת Braxel בדוא״ל.",
    },
  },
};

/** Localized deterministic message. Always returns a non-empty string. */
export function chatMessage(locale: SupportedLocale, key: ChatMessageKey): string {
  return CHAT_MESSAGES[locale]?.[key] ?? CHAT_MESSAGES.en[key];
}

/** Localized human-handoff message for an escalation category. */
export function escalationMessage(
  locale: SupportedLocale,
  category: EscalationCategory,
): string {
  return CHAT_MESSAGES[locale]?.escalation[category]
    ?? CHAT_MESSAGES.en.escalation[category];
}
