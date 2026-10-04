// Headless proof of the first-run Tradovate welcome screen (SOFT gate).
//
// Serves a build (BASE_URL), mocks a logged-in user and the Supabase Edge
// Functions, and captures:
//   * welcome-ltr.png            — first access, English (LTR)
//   * welcome-rtl.png            — first access, Arabic (RTL)
//   * dashboard-after-skip.png   — after "Skip for now" (normal dashboard)
//   * dashboard-after-connect.png— after connect, Tradovate view with trades
//   * dashboard-status-404.png   — FAIL-OPEN: status fn missing (404)
//   * dashboard-status-500.png   — FAIL-OPEN: status fn erroring (500)
//
// No real backend, no credentials. Run: node scripts/screenshot-welcome.mjs
// (needs a served build: `npx vite build && npx vite preview --port 4321`).

import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4321";
const SUPABASE = process.env.SUPABASE_MOCK || "http://127.0.0.1:9999";
const OUT_DIR = process.env.OUT_DIR || new URL("../docs/assets/", import.meta.url).pathname;

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "mock.welcome@braxelmarkets.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Mock Welcome User" },
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

const INTEGRATION = {
  id: "22222222-2222-2222-2222-222222222222",
  environment: "demo",
  accountId: 12345,
  accountSpec: "DEMO12345",
  label: "DEMO12345",
  status: "connected",
  lastFillId: 90210,
  tokenExpiresAt: null,
};

const TRADES = [
  { id: "t1", integration_id: INTEGRATION.id, account_id: 12345, root_symbol: "ES", symbol: "ESZ6", side: "long", quantity: 2, entry_price: 5842.25, exit_price: 5849.5, opened_at: "2026-10-03T13:31:00Z", closed_at: "2026-10-03T13:58:00Z", realized_pnl: 725, commission: 4.18, net_pnl: 720.82, status: "closed" },
  { id: "t2", integration_id: INTEGRATION.id, account_id: 12345, root_symbol: "NQ", symbol: "NQZ6", side: "short", quantity: 1, entry_price: 20980.5, exit_price: 20955.25, opened_at: "2026-10-03T14:12:00Z", closed_at: "2026-10-03T14:26:00Z", realized_pnl: 505, commission: 4.18, net_pnl: 500.82, status: "closed" },
  { id: "t3", integration_id: INTEGRATION.id, account_id: 12345, root_symbol: "CL", symbol: "CLX6", side: "long", quantity: 1, entry_price: 68.4, exit_price: null, opened_at: "2026-10-04T09:02:00Z", closed_at: null, realized_pnl: 0, commission: 4.18, net_pnl: 0, status: "open" },
];
const SUMMARY = { netPnl: 1221.64, grossPnl: 1230, commission: 8.36, openTrades: 1, closedTrades: 2, byAccount: [{ accountId: 12345, netPnl: 1221.64, trades: 3 }] };

// scenario -> how the mocked tradovate-status answers.
const SCENARIOS = {
  welcome: { status: { enabled: true, connected: false, integrations: [], welcome: { show: true, skipped: false } } },
  skip: { status: { enabled: true, connected: false, integrations: [], welcome: { show: false, skipped: true } } },
  connect: { status: { enabled: true, connected: true, integrations: [INTEGRATION], welcome: { show: false, skipped: false } } },
  disabled: { status: { enabled: false, connected: false, integrations: [], welcome: { show: false, skipped: false } } },
  // FAIL-OPEN: the function is not deployed (404) / errors (500). The dashboard
  // must render normally — never the welcome screen, never a blocking state.
  status404: { statusError: 404 },
  status500: { statusError: 500 },
};

