// ============================================================================
// Localized conversational replies for the support chatbot.
//
// These are the natural first-line answers for messages that are not a single
// knowledge question: a prospective customer ("quero começar"), a requirements
// or eligibility question, a benefits question, a complaint, a farewell or an
// acknowledgement.
//
// Rules:
//   * every sentence mirrors the approved English knowledge (knowledge.ts) —
//     no new facts, no invented country list, no legal or regulatory claim;
//   * no price, wallet, IBAN, link or plan amount is written here (the plans
//     answer uses the canonical plan table at runtime);
//   * no profit/return/approval promise and no financial, legal or trading
//     advice;
//   * at most ONE question per reply.
//
// Pure data + pure lookup. No I/O, no model, no user data.
// ============================================================================

import type { SupportedLocale } from "./language.ts";
import type { ConversationalIntent } from "./conversation.ts";

export const CONVERSATIONAL_REPLY_KEYS = [
  "customer_interest",
  "what_we_do",
  "requirements",
  "eligibility",
  "benefits",
  "complaint",
  "farewell",
  "acknowledgement",
] as const;

export type ConversationalReplyKey = (typeof CONVERSATIONAL_REPLY_KEYS)[number];

type ReplyTable = Record<ConversationalReplyKey, string>;

export const CONVERSATIONAL_REPLIES: Record<SupportedLocale, ReplyTable> = {
  en: {
    customer_interest:
      "Absolutely! I can explain how to get started with Braxel. You can review the four monthly plans, choose the one that fits your goals, create an account, and follow checkout and onboarding. Trading involves risk, so please read the Financial Disclaimer. Would you like to see the plans or learn how the process works first?",
    what_we_do:
      "Braxel Markets sells a monthly signals plan for prop-firm traders. You buy and operate your own account with a firm such as Tradeify or Lucid and execute the signals yourself with a third-party tool. Braxel provides the plan, the dashboard and manual activation review; it does not operate accounts, hold funds or guarantee results. Would you like the plans or the step-by-step process?",
    requirements:
      "To start you need an email address, a Braxel account, one of the four monthly plans and completion of checkout and onboarding. For activation you also need your own external prop-firm account, such as Tradeify or Lucid, and a third-party tool to execute the signals yourself. Braxel never asks for your broker password.",
    eligibility:
      "Braxel does not publish a country-by-country eligibility list in the app, so I cannot confirm availability for a specific country. What is documented: you need your own account, a plan, onboarding, and an external prop-firm account for activation. For country-specific availability, please contact human support.",
    benefits:
      "The documented offering is a fixed monthly signals plan with four tiers, a dashboard that shows only your own data, an optional read-only Tradovate integration, manual activation review and support in 11 languages. Braxel does not operate your account, does not custody funds and does not promise returns.",
    complaint:
      "I am sorry this has been frustrating. I can help with plans, checkout, payment status, activation, the dashboard and support, and a human can review your case. Could you tell me what happened so I can point you to the right step?",
    farewell:
      "Thanks for stopping by! If you need anything about Braxel later, just open this chat. Take care.",
    acknowledgement:
      "Great. What would you like to do next: see the plans, start checkout, or understand how activation works?",
  },
  pt: {
    customer_interest:
      "Claro! Posso explicar como começar na Braxel. Pode ver os quatro planos mensais, escolher o que faz sentido para o seu objetivo, criar a conta e seguir o checkout e a integração. A negociação envolve risco, por isso leia o Aviso Financeiro. Quer que eu mostre os planos ou explique primeiro como funciona o processo?",
    what_we_do:
      "A Braxel Markets vende um plano mensal de sinais para traders de prop firms. Compra e opera a sua própria conta numa firma como a Tradeify ou a Lucid e executa os sinais você mesmo com uma ferramenta de terceiros. A Braxel fornece o plano, o painel e a revisão manual da ativação; não opera contas, não guarda fundos e não garante resultados. Quer ver os planos ou o processo passo a passo?",
    requirements:
      "Para começar precisa de um endereço de email, de uma conta na Braxel, de um dos quatro planos mensais e de concluir o checkout e a integração. Para a ativação precisa também da sua própria conta de prop firm, como a Tradeify ou a Lucid, e de uma ferramenta de terceiros para executar os sinais. A Braxel nunca pede a palavra-passe da corretora.",
    eligibility:
      "A Braxel não publica na aplicação uma lista de países elegíveis, por isso não posso confirmar a disponibilidade para um país específico. O que está documentado: precisa da sua conta, de um plano, da integração e de uma conta de prop firm externa para a ativação. Para saber a disponibilidade do seu país, contacte o suporte humano.",
    benefits:
      "A oferta documentada é um plano mensal de sinais com quatro níveis, um painel que mostra apenas os seus dados, uma integração Tradovate opcional e só de leitura, revisão manual da ativação e suporte em 11 idiomas. A Braxel não opera a sua conta, não guarda fundos e não promete retornos.",
    complaint:
      "Lamento que a experiência tenha sido frustrante. Posso ajudar com planos, checkout, estado do pagamento, ativação, painel e suporte, e uma pessoa pode rever o seu caso. Pode dizer-me o que aconteceu para eu indicar o passo certo?",
    farewell:
      "Obrigado pela visita! Se precisar de algo sobre a Braxel mais tarde, basta abrir este chat. Até breve.",
    acknowledgement:
      "Ótimo. O que quer fazer a seguir: ver os planos, iniciar o checkout ou entender como funciona a ativação?",
  },
  es: {
    customer_interest:
      "¡Claro! Puedo explicarte cómo empezar en Braxel. Puedes revisar los cuatro planes mensuales, elegir el que se adapte a tus objetivos, crear una cuenta y seguir el proceso de pago y onboarding. Operar conlleva riesgo, así que lee el Aviso Financiero. ¿Quieres ver primero los planes o saber cómo funciona el proceso?",
    what_we_do:
      "Braxel Markets vende un plan mensual de señales para traders de prop firms. Compras y operas tu propia cuenta en una firma como Tradeify o Lucid y ejecutas las señales tú mismo con una herramienta de terceros. Braxel ofrece el plan, el panel y la revisión manual de la activación; no opera cuentas, no custodia fondos y no garantiza resultados. ¿Quieres ver los planes o el proceso paso a paso?",
    requirements:
      "Para empezar necesitas un correo electrónico, una cuenta en Braxel, uno de los cuatro planes mensuales y completar el pago y el onboarding. Para la activación también necesitas tu propia cuenta de prop firm, como Tradeify o Lucid, y una herramienta de terceros para ejecutar las señales. Braxel nunca pide la contraseña de tu bróker.",
    eligibility:
      "Braxel no publica en la aplicación una lista de países elegibles, así que no puedo confirmar la disponibilidad para un país concreto. Lo documentado es: necesitas tu cuenta, un plan, el onboarding y una cuenta de prop firm externa para la activación. Para la disponibilidad de tu país, contacta con el soporte humano.",
    benefits:
      "La oferta documentada es un plan mensual de señales con cuatro niveles, un panel que muestra solo tus datos, una integración Tradovate opcional y de solo lectura, revisión manual de la activación y soporte en 11 idiomas. Braxel no opera tu cuenta, no custodia fondos y no promete retornos.",
    complaint:
      "Siento que la experiencia haya sido frustrante. Puedo ayudar con planes, pago, estado del pago, activación, panel y soporte, y una persona puede revisar tu caso. ¿Puedes contarme qué pasó para indicarte el paso correcto?",
    farewell:
      "¡Gracias por pasar! Si más adelante necesitas algo sobre Braxel, abre este chat. Hasta luego.",
    acknowledgement:
      "Genial. ¿Qué quieres hacer ahora: ver los planes, iniciar el pago o entender cómo funciona la activación?",
  },
  it: {
    customer_interest:
      "Certo! Posso spiegarti come iniziare con Braxel. Puoi vedere i quattro piani mensili, scegliere quello adatto ai tuoi obiettivi, creare un account e seguire il checkout e l'onboarding. Il trading comporta rischi, quindi leggi l'Avviso Finanziario. Vuoi vedere prima i piani o capire come funziona il processo?",
    what_we_do:
      "Braxel Markets vende un piano mensile di segnali per trader di prop firm. Acquisti e gestisci il tuo conto presso una società come Tradeify o Lucid ed esegui tu stesso i segnali con uno strumento di terze parti. Braxel offre il piano, la dashboard e la revisione manuale dell'attivazione; non gestisce conti, non custodisce fondi e non garantisce risultati. Vuoi vedere i piani o il processo passo passo?",
    requirements:
      "Per iniziare servono un indirizzo email, un account Braxel, uno dei quattro piani mensili e il completamento di checkout e onboarding. Per l'attivazione serve anche il tuo conto prop firm, come Tradeify o Lucid, e uno strumento di terze parti per eseguire i segnali. Braxel non chiede mai la password del broker.",
    eligibility:
      "Braxel non pubblica nell'app un elenco dei paesi idonei, quindi non posso confermare la disponibilità per un paese specifico. Quello che è documentato: servono il tuo account, un piano, l'onboarding e un conto prop firm esterno per l'attivazione. Per la disponibilità nel tuo paese contatta il supporto umano.",
    benefits:
      "L'offerta documentata è un piano mensile di segnali con quattro livelli, una dashboard che mostra solo i tuoi dati, un'integrazione Tradovate opzionale e di sola lettura, revisione manuale dell'attivazione e supporto in 11 lingue. Braxel non gestisce il tuo conto, non custodisce fondi e non promette rendimenti.",
    complaint:
      "Mi dispiace che l'esperienza sia stata frustrante. Posso aiutarti con piani, checkout, stato del pagamento, attivazione, dashboard e supporto, e una persona può esaminare il tuo caso. Puoi dirmi cosa è successo per indicarti il passo giusto?",
    farewell:
      "Grazie della visita! Se più avanti ti serve qualcosa su Braxel, apri questa chat. A presto.",
    acknowledgement:
      "Ottimo. Cosa vuoi fare adesso: vedere i piani, iniziare il checkout o capire come funziona l'attivazione?",
  },
  fr: {
    customer_interest:
      "Bien sûr ! Je peux vous expliquer comment commencer avec Braxel. Vous pouvez consulter les quatre forfaits mensuels, choisir celui qui correspond à vos objectifs, créer un compte et suivre le paiement puis l'onboarding. Le trading comporte des risques, veuillez donc lire l'Avis sur les Risques. Voulez-vous voir les forfaits ou d'abord comprendre le processus ?",
    what_we_do:
      "Braxel Markets vend un forfait mensuel de signaux pour les traders de prop firms. Vous achetez et gérez votre propre compte chez une société comme Tradeify ou Lucid et vous exécutez vous-même les signaux avec un outil tiers. Braxel fournit le forfait, le tableau de bord et la revue manuelle de l'activation ; Braxel ne gère pas les comptes, ne détient pas de fonds et ne garantit aucun résultat. Voulez-vous voir les forfaits ou le processus étape par étape ?",
    requirements:
      "Pour commencer, il faut une adresse e-mail, un compte Braxel, l'un des quatre forfaits mensuels et suivre le paiement puis l'onboarding. Pour l'activation, il faut aussi votre propre compte de prop firm, comme Tradeify ou Lucid, et un outil tiers pour exécuter les signaux. Braxel ne demande jamais le mot de passe de votre courtier.",
    eligibility:
      "Braxel ne publie pas dans l'application de liste des pays éligibles, je ne peux donc pas confirmer la disponibilité pour un pays précis. Ce qui est documenté : il faut votre compte, un forfait, l'onboarding et un compte de prop firm externe pour l'activation. Pour la disponibilité dans votre pays, contactez le support humain.",
    benefits:
      "L'offre documentée est un forfait mensuel de signaux avec quatre niveaux, un tableau de bord qui montre uniquement vos données, une intégration Tradovate optionnelle en lecture seule, une revue manuelle de l'activation et un support en 11 langues. Braxel ne gère pas votre compte, ne détient pas de fonds et ne promet aucun rendement.",
    complaint:
      "Je suis désolé que cette expérience ait été frustrante. Je peux aider sur les forfaits, le paiement, le statut du paiement, l'activation, le tableau de bord et le support, et une personne peut examiner votre cas. Pouvez-vous me dire ce qui s'est passé pour que je vous indique la bonne étape ?",
    farewell:
      "Merci de votre visite ! Si vous avez besoin d'aide sur Braxel plus tard, ouvrez simplement ce chat. À bientôt.",
    acknowledgement:
      "Parfait. Que voulez-vous faire maintenant : voir les forfaits, commencer le paiement ou comprendre l'activation ?",
  },
  de: {
    customer_interest:
      "Gerne! Ich kann Ihnen erklären, wie Sie bei Braxel starten. Sie können die vier monatlichen Pakete ansehen, das passende auswählen, ein Konto erstellen und dann Checkout und Onboarding durchlaufen. Trading birgt Risiken, bitte lesen Sie den Finanzhinweis. Möchten Sie zuerst die Pakete sehen oder wissen, wie der Ablauf funktioniert?",
    what_we_do:
      "Braxel Markets verkauft ein monatliches Signal-Paket für Prop-Firm-Trader. Sie kaufen und führen Ihr eigenes Konto bei einer Firma wie Tradeify oder Lucid und führen die Signale selbst mit einem Drittanbieter-Tool aus. Braxel stellt das Paket, das Dashboard und die manuelle Prüfung der Aktivierung; Braxel führt keine Konten, verwahrt keine Gelder und garantiert keine Ergebnisse. Möchten Sie die Pakete oder den Ablauf Schritt für Schritt sehen?",
    requirements:
      "Zum Start brauchen Sie eine E-Mail-Adresse, ein Braxel-Konto, eines der vier monatlichen Pakete und den Abschluss von Checkout und Onboarding. Für die Aktivierung brauchen Sie zusätzlich Ihr eigenes Prop-Firm-Konto, etwa bei Tradeify oder Lucid, und ein Drittanbieter-Tool für die Signale. Braxel fragt nie nach Ihrem Broker-Passwort.",
    eligibility:
      "Braxel veröffentlicht in der App keine Länderliste, daher kann ich die Verfügbarkeit für ein bestimmtes Land nicht bestätigen. Dokumentiert ist: Sie brauchen Ihr Konto, ein Paket, das Onboarding und ein externes Prop-Firm-Konto für die Aktivierung. Für die Verfügbarkeit in Ihrem Land wenden Sie sich bitte an den menschlichen Support.",
    benefits:
      "Das dokumentierte Angebot ist ein monatliches Signal-Paket mit vier Stufen, ein Dashboard, das nur Ihre eigenen Daten zeigt, eine optionale Tradovate-Integration im Nur-Lese-Modus, eine manuelle Prüfung der Aktivierung und Support in 11 Sprachen. Braxel führt Ihr Konto nicht, verwahrt keine Gelder und verspricht keine Renditen.",
    complaint:
      "Es tut mir leid, dass die Erfahrung frustrierend war. Ich kann bei Paketen, Checkout, Zahlungsstatus, Aktivierung, Dashboard und Support helfen, und ein Mensch kann Ihren Fall prüfen. Können Sie mir sagen, was passiert ist, damit ich den richtigen Schritt nennen kann?",
    farewell:
      "Danke für Ihren Besuch! Wenn Sie später etwas zu Braxel brauchen, öffnen Sie einfach diesen Chat. Bis bald.",
    acknowledgement:
      "Gut. Was möchten Sie jetzt tun: die Pakete sehen, den Checkout starten oder verstehen, wie die Aktivierung funktioniert?",
  },
  ru: {
    customer_interest:
      "Конечно! Я могу объяснить, как начать в Braxel. Вы можете посмотреть четыре месячных тарифа, выбрать подходящий, создать аккаунт и пройти оплату и онбординг. Торговля связана с риском, поэтому прочитайте финансовое предупреждение. Хотите сначала посмотреть тарифы или узнать, как устроен процесс?",
    what_we_do:
      "Braxel Markets продаёт месячный тариф сигналов для трейдеров проп-фирм. Вы покупаете и ведёте свой счёт в фирме вроде Tradeify или Lucid и сами исполняете сигналы сторонним инструментом. Braxel предоставляет тариф, панель и ручную проверку активации; Braxel не ведёт счета, не хранит средства и не гарантирует результат. Хотите посмотреть тарифы или пошаговый процесс?",
    requirements:
      "Для старта нужны адрес электронной почты, аккаунт Braxel, один из четырёх месячных тарифов и завершение оплаты и онбординга. Для активации также нужен ваш собственный счёт проп-фирмы, например Tradeify или Lucid, и сторонний инструмент для исполнения сигналов. Braxel никогда не спрашивает пароль брокера.",
    eligibility:
      "Braxel не публикует в приложении список стран, поэтому я не могу подтвердить доступность для конкретной страны. Документировано: нужны ваш аккаунт, тариф, онбординг и внешний счёт проп-фирмы для активации. По доступности в вашей стране обратитесь в поддержку.",
    benefits:
      "Документированное предложение — месячный тариф сигналов с четырьмя уровнями, панель только с вашими данными, необязательная интеграция Tradovate в режиме чтения, ручная проверка активации и поддержка на 11 языках. Braxel не ведёт ваш счёт, не хранит средства и не обещает доходность.",
    complaint:
      "Мне жаль, что это было неприятно. Я могу помочь с тарифами, оплатой, статусом платежа, активацией, панелью и поддержкой, а человек может рассмотреть ваш случай. Расскажите, что произошло, чтобы я подсказал нужный шаг?",
    farewell:
      "Спасибо, что зашли! Если позже понадобится помощь по Braxel, просто откройте этот чат. Всего доброго.",
    acknowledgement:
      "Хорошо. Что хотите сделать дальше: посмотреть тарифы, начать оплату или понять, как работает активация?",
  },
  zh: {
    customer_interest:
      "当然可以！我可以说明如何在 Braxel 开始。您可以查看四个月度套餐，选择适合自己目标的一个，创建账户并完成结账和入门流程。交易存在风险，请阅读财务免责声明。您想先看套餐，还是先了解流程如何运作？",
    what_we_do:
      "Braxel Markets 为自营交易公司交易者提供月度信号套餐。您在 Tradeify 或 Lucid 等公司购买并运营自己的账户，并使用第三方工具自行执行信号。Braxel 提供套餐、仪表盘和人工激活审核；Braxel 不运营账户、不托管资金，也不保证结果。您想了解套餐还是分步流程？",
    requirements:
      "开始需要电子邮箱、Braxel 账户、四个月度套餐之一，并完成结账和入门流程。激活还需要您自己的自营交易公司账户（如 Tradeify 或 Lucid），以及用于执行信号的第三方工具。Braxel 绝不会索要您的券商密码。",
    eligibility:
      "Braxel 不会在应用中公布各国资格名单，因此我无法确认特定国家是否可用。已说明的要求是：您需要自己的账户、套餐、入门流程，以及用于激活的外部自营交易公司账户。关于您所在国家是否可用，请联系人工支持。",
    benefits:
      "已说明的服务包括四档月度信号套餐、只显示您自己数据的仪表盘、可选的只读 Tradovate 集成、人工激活审核以及 11 种语言支持。Braxel 不运营您的账户、不托管资金，也不承诺回报。",
    complaint:
      "很抱歉这次体验让您不满意。我可以帮助处理套餐、结账、付款状态、激活、仪表盘和支持问题，人工也可以审核您的情况。可以告诉我发生了什么吗，这样我能指出正确的步骤？",
    farewell:
      "感谢您的来访！如果以后需要 Braxel 的帮助，打开这个聊天即可。再见。",
    acknowledgement:
      "好的。接下来您想做什么：查看套餐、开始结账，还是了解激活如何运作？",
  },
  ja: {
    customer_interest:
      "もちろんです。Braxel の始め方をご説明します。4つの月額プランを確認し、目標に合うものを選んで、アカウントを作成し、決済とオンボーディングに進みます。取引にはリスクがあるため、財務免責事項をお読みください。まずプランを見ますか、それとも流れを説明しましょうか？",
    what_we_do:
      "Braxel Markets はプロップファームのトレーダー向けに月額シグナルプランを販売しています。Tradeify や Lucid などの会社でご自身の口座を購入・運用し、サードパーティ製ツールでご自身がシグナルを実行します。Braxel はプラン、ダッシュボード、手動のアクティベーション審査を提供しますが、口座運用・資金保管・成果保証は行いません。プランと手順のどちらを見ますか？",
    requirements:
      "始めるにはメールアドレス、Braxel アカウント、4つの月額プランのいずれか、そして決済とオンボーディングの完了が必要です。アクティベーションにはご自身のプロップファーム口座（Tradeify や Lucid など）とシグナル実行用のサードパーティ製ツールも必要です。Braxel がブローカーのパスワードを尋ねることはありません。",
    eligibility:
      "Braxel はアプリ内で国別の対象リストを公開していないため、特定の国での利用可否は確認できません。記載されている条件は、ご自身のアカウント、プラン、オンボーディング、そしてアクティベーション用の外部プロップファーム口座です。お住まいの国での可否は人的サポートにお問い合わせください。",
    benefits:
      "記載されている内容は、4段階の月額シグナルプラン、ご自身のデータのみを表示するダッシュボード、任意の読み取り専用 Tradovate 連携、手動のアクティベーション審査、11言語のサポートです。Braxel は口座を運用せず、資金を保管せず、リターンを約束しません。",
    complaint:
      "ご不便をおかけして申し訳ありません。プラン、決済、支払い状況、アクティベーション、ダッシュボード、サポートについてお手伝いでき、担当者が状況を確認できます。何があったか教えていただけますか。適切な手順をご案内します。",
    farewell:
      "ご訪問ありがとうございました。後で Braxel について必要なことがあれば、このチャットを開いてください。それでは。",
    acknowledgement:
      "承知しました。次に何をしますか。プランを見る、決済を始める、アクティベーションの流れを確認する、のいずれですか？",
  },
  ar: {
    customer_interest:
      "بالطبع! يمكنني شرح كيفية البدء مع Braxel. يمكنك مراجعة الخطط الشهرية الأربع، واختيار ما يناسب هدفك، وإنشاء حساب ثم إكمال الدفع والتهيئة. التداول ينطوي على مخاطر، لذا يرجى قراءة إخلاء المسؤولية المالي. هل تريد رؤية الخطط أولاً أم معرفة كيف تعمل العملية؟",
    what_we_do:
      "تبيع Braxel Markets خطة إشارات شهرية لمتداولي شركات التمويل. تشتري حسابك وتديره بنفسك لدى شركة مثل Tradeify أو Lucid وتنفذ الإشارات بنفسك بأداة خارجية. توفر Braxel الخطة ولوحة التحكم ومراجعة يدوية للتفعيل؛ ولا تدير الحسابات ولا تحتفظ بالأموال ولا تضمن النتائج. هل تريد الخطط أم العملية خطوة بخطوة؟",
    requirements:
      "للبدء تحتاج إلى بريد إلكتروني وحساب Braxel وإحدى الخطط الشهرية الأربع وإكمال الدفع والتهيئة. وللتفعيل تحتاج أيضًا إلى حساب شركة تمويل خاص بك مثل Tradeify أو Lucid وأداة خارجية لتنفيذ الإشارات. لا تطلب Braxel أبدًا كلمة مرور الوسيط.",
    eligibility:
      "لا تنشر Braxel قائمة بالدول المؤهلة داخل التطبيق، لذلك لا يمكنني تأكيد التوفر لدولة معينة. الموثق هو: تحتاج إلى حسابك وخطة والتهيئة وحساب شركة تمويل خارجي للتفعيل. لمعرفة التوفر في بلدك تواصل مع الدعم البشري.",
    benefits:
      "العرض الموثق هو خطة إشارات شهرية بأربع فئات، ولوحة تحكم تعرض بياناتك فقط، وتكامل Tradovate اختياري للقراءة فقط، ومراجعة يدوية للتفعيل، ودعم بـ 11 لغة. لا تدير Braxel حسابك ولا تحتفظ بالأموال ولا تعِد بعوائد.",
    complaint:
      "آسف لأن التجربة كانت محبطة. يمكنني المساعدة في الخطط والدفع وحالة الدفع والتفعيل ولوحة التحكم والدعم، ويمكن لشخص مراجعة حالتك. هل يمكنك إخباري بما حدث لأوجهك إلى الخطوة الصحيحة؟",
    farewell:
      "شكرًا لزيارتك! إذا احتجت لاحقًا إلى مساعدة حول Braxel فافتح هذه المحادثة. إلى اللقاء.",
    acknowledgement:
      "رائع. ماذا تريد أن تفعل الآن: رؤية الخطط، بدء الدفع، أم فهم كيفية عمل التفعيل؟",
  },
  he: {
    customer_interest:
      "בשמחה! אני יכול להסביר איך מתחילים עם Braxel. אפשר לעבור על ארבע התוכניות החודשיות, לבחור את המתאימה למטרה שלך, לפתוח חשבון ולהמשיך לתשלום ולקליטה. מסחר כרוך בסיכון, לכן קרא את כתב הוויתור הפיננסי. רוצה לראות קודם את התוכניות או להבין איך התהליך עובד?",
    what_we_do:
      "Braxel Markets מוכרת תוכנית אותות חודשית לסוחרים בחברות פרופ. אתה קונה ומנהל חשבון משלך בחברה כמו Tradeify או Lucid ומבצע את האותות בעצמך בכלי צד שלישי. Braxel מספקת את התוכנית, את לוח הבקרה ואת בדיקת ההפעלה הידנית; היא לא מנהלת חשבונות, לא מחזיקה כספים ולא מבטיחה תוצאות. רוצה את התוכניות או את התהליך שלב אחר שלב?",
    requirements:
      "כדי להתחיל צריך כתובת דואל, חשבון Braxel, אחת מארבע התוכניות החודשיות והשלמת התשלום והקליטה. להפעלה צריך גם חשבון חברת פרופ משלך, כמו Tradeify או Lucid, וכלי צד שלישי לביצוע האותות. Braxel לעולם לא מבקשת את סיסמת הברוקר.",
    eligibility:
      "Braxel לא מפרסמת באפליקציה רשימת מדינות זכאיות, לכן אינני יכול לאשר זמינות למדינה מסוימת. מה שמתועד: צריך חשבון משלך, תוכנית, קליטה וחשבון חברת פרופ חיצוני להפעלה. לגבי זמינות במדינה שלך פנה לתמיכה האנושית.",
    benefits:
      "ההצעה המתועדת היא תוכנית אותות חודשית עם ארבע דרגות, לוח בקרה שמציג רק את הנתונים שלך, אינטגרציית Tradovate אופציונלית לקריאה בלבד, בדיקת הפעלה ידנית ותמיכה ב-11 שפות. Braxel לא מנהלת את החשבון שלך, לא מחזיקה כספים ולא מבטיחה תשואות.",
    complaint:
      "אני מצטער שהחוויה הייתה מתסכלת. אני יכול לעזור בתוכניות, בתשלום, בסטטוס התשלום, בהפעלה, בלוח הבקרה ובתמיכה, ואדם יכול לבדוק את המקרה שלך. אפשר לספר מה קרה כדי שאכוון אותך לשלב הנכון?",
    farewell:
      "תודה שביקרת! אם בהמשך תצטרך משהו בנושא Braxel, פשוט פתח את הצ'אט הזה. להתראות.",
    acknowledgement:
      "מעולה. מה תרצה לעשות עכשיו: לראות את התוכניות, להתחיל את התשלום או להבין איך ההפעלה עובדת?",
  },
};

/**
 * The localized conversational reply for an intent, or null when the intent
 * is answered by an approved article instead.
 */
export function conversationalReply(
  locale: SupportedLocale,
  intent: ConversationalIntent,
): string | null {
  const table = CONVERSATIONAL_REPLIES[locale] ?? CONVERSATIONAL_REPLIES.en;
  return (table as Record<string, string | undefined>)[intent] ?? null;
}
