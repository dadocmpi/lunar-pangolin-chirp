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

const enKeys = new Set(Object.keys(flat.en));
let failed = false;

for (const loc of LOCALES) {
  const keys = new Set(Object.keys(flat[loc]));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  const empty = Object.entries(flat[loc])
    .filter(([, v]) => typeof v === 'string' && v.trim() === '')
    .map(([k]) => k);

  if (missing.length || extra.length || empty.length) failed = true;
  console.log(
    `${loc}: keys=${keys.size} missing=${missing.length} extra=${extra.length} empty=${empty.length}`,
  );
  if (missing.length) console.log(`   MISSING: ${missing.slice(0, 20).join(', ')}`);
  if (extra.length) console.log(`   EXTRA:   ${extra.slice(0, 20).join(', ')}`);
  if (empty.length) console.log(`   EMPTY:   ${empty.slice(0, 20).join(', ')}`);
}

if (failed) {
  console.error('\ni18n check FAILED');
  process.exit(1);
}
console.log('\ni18n check passed');
