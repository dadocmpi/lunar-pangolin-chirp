#!/usr/bin/env python3
"""Insert the new Tradovate connect-panel i18n keys into all 11 locales.

Idempotent: skips a key that is already present in a locale block.
"""
import re

PATH = "src/i18n.ts"
LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

TOP = {
    "en": {
        "demoOnlyNotice": "Demo (paper trading) only for now. Live trading will be enabled later.",
        "accountActive": "Active",
        "accountInactive": "Inactive",
        "confirmAccount": "CONNECT SELECTED ACCOUNT",
    },
    "pt": {
        "demoOnlyNotice": "Apenas demonstração (conta simulada) por enquanto. A negociação real será ativada mais tarde.",
        "accountActive": "Ativa",
        "accountInactive": "Inativa",
        "confirmAccount": "CONECTAR CONTA SELECIONADA",
    },
    "it": {
        "demoOnlyNotice": "Solo demo (conto simulato) per ora. Il trading reale sarà attivato più avanti.",
        "accountActive": "Attivo",
        "accountInactive": "Inattivo",
        "confirmAccount": "COLLEGA ACCOUNT SELEZIONATO",
    },
    "es": {
        "demoOnlyNotice": "Solo demo (cuenta simulada) por ahora. El trading real se activará más adelante.",
        "accountActive": "Activa",
        "accountInactive": "Inactiva",
        "confirmAccount": "CONECTAR CUENTA SELECCIONADA",
    },
    "fr": {
        "demoOnlyNotice": "Démo (compte simulé) uniquement pour l'instant. Le trading réel sera activé plus tard.",
        "accountActive": "Actif",
        "accountInactive": "Inactif",
        "confirmAccount": "CONNECTER LE COMPTE SÉLECTIONNÉ",
    },
    "de": {
        "demoOnlyNotice": "Vorerst nur Demo (Simulationskonto). Der echte Handel wird später aktiviert.",
        "accountActive": "Aktiv",
        "accountInactive": "Inaktiv",
        "confirmAccount": "AUSGEWÄHLTES KONTO VERBINDEN",
    },
    "ru": {
        "demoOnlyNotice": "Пока только демо (симуляционный счёт). Реальная торговля будет включена позже.",
        "accountActive": "Активен",
        "accountInactive": "Неактивен",
        "confirmAccount": "ПОДКЛЮЧИТЬ ВЫБРАННЫЙ СЧЁТ",
    },
    "zh": {
        "demoOnlyNotice": "目前仅限模拟（纸上交易）。实盘交易将在以后启用。",
        "accountActive": "活跃",
        "accountInactive": "非活跃",
        "confirmAccount": "连接所选账户",
    },
    "ja": {
        "demoOnlyNotice": "現時点ではデモ（ペーパートレード）のみです。実取引は後日有効になります。",
        "accountActive": "有効",
        "accountInactive": "無効",
        "confirmAccount": "選択した口座を接続",
    },
    "ar": {
        "demoOnlyNotice": "التجريبي فقط (حساب محاكاة) في الوقت الحالي. سيتم تفعيل التداول الحقيقي لاحقًا.",
        "accountActive": "نشط",
        "accountInactive": "غير نشط",
        "confirmAccount": "ربط الحساب المحدد",
    },
    "he": {
        "demoOnlyNotice": "דמו (מסחר סימולציה) בלבד לעת עתה. מסחר אמיתי יופעל בהמשך.",
        "accountActive": "פעיל",
        "accountInactive": "לא פעיל",
        "confirmAccount": "חבר חשבון נבחר",
    },
}

