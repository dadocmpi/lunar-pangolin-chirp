// Headless proof that the dashboard opens without a KYC gate and shows the
// "Log in on Tradovate" CTA. Point BASE_URL at a served build (local preview or
// a public deployment); a Vercel *preview* URL needs deployment-protection auth.
// Run: node scripts/screenshot-dashboard.mjs

import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4321";
const SUPABASE = "http://127.0.0.1:9999";
const OUT_DIR = process.env.OUT_DIR || new URL("../docs/assets/", import.meta.url).pathname;

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "mock.audit@braxelmarkets.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Mock Audit User" },
  app_metadata: { provider: "email" },
  created_at: "2026-01-01T00:00:00Z",
};
const SESSION = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "mock-refresh-token",
  user: USER,
};

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "content-range",
};

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

const consoleErrors = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

// Seed the Supabase session BEFORE any app code runs.
await page.evaluateOnNewDocument((session) => {
  try {
    localStorage.setItem("braxel-auth-session", JSON.stringify(session));
  } catch {}
}, SESSION);

// Serve every Supabase call from the mock. No real backend, no credentials.
await page.setRequestInterception(true);
page.on("request", async (req) => {
  const url = req.url();
  if (!url.startsWith(SUPABASE)) return req.continue();
  if (req.method() === "OPTIONS") {
    return req.respond({ status: 204, headers: jsonHeaders, body: "" });
  }
  const u = url.replace(SUPABASE, "");
  const body = (obj, status = 200) =>
    req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });

  if (u.startsWith("/auth/v1/user")) return body(USER);
  if (u.startsWith("/auth/v1/token")) return body(SESSION);
  if (u.startsWith("/auth/v1/logout")) return req.respond({ status: 204, body: "" });
  if (u.startsWith("/rest/v1/services")) return body([]);
  if (u.startsWith("/rest/v1/profiles")) {
    // Mocked user has NO KYC submission: kyc_status is null / not submitted.
    return body([{ id: USER.id, first_name: "Mock", last_name: "Audit", kyc_status: null }]);
  }
  if (u.startsWith("/rest/v1/kyc_submissions")) return body([]); // no submissions
  if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
  if (u.startsWith("/rest/v1/trades")) return body([]); // no real trades -> empty state
  if (u.startsWith("/functions/v1/tradovate-status")) return body({ integrations: [] });
  return body({});
});

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
// Give React Query / effects a moment to settle.
await new Promise((r) => setTimeout(r, 2500));

const text = await page.evaluate(() => document.body.innerText);
const hasVerificationRequired = /verification required|verificação necessária|verifica richiesta|verification requise|verificación requerida/i.test(text);
const hasLogInOnTradovate = /Log in on Tradovate/i.test(text);

// Prove the CTA is real, visible and clickable (not behind a full-screen overlay).
const btnInfo = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  const b = btns.find((el) => /log in on tradovate/i.test(el.textContent || ""));
  if (!b) return { found: false };
  b.scrollIntoView({ block: "center" });
  const r = b.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const top = document.elementFromPoint(cx, cy);
  // The element actually receiving the click at the button centre.
  const hit = top?.closest("button");
  return {
    found: true,
    visible: r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== "hidden",
    hitIsTheButton: hit === b,
    text: (b.textContent || "").trim(),
  };
});

// Is anything rendering a full-screen blocking overlay?
const overlay = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div,section"));
  return all.some((el) => {
    const s = getComputedStyle(el);
    if (s.position !== "fixed") return false;
    if (s.display === "none" || s.visibility === "hidden" || s.pointerEvents === "none") return false;
    const r = el.getBoundingClientRect();
    return r.width >= window.innerWidth * 0.95 && r.height >= window.innerHeight * 0.95;
  });
});

