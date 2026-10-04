#!/usr/bin/env node
/**
 * i18n integrity gate.
 *
 * Fails when any locale is missing keys present in the English source, when a
 * locale has orphaned keys, or when any translated value is an empty string.
 * Exits non-zero so it can be wired into CI or run before a deploy.
 *
 * Usage: node scripts/check-i18n.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const source = readFileSync(resolve(root, 'src/i18n.ts'), 'utf8');

// Extract each `const <loc>Translation = { ... };` object as JSON.
function extractLocale(code) {
  const start = source.indexOf(`const ${code}Translation = `);
  if (start === -1) throw new Error(`locale ${code} not found in src/i18n.ts`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  let end = -1;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inString = true; quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  const literal = source.slice(braceStart, end + 1);
  // The locale objects are JS object literals (unquoted keys, trailing commas),
  // so evaluate them rather than JSON.parse.
  return Function(`"use strict"; return (${literal});`)();
}

const LOCALES = ['en', 'pt', 'it', 'es', 'fr', 'de', 'ru', 'zh', 'ja', 'ar', 'he'];

// CLDR plural categories per locale (must match Intl.PluralRules). A
// count-interpolated key is stored as `<key>_<category>`; the gate checks that
// every locale carries exactly the categories its language uses.
const PLURAL_CATS = {
  en: ['one', 'other'],
  pt: ['one', 'many', 'other'],
  it: ['one', 'many', 'other'],
  es: ['one', 'many', 'other'],
  fr: ['one', 'many', 'other'],
  de: ['one', 'other'],
  ru: ['one', 'few', 'many', 'other'],
  zh: ['other'],
  ja: ['other'],
  ar: ['zero', 'one', 'two', 'few', 'many', 'other'],
  he: ['one', 'two', 'other'],
};
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else if (Array.isArray(v)) v.forEach((item, i) => flatten({ [i]: item }, key, out));
    else out[key] = v;
  }
  return out;
}

const flat = {};
for (const loc of LOCALES) flat[loc] = flatten(extractLocale(loc));

// Keep the raw maps (plural-family keys included) for the plural validation.
const original = {};
for (const loc of LOCALES) original[loc] = { ...flat[loc] };

// Keys that are plural-family members (`<base>_<category>`) are compared per
// locale against that locale's CLDR categories, not against English. Strip them
// from the flat maps before the cross-locale key diff.
function pluralBases(loc) {
  const bases = new Set();
  for (const k of Object.keys(original[loc])) {
    const m = PLURAL_SUFFIX.exec(k);
    if (m) bases.add(k.slice(0, -m[0].length));
  }
  return bases;
}
for (const loc of LOCALES) {
  for (const k of Object.keys(flat[loc])) {
    if (PLURAL_SUFFIX.test(k)) delete flat[loc][k];
  }
}

// Validate each locale's plural family: exactly its CLDR categories, and each
// form may only reference `{{count}}` (no stray placeholders).
function pluralIssues(loc) {
  const cats = PLURAL_CATS[loc];
  const src = original[loc];
  const issues = [];
  for (const base of pluralBases(loc)) {
    for (const cat of cats) {
      const key = `${base}_${cat}`;
      if (!(key in src)) {
        issues.push(`${key} (missing)`);
        continue;
      }
      for (const p of placeholdersOf(src[key])) {
        if (p !== 'count') issues.push(`${key} (unknown {{${p}}})`);
      }
    }
    for (const k of Object.keys(src)) {
      const m = PLURAL_SUFFIX.exec(k);
      if (m && k.slice(0, -m[0].length) === base && !cats.includes(m[1])) {
        issues.push(`${k} (not a ${loc} category)`);
      }
    }
  }
  return issues;
}

const enKeys = new Set(Object.keys(flat.en));
let failed = false;

// Keys that legitimately stay identical to English in every locale: brand /
// proper nouns, ISO codes and crypto tickers.
const INVARIANT = /^(about\.team\.\d+\.(name|photo)|dashboard\.assetsList|checkout\.cryptoLabel|contactEmail\.(newSubmission|name|email|subject|message|sentFrom))$/;

const interp = /\{\{\s*([^}\s]+)\s*\}\}/g;
const placeholdersOf = (s) => new Set([...s.matchAll(interp)].map((m) => m[1]));

for (const loc of LOCALES) {
  const keys = new Set(Object.keys(flat[loc]));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  const empty = Object.entries(flat[loc])
    .filter(([, v]) => typeof v === 'string' && v.trim() === '')
    .map(([k]) => k);

  // A translated string must keep exactly the placeholders of the source
  // string, otherwise interpolation silently breaks at runtime.
  const interpIssues = [];
  for (const [k, en] of Object.entries(flat.en)) {
    const value = flat[loc][k];
    if (typeof en !== 'string' || typeof value !== 'string') continue;
    const a = placeholdersOf(en);
    const b = placeholdersOf(value);
    if (a.size !== b.size || [...a].some((x) => !b.has(x))) {
      interpIssues.push(`${k} (en:${[...a].join(',') || '-'} ${loc}:${[...b].join(',') || '-'})`);
    }
  }

  if (missing.length || extra.length || empty.length || interpIssues.length) failed = true;
  const plural = pluralIssues(loc);
  if (plural.length) failed = true;
  console.log(
    `${loc}: keys=${keys.size} missing=${missing.length} extra=${extra.length} empty=${empty.length} interp=${interpIssues.length} plural=${plural.length}`,
  );
  if (missing.length) console.log(`   MISSING: ${missing.slice(0, 20).join(', ')}`);
  if (extra.length) console.log(`   EXTRA:   ${extra.slice(0, 20).join(', ')}`);
  if (empty.length) console.log(`   EMPTY:   ${empty.slice(0, 20).join(', ')}`);
  if (interpIssues.length) console.log(`   INTERP:  ${interpIssues.slice(0, 20).join(', ')}`);
  if (plural.length) console.log(`   PLURAL:  ${plural.slice(0, 20).join(', ')}`);
}

// Informational: values still byte-identical to English (may be intentional for
// proper nouns / codes).
const untranslated = {};
for (const loc of LOCALES.filter((l) => l !== 'en')) {
  untranslated[loc] = Object.entries(flat.en)
    .filter(([k, v]) => typeof v === 'string' && v.trim().length > 3 && flat[loc][k] === v && !INVARIANT.test(k))
    .map(([k]) => k);
}
const totalUntranslated = Object.values(untranslated).reduce((n, l) => n + l.length, 0);
console.log(`\nidentical-to-EN values (informational): ${totalUntranslated}`);
for (const [loc, keys] of Object.entries(untranslated)) {
  if (keys.length) console.log(`   ${loc}: ${keys.join(', ')}`);
}

if (failed) {
  console.error('\ni18n check FAILED');
  process.exit(1);
}
console.log('\ni18n check passed');
