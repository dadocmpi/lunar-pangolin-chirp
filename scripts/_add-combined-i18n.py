#!/usr/bin/env python3
"""Insert the combined-branch KYC/Tradovate dashboard strings into every locale
in src/i18n.ts. Idempotent. Run: python3 scripts/_add-combined-i18n.py
"""
import sys
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "src" / "i18n.ts"
LOCALE_ORDER = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

# line inserted immediately after the `accountStandard:` line of each locale
DASH = {
    "en": ('kycBadgeRequired', "KYC required"),
    "pt": ('kycBadgeRequired', "KYC necessário"),
    "it": ('kycBadgeRequired', "KYC richiesto"),
    "es": ('kycBadgeRequired', "KYC requerido"),
    "fr": ('kycBadgeRequired', "KYC requis"),
    "de": ('kycBadgeRequired', "KYC erforderlich"),
    "ru": ('kycBadgeRequired', "Требуется KYC"),
    "zh": ('kycBadgeRequired', "需要 KYC"),
    "ja": ('kycBadgeRequired', "KYCが必要です"),
    "ar": ('kycBadgeRequired', "مطلوب التحقق (KYC)"),
    "he": ('kycBadgeRequired', "נדרש KYC"),
}
DASH_HINT = {
    "en": "You can use the terminal freely. Identity verification is only required when you request a withdrawal.",
    "pt": "Pode usar o terminal livremente. A verificação de identidade só é necessária ao solicitar um levantamento.",
    "it": "Puoi usare la piattaforma liberamente. La verifica dell'identità è richiesta solo quando richiedi un prelievo.",
    "es": "Puedes usar la plataforma libremente. La verificación de identidad solo se requiere al solicitar un retiro.",
    "fr": "Vous pouvez utiliser la plateforme librement. La vérification d'identité n'est requise que lors d'une demande de retrait.",
    "de": "Du kannst die Plattform frei nutzen. Die Identitätsprüfung ist nur bei einer Auszahlung erforderlich.",
    "ru": "Вы можете свободно пользоваться платформой. Верификация требуется только при выводе средств.",
    "zh": "您可以自由使用平台。仅在申请提现时需要身份验证。",
    "ja": "プラットフォームは自由にご利用いただけます。本人確認が必要になるのは出金を申請するときだけです。",
    "ar": "يمكنك استخدام المنصة بحرية. التحقق من الهوية مطلوب فقط عند طلب السحب.",
    "he": "אתה יכול להשתמש בפלטפורמה בחופשיות. אימות זהות נדרש רק בעת בקשת משיכה.",
}
# line inserted immediately after the `emptyHint:` line of each locale
TRAD = {
    "en": ("Tradovate account connected", "Braxel is reading your fills and reconstructing your performance. Manage or disconnect at any time."),
    "pt": ("Conta Tradovate ligada", "A Braxel está a ler as suas execuções e a reconstruir o seu desempenho. Faça a gestão ou desligue a qualquer momento."),
    "it": ("Account Tradovate collegato", "Braxel sta leggendo le tue esecuzioni e ricostruendo le tue performance. Gestisci o scollega in qualsiasi momento."),
    "es": ("Cuenta de Tradovate conectada", "Braxel está leyendo tus ejecuciones y reconstruyendo tu rendimiento. Gestiona o desconecta en cualquier momento."),
    "fr": ("Compte Tradovate connecté", "Braxel lit vos exécutions et reconstitue vos performances. Gérez ou déconnectez à tout moment."),
    "de": ("Tradovate-Konto verbunden", "Braxel liest deine Ausführungen und rekonstruiert deine Performance. Jederzeit verwalten oder trennen."),
    "ru": ("Аккаунт Tradovate подключён", "Braxel читает ваши сделки и восстанавливает результаты. Управляйте подключением или отключайте в любое время."),
    "zh": ("Tradovate 账户已连接", "Braxel 正在读取您的成交并重建业绩。可随时管理或断开连接。"),
    "ja": ("Tradovateアカウントを接続しました", "Braxelが約定を読み取り、パフォーマンスを再構築しています。いつでも管理または切断できます。"),
    "ar": ("تم ربط حساب Tradovate", "يقوم Braxel بقراءة تنفيذاتك وإعادة بناء أدائك. يمكنك الإدارة أو الفصل في أي وقت."),
    "he": ("חשבון Tradovate מחובר", "Braxel קורא את הביצועים שלך ומשחזר את הביצועים. ניתן לנהל או לנתק בכל עת."),
}


def main() -> None:
    lines = PATH.read_text(encoding="utf-8").splitlines()
    # Locate the start line of each locale's block by the `en:`/`pt:`/... keys
    # is hard; instead insert after anchors but only within each locale region.
    # We insert after the Nth occurrence of each anchor, N = locale index+1.
    for i, loc in enumerate(LOCALE_ORDER):
        key, val = DASH[loc]
        hint = DASH_HINT[loc]
        trad_title, trad_body = TRAD[loc]
        new_lines = [
            f'    {key}: "{val}",',
            f'    kycBannerHint: "{hint}",',
        ]
        lines = _insert_after_nth(lines, "    accountStandard:", i, new_lines)
        trad_new = [
            f'    cardConnectedTitle: "{trad_title}",',
            f'    cardConnectedBody: "{trad_body}",',
        ]
        lines = _insert_after_nth(lines, "    emptyHint:", i, trad_new)
    PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"inserted combined i18n keys into {len(LOCALE_ORDER)} locale(s)")


def _insert_after_nth(lines, anchor, n, new_lines):
    count = -1
    for idx, line in enumerate(lines):
        if line.startswith(anchor):
            count += 1
            if count == n:
                if any(new_lines[0].split(":")[0] in l for l in lines[max(0, idx - 3):idx + 6]):
                    return lines
                return lines[: idx + 1] + new_lines + lines[idx + 1 :]
    sys.exit(f"anchor {anchor!r} occurrence {n} not found")


if __name__ == "__main__":
    main()