fs.mkdirSync(OUT_DIR, { recursive: true });
await page.screenshot({ path: `${OUT_DIR}/dashboard-mock-user.png`, fullPage: true });
await page.evaluate(() => window.scrollTo(0, 0));
const cardBox = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((el) =>
    /log in on tradovate/i.test(el.textContent || ""),
  );
  if (!b) return null;
  const card = b.closest("div.border") || b.parentElement;
  b.scrollIntoView({ block: "center" });
  const r = (card || b).getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
if (cardBox) {
  await page.screenshot({
    path: `${OUT_DIR}/tradovate-card-mock-user.png`,
    clip: cardBox,
  });
}

// ---------------------------------------------------------------------------
// No-invented-numbers proof: a real user with no services and no closed trades
// must see the empty state, never +12.4% / -2.1% / a $-axis growth chart.
// ---------------------------------------------------------------------------
const hasNoDataYet = /no performance data yet/i.test(text);
const hasInventedProfit = /\+12\.4%|-2\.1%|-4\.2%|\$25,000/.test(text);
console.log("emptyStateShown:", hasNoDataYet);
console.log("inventedFiguresShown:", hasInventedProfit);
await page.screenshot({ path: `${OUT_DIR}/dashboard-no-data-empty-state.png`, fullPage: true });

// ---------------------------------------------------------------------------
// LIVE ACCOUNT badge: it must appear ONLY after an account is connected.
// Re-run the dashboard with a mocked connected integration.
// ---------------------------------------------------------------------------
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page2.evaluateOnNewDocument((session) => {
  try {
    localStorage.setItem("braxel-auth-session", JSON.stringify(session));
  } catch {}
}, SESSION);
await page2.setRequestInterception(true);
page2.on("request", async (req) => {
  const url = req.url();
  if (!url.startsWith(SUPABASE)) return req.continue();
  if (req.method() === "OPTIONS") return req.respond({ status: 204, headers: jsonHeaders, body: "" });
  const u = url.replace(SUPABASE, "");
  const body = (obj, status = 200) =>
    req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });
  if (u.startsWith("/auth/v1/user")) return body(USER);
  if (u.startsWith("/auth/v1/token")) return body(SESSION);
  if (u.startsWith("/auth/v1/logout")) return req.respond({ status: 204, body: "" });
  if (u.startsWith("/rest/v1/services")) return body([]);
  if (u.startsWith("/rest/v1/profiles")) return body([{ id: USER.id, first_name: "Mock", last_name: "Audit", kyc_status: null }]);
  if (u.startsWith("/rest/v1/kyc_submissions")) return body([]);
  if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
  if (u.startsWith("/rest/v1/trades")) return body([]);
  if (u.startsWith("/functions/v1/tradovate-status")) {
    return body({
      enabled: true,
      welcome: { show: false, skipped: true },
      integrations: [
        {
          id: "22222222-2222-2222-2222-222222222222",
          environment: "live",
          accountId: 987654,
          accountSpec: "DEMO-ACCT",
          label: "Demo Funded",
          status: "connected",
          lastFillId: 0,
          tokenExpiresAt: null,
        },
      ],
    });
  }
  return body({});
});
await page2.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));
const text2 = await page2.evaluate(() => document.body.innerText);
const liveBadgeOnConnected = /LIVE ACCOUNT/.test(text2);
// On the empty (first) page there must be NO live badge.
const liveBadgeOnEmpty = /LIVE ACCOUNT/.test(text);
console.log("liveBadgeOnConnected:", liveBadgeOnConnected);
console.log("liveBadgeOnEmpty:", liveBadgeOnEmpty);
await page2.screenshot({ path: `${OUT_DIR}/tradovate-live-account-badge.png`, fullPage: true });

console.log("OUT", `${OUT_DIR}/dashboard-mock-user.png`);
console.log("hasVerificationRequired:", hasVerificationRequired);
console.log("hasLogInOnTradovate:", hasLogInOnTradovate);
console.log("cta:", JSON.stringify(btnInfo));
console.log("fullScreenBlockingOverlay:", overlay);
console.log("consoleErrors:", JSON.stringify(consoleErrors.slice(0, 6), null, 2));

await browser.close();
