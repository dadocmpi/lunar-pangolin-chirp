// ============================================================================
// check-no-hardcoded-text — gate against hardcoded user-facing text.
//
// Part 3 of the dashboard overhaul requires that no user-facing string is
// hardcoded in a dashboard/terminal component; every label goes through
// i18next. This gate scans the dashboard surface (terminal components, the
// connect panel, the KYC banner/gate, the dashboard page) for JSX text nodes
// and user-facing attributes (title/placeholder/aria-label/alt) that are
// literal strings instead of `t(...)` calls.
//
// It is intentionally conservative: only obvious literals are flagged, so it
// stays a useful signal rather than a wall of false positives. Run with
// `npm run check:no-hardcoded`.
// ============================================================================

import fs from 'fs';
import path from 'path';

const TARGETS = [
  'src/components/terminal',
  'src/components/TradovateConnectPanel.tsx',
  'src/components/TradovateWelcome.tsx',
  'src/components/TradovateConnectCard.tsx',
  'src/components/KycReminderBanner.tsx',
  'src/components/WithdrawalKycGate.tsx',
  'src/pages/Dashboard.tsx',
];

// Attributes that render user-visible text.
const TEXT_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];

function walk(target, files) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const e of fs.readdirSync(target, { withFileTypes: true })) {
      walk(path.join(target, e.name), files);
    }
  } else if (/\.(tsx|jsx)$/.test(target)) {
    files.push(target);
  }
}

const files = [];
for (const t of TARGETS) walk(t, files);

const problems = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const n = i + 1;
    // Attribute: title="Some words" (not a {...} expression, not empty).
    for (const attr of TEXT_ATTRS) {
      const m = new RegExp(`${attr}="([^"]*[A-Za-z][^"]*)"`).exec(line);
      if (m && !/^\s*(\/\/|\*)/.test(line)) {
        problems.push(`${file}:${n}  ${attr}="${m[1]}"`);
      }
    }
    // JSX text node: >Some words< on a single line, excluding code.
    const text = />\s*([A-Z][A-Za-z][A-Za-z ,.'&%/()-]{2,})\s*</.exec(line);
    if (text && !/^\s*(\/\/|\*)/.test(line) && !line.includes('t(')) {
      problems.push(`${file}:${n}  text "${text[1].trim()}"`);
    }
  });
}

if (problems.length) {
  console.error('Hardcoded user-facing text found:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(`\ncheck-no-hardcoded-text FAILED (${problems.length})`);
  process.exit(1);
}
console.log(`check-no-hardcoded-text passed (${files.length} files scanned)`);