ERR = {
    "en": {
        "not_enabledTitle": "Not enabled yet",
        "not_enabled": "Tradovate connections are not enabled yet. Please check back soon.",
        "accounts_unavailableTitle": "Accounts unavailable",
        "accounts_unavailable": "We could not read your Tradovate accounts right now. This is on our side — please try again shortly.",
        "no_accountsTitle": "No accounts found",
        "no_accounts": "This Tradovate login has no accounts. Contact Tradovate support.",
        "account_not_availableTitle": "Account unavailable",
        "account_not_available": "That account is no longer available. Reload the panel and try again.",
        "environment_not_allowedTitle": "Environment disabled",
        "environment_not_allowed": "Live trading is disabled. Only the demo environment is available.",
    },
    "pt": {
        "not_enabledTitle": "Ainda não ativado",
        "not_enabled": "As ligações à Tradovate ainda não estão ativadas. Volte a tentar em breve.",
        "accounts_unavailableTitle": "Contas indisponíveis",
        "accounts_unavailable": "Não foi possível ler as suas contas Tradovate agora. É do nosso lado — tente novamente em breve.",
        "no_accountsTitle": "Nenhuma conta encontrada",
        "no_accounts": "Este início de sessão Tradovate não tem contas. Contacte o suporte da Tradovate.",
        "account_not_availableTitle": "Conta indisponível",
        "account_not_available": "Essa conta já não está disponível. Recarregue o painel e tente novamente.",
        "environment_not_allowedTitle": "Ambiente desativado",
        "environment_not_allowed": "A negociação real está desativada. Apenas o ambiente de demonstração está disponível.",
    },
    "it": {
        "not_enabledTitle": "Non ancora abilitato",
        "not_enabled": "Le connessioni a Tradovate non sono ancora abilitate. Riprova presto.",
        "accounts_unavailableTitle": "Account non disponibili",
        "accounts_unavailable": "Non è stato possibile leggere i tuoi account Tradovate ora. È dalla nostra parte — riprova tra poco.",
        "no_accountsTitle": "Nessun account trovato",
        "no_accounts": "Questo accesso Tradovate non ha account. Contatta il supporto Tradovate.",
        "account_not_availableTitle": "Account non disponibile",
        "account_not_available": "Questo account non è più disponibile. Ricarica il pannello e riprova.",
        "environment_not_allowedTitle": "Ambiente disabilitato",
        "environment_not_allowed": "Il trading reale è disabilitato. È disponibile solo l'ambiente demo.",
    },
    "es": {
        "not_enabledTitle": "Aún no habilitado",
        "not_enabled": "Las conexiones con Tradovate aún no están habilitadas. Vuelve a intentarlo pronto.",
        "accounts_unavailableTitle": "Cuentas no disponibles",
        "accounts_unavailable": "No pudimos leer tus cuentas de Tradovate ahora mismo. Es por nuestra parte — inténtalo de nuevo en breve.",
        "no_accountsTitle": "No se encontraron cuentas",
        "no_accounts": "Este inicio de sesión de Tradovate no tiene cuentas. Contacta con el soporte de Tradovate.",
        "account_not_availableTitle": "Cuenta no disponible",
        "account_not_available": "Esa cuenta ya no está disponible. Recarga el panel e inténtalo de nuevo.",
        "environment_not_allowedTitle": "Entorno deshabilitado",
        "environment_not_allowed": "El trading real está deshabilitado. Solo está disponible el entorno de demostración.",
    },
    "fr": {
        "not_enabledTitle": "Pas encore activé",
        "not_enabled": "Les connexions Tradovate ne sont pas encore activées. Réessayez bientôt.",
        "accounts_unavailableTitle": "Comptes indisponibles",
        "accounts_unavailable": "Nous n'avons pas pu lire vos comptes Tradovate pour le moment. C'est de notre côté — réessayez bientôt.",
        "no_accountsTitle": "Aucun compte trouvé",
        "no_accounts": "Cette connexion Tradovate n'a aucun compte. Contactez le support Tradovate.",
        "account_not_availableTitle": "Compte indisponible",
        "account_not_available": "Ce compte n'est plus disponible. Rechargez le panneau et réessayez.",
        "environment_not_allowedTitle": "Environnement désactivé",
        "environment_not_allowed": "Le trading réel est désactivé. Seul l'environnement démo est disponible.",
    },
    "de": {
        "not_enabledTitle": "Noch nicht aktiviert",
        "not_enabled": "Tradovate-Verbindungen sind noch nicht aktiviert. Bitte später erneut versuchen.",
        "accounts_unavailableTitle": "Konten nicht verfügbar",
        "accounts_unavailable": "Ihre Tradovate-Konten konnten gerade nicht gelesen werden. Das liegt bei uns — bitte kurz erneut versuchen.",
        "no_accountsTitle": "Keine Konten gefunden",
        "no_accounts": "Dieser Tradovate-Login hat keine Konten. Wenden Sie sich an den Tradovate-Support.",
        "account_not_availableTitle": "Konto nicht verfügbar",
        "account_not_available": "Dieses Konto ist nicht mehr verfügbar. Panel neu laden und erneut versuchen.",
        "environment_not_allowedTitle": "Umgebung deaktiviert",
        "environment_not_allowed": "Der echte Handel ist deaktiviert. Nur die Demo-Umgebung ist verfügbar.",
    },
    "ru": {
        "not_enabledTitle": "Ещё не включено",
        "not_enabled": "Подключения к Tradovate ещё не включены. Попробуйте позже.",
        "accounts_unavailableTitle": "Счета недоступны",
        "accounts_unavailable": "Не удалось прочитать ваши счета Tradovate сейчас. Это на нашей стороне — попробуйте вскоре снова.",
        "no_accountsTitle": "Счета не найдены",
        "no_accounts": "У этого логина Tradovate нет счетов. Обратитесь в поддержку Tradovate.",
        "account_not_availableTitle": "Счёт недоступен",
        "account_not_available": "Этот счёт больше недоступен. Перезагрузите панель и попробуйте снова.",
        "environment_not_allowedTitle": "Среда отключена",
        "environment_not_allowed": "Реальная торговля отключена. Доступна только демо-среда.",
    },
    "zh": {
        "not_enabledTitle": "尚未启用",
        "not_enabled": "Tradovate 连接尚未启用。请稍后再试。",
        "accounts_unavailableTitle": "账户不可用",
        "accounts_unavailable": "目前无法读取您的 Tradovate 账户。这是我们这边的问题——请稍后重试。",
        "no_accountsTitle": "未找到账户",
        "no_accounts": "此 Tradovate 登录没有任何账户。请联系 Tradovate 支持。",
        "account_not_availableTitle": "账户不可用",
        "account_not_available": "该账户已不可用。请重新加载面板后重试。",
        "environment_not_allowedTitle": "环境已禁用",
        "environment_not_allowed": "实盘交易已禁用。仅可使用模拟环境。",
    },
    "ja": {
        "not_enabledTitle": "まだ有効化されていません",
        "not_enabled": "Tradovate 接続はまだ有効化されていません。しばらくしてからお試しください。",
        "accounts_unavailableTitle": "口座を取得できません",
        "accounts_unavailable": "現在、Tradovate 口座を読み取れませんでした。こちら側の問題です。しばらくしてから再試行してください。",
        "no_accountsTitle": "口座が見つかりません",
        "no_accounts": "この Tradovate ログインには口座がありません。Tradovate サポートにお問い合わせください。",
        "account_not_availableTitle": "口座を利用できません",
        "account_not_available": "その口座は利用できなくなりました。パネルを再読み込みして再試行してください。",
        "environment_not_allowedTitle": "環境が無効です",
        "environment_not_allowed": "実取引は無効です。利用できるのはデモ環境のみです。",
    },
    "ar": {
        "not_enabledTitle": "لم يتم التفعيل بعد",
        "not_enabled": "لم يتم تفعيل اتصالات Tradovate بعد. يرجى المحاولة مرة أخرى قريبًا.",
        "accounts_unavailableTitle": "الحسابات غير متاحة",
        "accounts_unavailable": "تعذّر قراءة حساباتك في Tradovate الآن. هذا من جانبنا — يرجى المحاولة مرة أخرى قريبًا.",
        "no_accountsTitle": "لا توجد حسابات",
        "no_accounts": "لا يملك تسجيل الدخول هذا في Tradovate أي حسابات. تواصل مع دعم Tradovate.",
        "account_not_availableTitle": "الحساب غير متاح",
        "account_not_available": "هذا الحساب لم يعد متاحًا. أعد تحميل اللوحة وحاول مرة أخرى.",
        "environment_not_allowedTitle": "البيئة معطّلة",
        "environment_not_allowed": "التداول الحقيقي معطّل. تتوفر بيئة التجريبي فقط.",
    },
    "he": {
        "not_enabledTitle": "טרם הופעל",
        "not_enabled": "חיבורי Tradovate טרם הופעלו. נסו שוב בקרוב.",
        "accounts_unavailableTitle": "חשבונות אינם זמינים",
        "accounts_unavailable": "לא הצלחנו לקרוא את חשבונות ה-Tradovate שלך כעת. זה מצידנו — נסו שוב בקרוב.",
        "no_accountsTitle": "לא נמצאו חשבונות",
        "no_accounts": "לכניסה זו ל-Tradovate אין חשבונות. פנו לתמיכת Tradovate.",
        "account_not_availableTitle": "חשבון אינו זמין",
        "account_not_available": "החשבון הזה כבר אינו זמין. רעננו את הלוח ונסו שוב.",
        "environment_not_allowedTitle": "הסביבה מושבתת",
        "environment_not_allowed": "מסחר אמיתי מושבת. רק סביבת הדמו זמינה.",
    },
}


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


