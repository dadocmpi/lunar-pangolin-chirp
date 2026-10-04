#!/usr/bin/env python3
"""Insert new flat keys into every locale object in src/i18n.ts.

Usage: edit ANCHOR + KEYS below, then `python3 scripts/_add-kyc-i18n.py`.
Each KEYS entry is {locale: value}; the key name is the dict key of KEYS.
Values are inserted right after the ANCHOR line inside each locale block.
Idempotent: skips a key that already exists in that locale block.
"""
import re
import sys
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "src" / "i18n.ts"
ANCHOR = "    verifiedAccount: "
KEYS = {
    "gravity": {},
}

LOCALE_ORDER = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

src = PATH.read_text(encoding="utf-8")
lines = src.split("\n")

# Find the start line of each locale block.
starts = []
for loc in LOCALE_ORDER:
    needle = f"const {loc}Translation = "
    idx = next((i for i, l in enumerate(lines) if l.startswith(needle)), -1)
    if idx < 0:
        sys.exit(f"locale {loc} not found")
    starts.append((loc, idx))

# Process from the bottom up so earlier line indices stay valid.
added = 0
for loc, start in reversed(starts):
    next_start = next((s for l, s in starts if s > start), len(lines))
    for k, values in KEYS.items():
        val = values[loc].replace("\\", "\\\\").replace('"', '\\"')
        if any(re.match(rf"\s*{k}:", lines[i]) for i in range(start, next_start)):
            continue
        anchor = next(
            (i for i in range(start, next_start) if lines[i].startswith(ANCHOR)),
            None,
        )
        if anchor is None:
            sys.exit(f"anchor not found in locale {loc}")
        lines.insert(anchor + 1, f'    {k}: "{val}",')
        added += 1
        next_start += 1

PATH.write_text("\n".join(lines), encoding="utf-8")
print(f"inserted {added} key(s) across {len(LOCALE_ORDER)} locales")
