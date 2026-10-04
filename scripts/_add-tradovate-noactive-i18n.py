#!/usr/bin/env python3
"""Add the no_active_account i18n keys to all 11 locales (idempotent)."""
import re

PATH = "src/i18n.ts"
LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]
V = {
    "en": ("No active account", "None of your Tradovate accounts are active. Contact Tradovate support."),
    "pt": ("Nenhuma conta ativa", "Nenhuma das suas contas Tradovate está ativa. Contacte o suporte da Tradovate."),
    "it": ("Nessun account attivo", "Nessuno dei tuoi account Tradovate è attivo. Contatta il supporto Tradovate."),
    "es": ("Ninguna cuenta activa", "Ninguna de tus cuentas de Tradovate está activa. Contacta con el soporte de Tradovate."),
    "fr": ("Aucun compte actif", "Aucun de vos comptes Tradovate n'est actif. Contactez le support Tradovate."),
    "de": ("Kein aktives Konto", "Keines Ihrer Tradovate-Konten ist aktiv. Wenden Sie sich an den Tradovate-Support."),
    "ru": ("Нет активного счёта", "Ни один из ваших счетов Tradovate не активен. Обратитесь в поддержку Tradovate."),
    "zh": ("没有活跃账户", "您的 Tradovate 账户均未激活。请联系 Tradovate 支持。"),
    "ja": ("有効な口座がありません", "Tradovate 口座がいずれも有効ではありません。Tradovate サポートにお問い合わせください。"),
    "ar": ("لا يوجد حساب نشط", "لا يوجد أي من حساباتك في Tradovate نشط. تواصل مع دعم Tradovate."),
    "he": ("אין חשבון פעיל", "אף אחד מחשבונות ה-Tradovate שלך אינו פעיל. פנו לתמיכת Tradovate."),
}


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


src = open(PATH, encoding="utf-8").read()
for loc in LOCALES:
    marker = f"const {loc}Translation = "
    ct = src.index("connectTradovate: {", src.index(marker))
    err = src.index("errors: {", ct)
    anchor = src.index("\n      unavailable:", err)
    seg = src[err:anchor]
    title, body = V[loc]
    lines = []
    if not re.search(r"\bno_active_accountTitle:", seg):
        lines.append(f'      no_active_accountTitle: "{esc(title)}",')
    if not re.search(r"\bno_active_account:", seg):
        lines.append(f'      no_active_account: "{esc(body)}",')
    if lines:
        src = src[:anchor] + "\n".join(lines) + "\n" + src[anchor:]
open(PATH, "w", encoding="utf-8").write(src)
print("ok")