src = open(PATH, encoding="utf-8").read()

for loc in LOCALES:
    marker = f"const {loc}Translation = "
    start = src.index(marker)
    ct = src.index("connectTradovate: {", start)
    err = src.index("errors: {", ct)

    # Top-level keys: insert before the first `usernameLabel:` after connectTradovate.
    anchor_top = src.index("usernameLabel:", ct)
    lines = []
    for k, v in TOP[loc].items():
        if re.search(rf"\b{k}:", src[ct:err]):
            continue
        lines.append(f'    {k}: "{esc(v)}",')
    if lines:
        block = "\n".join(lines) + "\n"
        src = src[:anchor_top] + block + src[anchor_top:]

    # Error keys: re-locate offsets, insert before `unavailable:` inside errors.
    ct2 = src.index("connectTradovate: {", src.index(marker))
    err2 = src.index("errors: {", ct2)
    anchor_err = src.index("\n      unavailable:", err2)
    elines = []
    for k, v in ERR[loc].items():
        if re.search(rf"\b{k}:", src[err2:anchor_err]):
            continue
        elines.append(f'      {k}: "{esc(v)}",')
    if elines:
        eblock = "\n".join(elines) + "\n"
        src = src[:anchor_err] + eblock + src[anchor_err:]

open(PATH, "w", encoding="utf-8").write(src)
print("done")
