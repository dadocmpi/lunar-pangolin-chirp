#!/usr/bin/env python3
"""Insert the AI-KYC name-field strings into every locale's `withdrawal`
namespace in src/i18n.ts. Idempotent. Run:
    python3 scripts/_add-ai-kyc-i18n.py
"""
import sys
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "src" / "i18n.ts"
LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

STRINGS = {
    "en": ("Full legal name", "As printed on your ID", "Enter the full name exactly as it appears on your document so we can verify it."),
    "pt": ("Nome completo legal", "Como impresso no documento", "Introduza o nome completo exatamente como aparece no documento para podermos verificá-lo."),
    "it": ("Nome legale completo", "Come stampato sul documento", "Inserisci il nome completo esattamente come appare sul documento per poterlo verificare."),
    "es": ("Nombre legal completo", "Como aparece en el documento", "Introduce el nombre completo exactamente como aparece en el documento para poder verificarlo."),
    "fr": ("Nom légal complet", "Comme imprimé sur la pièce", "Saisissez le nom complet exactement comme il figure sur le document afin que nous puissions le vérifier."),
    "de": ("Vollständiger gesetzlicher Name", "Wie auf dem Ausweis", "Gib den vollständigen Namen genau so ein, wie er auf dem Dokument steht, damit wir ihn prüfen können."),
    "ru": ("Полное законное имя", "Как в документе", "Введите полное имя точно так, как оно указано в документе, чтобы мы могли его проверить."),
    "zh": ("法定全名", "与证件上一致", "请按照证件上的内容准确输入全名，以便我们进行核验。"),
    "ja": ("正式氏名", "書類に記載のとおり", "書類に記載されているとおりに氏名を正確に入力してください。確認いたします。"),
    "ar": ("الاسم القانوني الكامل", "كما هو مطبوع في المستند", "أدخل الاسم الكامل تمامًا كما يظهر في مستندك لنتمكن من التحقق منه."),
    "he": ("שם חוקי מלא", "כפי שמופיע במסמך", "הזן את השם המלא בדיוק כפי שהוא מופיע במסמך כדי שנוכל לאמת אותו."),
}

KEY_REQUIRED = "fullNameRequired"
KEY_LABEL = "fullNameLabel"
KEY_PLACEHOLDER = "fullNamePlaceholder"
KEY_HINT = "fullNameHint"

REQ = {
    "en": "Enter your full legal name as printed on your ID.",
    "pt": "Introduza o seu nome completo legal como impresso no documento.",
    "it": "Inserisci il tuo nome legale completo come stampato sul documento.",
    "es": "Introduce tu nombre legal completo como aparece en el documento.",
    "fr": "Saisissez votre nom légal complet tel qu'il figure sur la pièce d'identité.",
    "de": "Gib deinen vollständigen gesetzlichen Namen wie auf dem Ausweis ein.",
    "ru": "Введите полное законное имя, как в документе.",
    "zh": "请输入与证件一致的法定全名。",
    "ja": "書類に記載されている正式な氏名を入力してください。",
    "ar": "أدخل اسمك القانوني الكامل كما يظهر في المستند.",
    "he": "הזן את שמך החוקי המלא כפי שמופיע במסמך.",
}


def main() -> None:
    lines = PATH.read_text(encoding="utf-8").splitlines()
    # Only insert after the FIRST frontRequired in each locale block (the key
    # appears once per locale here, so occurrence i corresponds to locale i).
    for i, loc in enumerate(LOCALES):
        label, placeholder, hint = STRINGS[loc]
        new = [
            f'      {KEY_REQUIRED}: "{REQ[loc]}",',
            f'      {KEY_LABEL}: "{label}",',
            f'      {KEY_PLACEHOLDER}: "{placeholder}",',
            f'      {KEY_HINT}: "{hint}",',
        ]
        lines = _insert_after_nth(lines, "      frontRequired:", i, new, KEY_REQUIRED)
    PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"inserted AI-KYC name keys into {len(LOCALES)} locale(s)")


def _insert_after_nth(lines, anchor, n, new_lines, marker):
    count = -1
    for idx, line in enumerate(lines):
        if line.startswith(anchor):
            count += 1
            if count == n:
                if any(marker in l for l in lines[idx: idx + 6]):
                    return lines
                return lines[: idx + 1] + new_lines + lines[idx + 1 :]
    sys.exit(f"anchor {anchor!r} occurrence {n} not found")


if __name__ == "__main__":
    main()
