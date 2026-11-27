// ============================================================================
// Localized natural replies for the response strategies.
//
// These are the sentences the assistant uses when the right answer is a
// conversation move rather than a knowledge article: empathy for a frustrated
// customer, a simpler explanation, a plan comparison, the cheapest plan, or a
// polite topic change.
//
// Rules:
//   * no price is written here. {{plan}} / {{price}} / {{capital}} are filled
//     at runtime from the canonical server plan table, and {{plans}} is filled
//     with the canonical plan summary;
//   * no URL, wallet, IBAN, promise, advice or legal claim;
//   * at most ONE question per reply;
//   * every sentence mirrors the approved English knowledge.
//
// Pure data + pure lookup. No I/O, no model, no user data.
// ============================================================================

import type { SupportedLocale } from "./language.ts";

export const STRATEGY_REPLY_KEYS = [
  "frustration",
  "simplifyPrefix",
  "planComparison",
  "planRecommendation",
  "cheapestPlan",
  "planDetail",
  "durationNote",
  "retryNote",
  "signalsNote",
  "topicChange",
] as const;

export type StrategyReplyKey = (typeof STRATEGY_REPLY_KEYS)[number];

type StrategyTable = Record<StrategyReplyKey, string>;

export const STRATEGY_REPLIES: Record<SupportedLocale, StrategyTable> = {
  en: {
    frustration:
      "I'm sorry — that sounds frustrating. I'm here to help. Is this about logging in, a payment, activation, or the dashboard?",
    simplifyPrefix: "In simple terms:",
    planComparison:
      "The four plans differ by monthly price and managed-capital reference: {{plans}} All are billed monthly in USD, and the amount shown at checkout is the official one. Would you like help choosing?",
    planRecommendation:
      "I can't give financial advice, but here is the documented comparison: {{plans}} Choose the tier that matches the account size you plan to use. Which tier are you considering?",
    cheapestPlan:
      "The most affordable plan is {{plan}} at {{price}} USD per month ({{capital}} USD managed-capital reference). It is billed monthly in USD and the checkout shows the official amount. Would you like the full plan list?",
    planDetail:
      "{{plan}} costs {{price}} USD per month ({{capital}} USD managed-capital reference). It is billed monthly in USD and the checkout shows the official amount. Would you like to see all four plans?",
    durationNote:
      "Timing depends on the manual review of your activation. The dashboard shows your status and support can check it — I can't read an individual status from this chat.",
    retryNote:
      "Yes, you can try again from checkout. A failed or pending payment is not a confirmation, so never pay twice; if the money left your account, contact support with the order reference.",
    signalsNote:
      "You execute the signals yourself in your own prop-firm account with your own tool. Braxel never places, copies or closes orders for you, and there is no copy-trading engine.",
    topicChange:
      "Sure, let's switch. What would you like to know about Braxel — plans, payment, activation, the dashboard, or support?",
  },
  pt: {
    frustration:
      "Sinto muito, isso é frustrante. Estou aqui para ajudar. É sobre entrar na conta, pagamento, ativação ou painel?",
    simplifyPrefix: "Em palavras simples:",
    planComparison:
      "Os quatro planos diferem no preço mensal e na referência de capital gerenciado: {{plans}} Todos são cobrados mensalmente em USD, e o valor do checkout é o oficial. Quer ajuda para escolher?",
    planRecommendation:
      "Não posso dar conselho financeiro, mas esta é a comparação documentada: {{plans}} Escolha o nível que corresponde ao tamanho da conta que pretende usar. Qual nível está a considerar?",
    cheapestPlan:
      "O plano mais acessível é o {{plan}}, a {{price}} USD por mês (referência de capital gerenciado de {{capital}} USD). A cobrança é mensal em USD e o checkout mostra o valor oficial. Quer ver a lista completa de planos?",
    planDetail:
      "O {{plan}} custa {{price}} USD por mês (referência de capital gerenciado de {{capital}} USD). A cobrança é mensal em USD e o checkout mostra o valor oficial. Quer ver os quatro planos?",
    durationNote:
      "O prazo depende da revisão manual da sua ativação. O painel mostra o estado e o suporte pode verificá-lo — não consigo ler um estado individual neste chat.",
    retryNote:
      "Sim, pode tentar novamente no checkout. Um pagamento falhado ou pendente não é uma confirmação, por isso nunca pague duas vezes; se o dinheiro saiu da conta, contacte o suporte com a referência do pedido.",
    signalsNote:
      "É você que executa os sinais na sua própria conta de prop firm, com a sua ferramenta. A Braxel nunca coloca, copia ou fecha ordens por você e não existe motor de copy trading.",
    topicChange:
      "Claro, vamos mudar de assunto. O que quer saber sobre a Braxel: planos, pagamento, ativação, painel ou suporte?",
  },
  es: {
    frustration:
      "Lo siento, eso es frustrante. Estoy aquí para ayudar. ¿Es sobre iniciar sesión, un pago, la activación o el panel?",
    simplifyPrefix: "En palabras simples:",
    planComparison:
      "Los cuatro planes se diferencian por el precio mensual y la referencia de capital gestionado: {{plans}} Todos se cobran mensualmente en USD y el importe del checkout es el oficial. ¿Quieres ayuda para elegir?",
    planRecommendation:
      "No puedo dar asesoramiento financiero, pero esta es la comparación documentada: {{plans}} Elige el nivel que corresponda al tamaño de cuenta que piensas usar. ¿Qué nivel estás considerando?",
    cheapestPlan:
      "El plan más económico es {{plan}}, a {{price}} USD al mes (referencia de capital gestionado de {{capital}} USD). Se cobra mensualmente en USD y el checkout muestra el importe oficial. ¿Quieres ver la lista completa de planes?",
    planDetail:
      "{{plan}} cuesta {{price}} USD al mes (referencia de capital gestionado de {{capital}} USD). Se cobra mensualmente en USD y el checkout muestra el importe oficial. ¿Quieres ver los cuatro planes?",
    durationNote:
      "El plazo depende de la revisión manual de tu activación. El panel muestra el estado y el soporte puede comprobarlo; no puedo leer un estado individual en este chat.",
    retryNote:
      "Sí, puedes intentarlo de nuevo en el checkout. Un pago fallido o pendiente no es una confirmación, así que no pagues dos veces; si el dinero salió de tu cuenta, contacta con soporte con la referencia del pedido.",
    signalsNote:
      "Tú ejecutas las señales en tu propia cuenta de prop firm con tu propia herramienta. Braxel nunca coloca, copia ni cierra órdenes por ti y no existe un motor de copy trading.",
    topicChange:
      "Claro, cambiemos de tema. ¿Qué quieres saber sobre Braxel: planes, pago, activación, panel o soporte?",
  },
  it: {
    frustration:
      "Mi dispiace, è frustrante. Sono qui per aiutarti. Riguarda l'accesso, un pagamento, l'attivazione o la dashboard?",
    simplifyPrefix: "In parole semplici:",
    planComparison:
      "I quattro piani differiscono per prezzo mensile e riferimento di capitale gestito: {{plans}} Tutti sono fatturati mensilmente in USD e l'importo del checkout è quello ufficiale. Vuoi aiuto per scegliere?",
    planRecommendation:
      "Non posso dare consigli finanziari, ma questo è il confronto documentato: {{plans}} Scegli il livello adatto alla dimensione dell'account che pensi di usare. Quale livello stai considerando?",
    cheapestPlan:
      "Il piano più economico è {{plan}}, a {{price}} USD al mese (riferimento di capitale gestito di {{capital}} USD). È fatturato mensilmente in USD e il checkout mostra l'importo ufficiale. Vuoi vedere l'elenco completo dei piani?",
    planDetail:
      "{{plan}} costa {{price}} USD al mese (riferimento di capitale gestito di {{capital}} USD). È fatturato mensilmente in USD e il checkout mostra l'importo ufficiale. Vuoi vedere tutti e quattro i piani?",
    durationNote:
      "I tempi dipendono dalla revisione manuale della tua attivazione. La dashboard mostra lo stato e il supporto può verificarlo: non posso leggere uno stato individuale in questa chat.",
    retryNote:
      "Sì, puoi riprovare dal checkout. Un pagamento fallito o in sospeso non è una conferma, quindi non pagare due volte; se i soldi sono usciti dal conto, contatta il supporto con il riferimento dell'ordine.",
    signalsNote:
      "Sei tu a eseguire i segnali nel tuo account prop firm con il tuo strumento. Braxel non inserisce, copia o chiude ordini per te e non esiste un motore di copy trading.",
    topicChange:
      "Certo, cambiamo argomento. Cosa vuoi sapere su Braxel: piani, pagamento, attivazione, dashboard o supporto?",
  },
  fr: {
    frustration:
      "Je suis désolé, c'est frustrant. Je suis là pour aider. S'agit-il de la connexion, d'un paiement, de l'activation ou du tableau de bord ?",
    simplifyPrefix: "En termes simples :",
    planComparison:
      "Les quatre forfaits diffèrent par le prix mensuel et la référence de capital géré : {{plans}} Tous sont facturés mensuellement en USD et le montant affiché au paiement est le montant officiel. Voulez-vous de l'aide pour choisir ?",
    planRecommendation:
      "Je ne peux pas donner de conseil financier, mais voici la comparaison documentée : {{plans}} Choisissez le niveau correspondant à la taille du compte que vous prévoyez d'utiliser. Quel niveau envisagez-vous ?",
    cheapestPlan:
      "Le forfait le plus abordable est {{plan}}, à {{price}} USD par mois (référence de capital géré de {{capital}} USD). Il est facturé mensuellement en USD et le paiement affiche le montant officiel. Voulez-vous la liste complète des forfaits ?",
    planDetail:
      "{{plan}} coûte {{price}} USD par mois (référence de capital géré de {{capital}} USD). Il est facturé mensuellement en USD et le paiement affiche le montant officiel. Voulez-vous voir les quatre forfaits ?",
    durationNote:
      "Le délai dépend de la vérification manuelle de votre activation. Le tableau de bord affiche l'état et le support peut le vérifier ; je ne peux pas lire un statut individuel dans ce chat.",
    retryNote:
      "Oui, vous pouvez réessayer depuis le paiement. Un paiement échoué ou en attente n'est pas une confirmation : ne payez pas deux fois ; si l'argent a quitté votre compte, contactez le support avec la référence de la commande.",
    signalsNote:
      "C'est vous qui exécutez les signaux sur votre propre compte prop firm avec votre outil. Braxel ne place, ne copie et ne ferme jamais d'ordres pour vous, et il n'existe pas de moteur de copy trading.",
    topicChange:
      "Bien sûr, changeons de sujet. Que voulez-vous savoir sur Braxel : forfaits, paiement, activation, tableau de bord ou support ?",
  },
  de: {
    frustration:
      "Es tut mir leid, das ist frustrierend. Ich helfe gerne. Geht es um die Anmeldung, eine Zahlung, die Aktivierung oder das Dashboard?",
    simplifyPrefix: "Einfach gesagt:",
    planComparison:
      "Die vier Pläne unterscheiden sich in monatlichem Preis und Referenzkapital: {{plans}} Alle werden monatlich in USD abgerechnet, und der Betrag an der Kasse ist der offizielle. Möchten Sie Hilfe bei der Auswahl?",
    planRecommendation:
      "Ich kann keine Finanzberatung geben, aber hier ist der dokumentierte Vergleich: {{plans}} Wählen Sie die Stufe, die zur geplanten Kontogröße passt. Welche Stufe erwägen Sie?",
    cheapestPlan:
      "Der günstigste Plan ist {{plan}} für {{price}} USD pro Monat (Referenzkapital {{capital}} USD). Die Abrechnung erfolgt monatlich in USD, und die Kasse zeigt den offiziellen Betrag. Möchten Sie die vollständige Planliste sehen?",
    planDetail:
      "{{plan}} kostet {{price}} USD pro Monat (Referenzkapital {{capital}} USD). Die Abrechnung erfolgt monatlich in USD, und die Kasse zeigt den offiziellen Betrag. Möchten Sie alle vier Pläne sehen?",
    durationNote:
      "Die Dauer hängt von der manuellen Prüfung Ihrer Aktivierung ab. Das Dashboard zeigt den Status, und der Support kann ihn prüfen — ich kann hier keinen individuellen Status lesen.",
    retryNote:
      "Ja, Sie können es an der Kasse erneut versuchen. Eine fehlgeschlagene oder ausstehende Zahlung ist keine Bestätigung, zahlen Sie also nicht doppelt; wenn das Geld abgebucht wurde, kontaktieren Sie den Support mit der Bestellreferenz.",
    signalsNote:
      "Sie führen die Signale selbst in Ihrem eigenen Prop-Firm-Konto mit Ihrem eigenen Tool aus. Braxel platziert, kopiert oder schließt niemals Orders für Sie, und es gibt keine Copy-Trading-Engine.",
    topicChange:
      "Klar, wechseln wir das Thema. Was möchten Sie über Braxel wissen: Pläne, Zahlung, Aktivierung, Dashboard oder Support?",
  },
  ru: {
    frustration:
      "Мне жаль, это неприятно. Я готов помочь. Это про вход, оплату, активацию или панель?",
    simplifyPrefix: "Простыми словами:",
    planComparison:
      "Четыре тарифа отличаются месячной ценой и ориентиром управляемого капитала: {{plans}} Все оплачиваются ежемесячно в USD, а сумма на странице оплаты — официальная. Нужна помощь с выбором?",
    planRecommendation:
      "Я не могу давать финансовые советы, но вот документированное сравнение: {{plans}} Выберите уровень под размер счёта, который планируете использовать. Какой уровень вы рассматриваете?",
    cheapestPlan:
      "Самый доступный тариф — {{plan}}, {{price}} USD в месяц (ориентир управляемого капитала {{capital}} USD). Оплата ежемесячная в USD, официальная сумма показывается при оплате. Показать полный список тарифов?",
    planDetail:
      "{{plan}} стоит {{price}} USD в месяц (ориентир управляемого капитала {{capital}} USD). Оплата ежемесячная в USD, официальная сумма показывается при оплате. Показать все четыре тарифа?",
    durationNote:
      "Срок зависит от ручной проверки активации. Статус показан в панели, и поддержка может его проверить — я не вижу индивидуальный статус в этом чате.",
    retryNote:
      "Да, можно повторить попытку на странице оплаты. Неудачный или ожидающий платёж не является подтверждением, поэтому не платите дважды; если деньги списались, обратитесь в поддержку с номером заказа.",
    signalsNote:
      "Сигналы вы исполняете сами в своём счёте prop firm своим инструментом. Braxel никогда не размещает, не копирует и не закрывает ордера за вас, и движка копи-трейдинга нет.",
    topicChange:
      "Конечно, сменим тему. Что вы хотите узнать о Braxel: тарифы, оплату, активацию, панель или поддержку?",
  },
  zh: {
    frustration: "抱歉，这确实让人沮丧。我来帮忙。是登录、付款、激活还是仪表盘的问题？",
    simplifyPrefix: "简单来说：",
    planComparison:
      "四个套餐的月费和参考管理资金不同：{{plans}} 全部按月以美元计费，结账页面显示的金额才是官方金额。需要我帮你选择吗？",
    planRecommendation:
      "我不能提供财务建议，但以下是已记录的比较：{{plans}} 请选择与你计划使用的账户规模相符的档位。你在考虑哪个档位？",
    cheapestPlan:
      "最实惠的套餐是 {{plan}}，每月 {{price}} 美元（参考管理资金 {{capital}} 美元）。按月以美元计费，结账页面显示官方金额。要查看完整套餐列表吗？",
    planDetail:
      "{{plan}} 每月 {{price}} 美元（参考管理资金 {{capital}} 美元）。按月以美元计费，结账页面显示官方金额。要查看全部四个套餐吗？",
    durationNote:
      "时间取决于人工审核你的激活。仪表盘会显示状态，支持团队也可以查询；我无法在聊天中读取个人状态。",
    retryNote:
      "可以，你可以在结账页面重试。失败或待处理的付款不是确认，所以不要重复付款；如果款项已扣除，请携带订单号联系支持。",
    signalsNote:
      "信号由你自己在自己的 prop firm 账户中用你的工具执行。Braxel 从不为您下单、复制或平仓，也没有复制交易引擎。",
    topicChange: "当然，我们换个话题。你想了解 Braxel 的哪方面：套餐、付款、激活、仪表盘还是支持？",
  },
  ja: {
    frustration:
      "ご不便をおかけして申し訳ありません。お手伝いします。ログイン、支払い、アクティベーション、ダッシュボードのどれについてですか？",
    simplifyPrefix: "簡単に言うと：",
    planComparison:
      "4つのプランは月額料金と管理資本の目安が異なります：{{plans}} すべて月額USDで請求され、公式の金額はチェックアウトに表示されます。選ぶのを手伝いましょうか？",
    planRecommendation:
      "投資助言はできませんが、記録されている比較はこちらです：{{plans}} 使う予定の口座規模に合うプランを選んでください。どのプランを検討していますか？",
    cheapestPlan:
      "最も手頃なプランは {{plan}} で、月額 {{price}} USD（管理資本の目安 {{capital}} USD）です。月額USDで請求され、公式の金額はチェックアウトに表示されます。プラン一覧を見ますか？",
    planDetail:
      "{{plan}} は月額 {{price}} USD（管理資本の目安 {{capital}} USD）です。月額USDで請求され、公式の金額はチェックアウトに表示されます。4つのプランすべてを見ますか？",
    durationNote:
      "所要時間はアクティベーションの手動審査によって異なります。状態はダッシュボードに表示され、サポートも確認できます。このチャットでは個別の状態は読めません。",
    retryNote:
      "はい、チェックアウトから再試行できます。失敗または保留中の支払いは確認ではないため、二重に支払わないでください。口座から引き落とされた場合は、注文番号を添えてサポートに連絡してください。",
    signalsNote:
      "シグナルはご自身の prop firm 口座で、ご自身のツールを使って執行します。Braxel が注文を出す・コピーする・決済することはなく、コピートレードの仕組みもありません。",
    topicChange:
      "もちろん、話題を変えましょう。Braxel について何を知りたいですか：プラン、支払い、アクティベーション、ダッシュボード、サポート？",
  },
  ar: {
    frustration:
      "أنا آسف، هذا محبط. أنا هنا للمساعدة. هل الأمر يتعلق بتسجيل الدخول أو الدفع أو التفعيل أو لوحة التحكم؟",
    simplifyPrefix: "ببساطة:",
    planComparison:
      "تختلف الخطط الأربع في السعر الشهري والمرجع لرأس المال المُدار: {{plans}} تُفوتر جميعها شهريًا بالدولار الأمريكي، والمبلغ الظاهر عند الدفع هو الرسمي. هل تريد مساعدة في الاختيار؟",
    planRecommendation:
      "لا أستطيع تقديم نصيحة مالية، لكن هذه هي المقارنة الموثقة: {{plans}} اختر الفئة التي تناسب حجم الحساب الذي تخطط لاستخدامه. أي فئة تفكر فيها؟",
    cheapestPlan:
      "الخطة الأقل تكلفة هي {{plan}} بسعر {{price}} دولار أمريكي شهريًا (مرجع رأس مال مُدار {{capital}} دولار). تُفوتر شهريًا بالدولار والمبلغ الرسمي يظهر عند الدفع. هل تريد قائمة الخطط كاملة؟",
    planDetail:
      "تبلغ تكلفة {{plan}} {{price}} دولار أمريكي شهريًا (مرجع رأس مال مُدار {{capital}} دولار). تُفوتر شهريًا بالدولار والمبلغ الرسمي يظهر عند الدفع. هل تريد رؤية الخطط الأربع؟",
    durationNote:
      "تعتمد المدة على المراجعة اليدوية لتفعيلك. تعرض لوحة التحكم الحالة ويمكن للدعم التحقق منها، ولا أستطيع قراءة حالة فردية في هذه المحادثة.",
    retryNote:
      "نعم، يمكنك المحاولة مرة أخرى من صفحة الدفع. الدفع الفاشل أو المعلق ليس تأكيدًا، لذا لا تدفع مرتين؛ وإذا خُصم المبلغ، تواصل مع الدعم مع رقم الطلب.",
    signalsNote:
      "أنت تنفذ الإشارات بنفسك في حساب prop firm الخاص بك وبأداتك. لا تضع Braxel أوامر أو تنسخها أو تغلقها نيابة عنك، ولا يوجد محرك نسخ تداول.",
    topicChange:
      "بالطبع، لنغيّر الموضوع. ماذا تريد أن تعرف عن Braxel: الخطط، الدفع، التفعيل، لوحة التحكم أم الدعم؟",
  },
  he: {
    frustration:
      "אני מצטער, זה מתסכל. אני כאן לעזור. זה קשור להתחברות, לתשלום, להפעלה או ללוח הבקרה?",
    simplifyPrefix: "במילים פשוטות:",
    planComparison:
      "ארבע התוכניות נבדלות במחיר החודשי ובהתייחסות להון המנוהל: {{plans}} כולן מחויבות חודשית בדולר ארה\"ב, והסכום בקופה הוא הרשמי. רוצה עזרה בבחירה?",
    planRecommendation:
      "אני לא יכול לתת ייעוץ פיננסי, אבל זו ההשוואה המתועדת: {{plans}} בחר את הרמה שמתאימה לגודל החשבון שבו אתה מתכנן להשתמש. באיזו רמה אתה שוקל?",
    cheapestPlan:
      "התוכנית הזולה ביותר היא {{plan}} במחיר {{price}} דולר לחודש (התייחסות להון מנוהל {{capital}} דולר). החיוב חודשי בדולר והסכום הרשמי מוצג בקופה. רוצה את רשימת התוכניות המלאה?",
    planDetail:
      "{{plan}} עולה {{price}} דולר לחודש (התייחסות להון מנוהל {{capital}} דולר). החיוב חודשי בדולר והסכום הרשמי מוצג בקופה. רוצה לראות את ארבע התוכניות?",
    durationNote:
      "משך הזמן תלוי בבדיקה ידנית של ההפעלה. לוח הבקרה מציג את הסטטוס והתמיכה יכולה לבדוק אותו — איני יכול לקרוא סטטוס אישי בצ'אט הזה.",
    retryNote:
      "כן, אפשר לנסות שוב בקופה. תשלום שנכשל או ממתין אינו אישור, לכן אל תשלמו פעמיים; אם הכסף ירד מהחשבון, פנו לתמיכה עם מספר ההזמנה.",
    signalsNote:
      "אתה מבצע את האיתותים בעצמך בחשבון ה-prop firm שלך ובכלי שלך. Braxel לא מבצעת, מעתיקה או סוגרת פקודות עבורך, ואין מנוע העתקת מסחר.",
    topicChange:
      "בטח, נחליף נושא. מה תרצה לדעת על Braxel: תוכניות, תשלום, הפעלה, לוח הבקרה או תמיכה?",
  },
};

export function strategyReplyText(
  locale: SupportedLocale,
  key: StrategyReplyKey,
): string {
  return (STRATEGY_REPLIES[locale] ?? STRATEGY_REPLIES.en)[key];
}
