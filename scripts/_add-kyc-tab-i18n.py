#!/usr/bin/env python3
"""Add the KYC tab + banner keys, merged into the EXISTING dashboard.kyc object.

Deep-merges so `dashboard.kyc.tabInfoTitle`, `dashboard.dismissBanner` etc. are
added without creating a second `kyc:` key. Idempotent.
"""
import io

PATH = "src/i18n.ts"
LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

DISMISS = {
    "en": "Dismiss reminder",
    "pt": "Dispensar lembrete",
    "it": "Ignora promemoria",
    "es": "Descartar recordatorio",
    "fr": "Ignorer le rappel",
    "de": "Erinnerung ausblenden",
    "ru": "Скрыть напоминание",
    "zh": "关闭提醒",
    "ja": "リマインダーを閉じる",
    "ar": "تجاهل التذكير",
    "he": "הסתר תזכורת",
}

KYC_KEYS = {
    "en": {
        "tabInfoTitle": "Identity verification",
        "tabInfoBody": "Identity verification is only required when you request a withdrawal. Until then, the terminal is fully usable without it. When you request a withdrawal, you will be asked for a document photo.",
        "goToWithdrawal": "Go to withdrawal",
    },
    "pt": {
        "tabInfoTitle": "Verificação de identidade",
        "tabInfoBody": "A verificação de identidade só é exigida quando você solicita um saque. Até lá, o terminal é totalmente utilizável sem ela. Ao solicitar um saque, será pedida uma foto do documento.",
        "goToWithdrawal": "Ir para saque",
    },
    "it": {
        "tabInfoTitle": "Verifica dell'identità",
        "tabInfoBody": "La verifica dell'identità è richiesta solo quando richiedi un prelievo. Fino ad allora il terminale è pienamente utilizzabile senza. Quando richiedi un prelievo, ti verrà chiesta la foto di un documento.",
        "goToWithdrawal": "Vai al prelievo",
    },
    "es": {
        "tabInfoTitle": "Verificación de identidad",
        "tabInfoBody": "La verificación de identidad solo es obligatoria cuando solicitas un retiro. Hasta entonces, el terminal es totalmente utilizable sin ella. Al solicitar un retiro, se te pedirá una foto del documento.",
        "goToWithdrawal": "Ir al retiro",
    },
    "fr": {
        "tabInfoTitle": "Vérification d'identité",
        "tabInfoBody": "La vérification d'identité n'est requise que lorsque vous demandez un retrait. D'ici là, le terminal est pleinement utilisable sans elle. Lors d'une demande de retrait, une photo d'un document vous sera demandée.",
        "goToWithdrawal": "Aller au retrait",
    },
    "de": {
        "tabInfoTitle": "Identitätsprüfung",
        "tabInfoBody": "Die Identitätsprüfung ist nur bei einer Auszahlungsanfrage erforderlich. Bis dahin ist das Terminal ohne sie voll nutzbar. Bei einer Auszahlungsanfrage werden Sie um ein Dokumentfoto gebeten.",
        "goToWithdrawal": "Zur Auszahlung",
    },
    "ru": {
        "tabInfoTitle": "Проверка личности",
        "tabInfoBody": "Проверка личности требуется только при запросе вывода средств. До этого терминал полностью доступен без неё. При запросе вывода потребуется фото документа.",
        "goToWithdrawal": "Перейти к выводу",
    },
    "zh": {
        "tabInfoTitle": "身份验证",
        "tabInfoBody": "仅当您申请提现时才需要身份验证。在此之前，无需验证即可完全使用本终端。申请提现时，系统会要求您提供证件照片。",
        "goToWithdrawal": "前往提现",
    },
    "ja": {
        "tabInfoTitle": "本人確認",
        "tabInfoBody": "本人確認が必要になるのは出金を申請するときだけです。それまでは本人確認なしでターミナルを完全に利用できます。出金申請時には身分証明書の写真が必要です。",
        "goToWithdrawal": "出金へ進む",
    },
    "ar": {
        "tabInfoTitle": "التحقق من الهوية",
        "tabInfoBody": "التحقق من الهوية مطلوب فقط عند طلب السحب. حتى ذلك الحين، تكون المنصة قابلة للاستخدام بالكامل بدونه. عند طلب السحب، سيُطلب منك صورة لوثيقة.",
        "goToWithdrawal": "الانتقال إلى السحب",
    },
    "he": {
        "tabInfoTitle": "אימות זהות",
        "tabInfoBody": "אימות זהות נדרש רק בעת בקשת משיכה. עד אז המסוף שמיש במלואו בלעדיו. בעת בקשת משיכה תתבקש לצרף צילום מסמך.",
        "goToWithdrawal": "מעבר למשיכה",
    },
}


def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()

    if '"goToWithdrawal"' in src:
        print("keys already present; nothing to do")
        return

    for loc in LOCALES:
        marker = "const %sTranslation = {" % loc
        start = src.index(marker)
        dash_idx = src.index("  dashboard: {", start)
        insert_at = dash_idx + len("  dashboard: {")
        src = src[:insert_at] + '\n    dismissBanner: "%s",' % DISMISS[loc] + src[insert_at:]

        start = src.index(marker)
        kyc_idx = src.index("    kyc: {", start)
        insert_at = kyc_idx + len("    kyc: {")
        lines = "".join(
            '\n      %s: "%s",' % (k, v.replace('"', '\\"'))
            for k, v in KYC_KEYS[loc].items()
        )
        src = src[:insert_at] + lines + src[insert_at:]

    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print("merged KYC tab + banner keys into dashboard.kyc for all 11 locales")


if __name__ == "__main__":
    main()