async function capture(browser, scenario, { lng = "en", clickTradovate = false, file }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.evaluateOnNewDocument((session, lang) => {
    try {
      localStorage.setItem("braxel-auth-session", JSON.stringify(session));
      // Pages share one browser context, so the language would otherwise leak
      // from the RTL capture into the following ones. Pin it per capture.
      localStorage.setItem("i18nextLng", lang);
    } catch {}
  }, SESSION, lng);

  await page.setRequestInterception(true);
  page.on("request", async (req) => {
    const url = req.url();
    if (!url.startsWith(SUPABASE)) return req.continue();
    if (req.method() === "OPTIONS") return req.respond({ status: 204, headers: jsonHeaders, body: "" });
    const u = url.replace(SUPABASE, "");
    const body = (obj, status = 200) => req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });

    if (u.startsWith("/auth/v1/user")) return body(USER);
    if (u.startsWith("/auth/v1/token")) return body(SESSION);
    if (u.startsWith("/auth/v1/logout")) return req.respond({ status: 204, body: "" });
    if (u.startsWith("/rest/v1/services")) {
      return body([{ id: "s1", plan_name: "Growth Plan", account_id: "BX-2045", balance: "25000", status: "active" }]);
    }
    if (u.startsWith("/rest/v1/profiles")) return body([{ id: USER.id, first_name: "Mock", last_name: "Welcome", kyc_status: null }]);
    if (u.startsWith("/rest/v1/kyc_submissions")) return body([]);
    if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
    if (u.startsWith("/functions/v1/tradovate-status")) {
      // FAIL-OPEN scenarios: the function is missing/erroring. Answer non-2xx
      // (404 {"code":"NOT_FOUND"} mirrors an undeployed function).
      if (SCENARIOS[scenario].statusError) {
        return body({ code: "NOT_FOUND" }, SCENARIOS[scenario].statusError);
      }
      // POST { action: "skip" } acknowledges; GET returns the scenario.
      if (req.method() === "POST") {
        return body({ ok: true, enabled: true, connected: false, integrations: [], welcome: { show: false, skipped: true } });
      }
      return body(SCENARIOS[scenario].status);
    }
    if (u.startsWith("/functions/v1/tradovate-data")) {
      return body({ trades: TRADES, fills: [], summary: SUMMARY });
    }
    return body({});
  });

  const q = lng && lng !== "en" ? `?lng=${lng}` : "";
  await page.goto(`${BASE}/dashboard${q}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  if (clickTradovate) {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((el) => /tradovate/i.test(el.textContent || ""));
      if (b) b.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
  }

  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    const skipBtn = Array.from(document.querySelectorAll("button")).find((el) => /skip|تخط|דלג/i.test(el.textContent || ""));
    const cta = Array.from(document.querySelectorAll("button")).find((el) => /log in on tradovate|تسجيل الدخول/i.test(el.textContent || ""));
    const fixedOverlay = Array.from(document.querySelectorAll("div,section")).some((el) => {
      const s = getComputedStyle(el);
      if (s.position !== "fixed") return false;
      if (s.display === "none" || s.visibility === "hidden" || s.pointerEvents === "none") return false;
      const r = el.getBoundingClientRect();
      return r.width >= window.innerWidth * 0.95 && r.height >= window.innerHeight * 0.95;
    });
    return {
      dir: document.documentElement.dir,
      hasSkip: !!skipBtn,
      hasCta: !!cta,
      hasActiveServices: /active services|serviços ativos/i.test(text),
      hasTrades: /ESZ6|NQZ6/.test(text),
      fixedOverlay,
      text: text.slice(0, 400),
    };
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  await page.screenshot({ path: `${OUT_DIR}/${file}`, fullPage: true });
  await page.close();
  return { file, scenario, lng, ...info, consoleErrors: errors.slice(0, 4) };
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
results.push(await capture(browser, "welcome", { file: "welcome-ltr.png" }));
results.push(await capture(browser, "welcome", { lng: "ar", file: "welcome-rtl.png" }));
results.push(await capture(browser, "skip", { file: "dashboard-after-skip.png" }));
results.push(await capture(browser, "connect", { clickTradovate: true, file: "dashboard-after-connect.png" }));
results.push(await capture(browser, "disabled", { file: "dashboard-tradovate-disabled.png" }));
// FAIL-OPEN proof: a missing (404) or erroring (500) status function still
// renders the normal dashboard, never the welcome screen.
results.push(await capture(browser, "status404", { file: "dashboard-status-404.png" }));
results.push(await capture(browser, "status500", { file: "dashboard-status-500.png" }));

await browser.close();
console.log(JSON.stringify(results, null, 2));

const byFile = Object.fromEntries(results.map((r) => [r.file, r]));
const ok =
  byFile["welcome-ltr.png"].hasCta &&
  byFile["welcome-ltr.png"].hasSkip &&
  !byFile["welcome-ltr.png"].hasActiveServices &&
  !byFile["welcome-ltr.png"].fixedOverlay &&
  byFile["welcome-rtl.png"].dir === "rtl" &&
  byFile["welcome-rtl.png"].hasCta &&
  // After skip: the normal dashboard, with the Tradovate card still offering
  // the connect CTA (the soft gate dismissed, the card remains).
  byFile["dashboard-after-skip.png"].hasActiveServices &&
  byFile["dashboard-after-skip.png"].hasCta &&
  byFile["dashboard-after-connect.png"].hasTrades &&
  byFile["dashboard-tradovate-disabled.png"].hasActiveServices &&
  !byFile["dashboard-tradovate-disabled.png"].hasCta &&
  // FAIL-OPEN: 404/500 status -> normal dashboard content, no welcome screen
  // (the connect card may still render), no blocking overlay.
  byFile["dashboard-status-404.png"].hasActiveServices &&
  !byFile["dashboard-status-404.png"].fixedOverlay &&
  byFile["dashboard-status-500.png"].hasActiveServices &&
  !byFile["dashboard-status-500.png"].fixedOverlay;
console.log("\nASSERTIONS:", ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
