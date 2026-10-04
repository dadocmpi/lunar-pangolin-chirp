// Headless proof of the Tradovate connect-panel changes:
//   * connect-panel-demo-only-ltr.png  — no demo/live selector (English, LTR)
//   * connect-panel-demo-only-rtl.png  — no demo/live selector (Arabic, RTL)
//   * connect-panel-account-preselected.png — several accounts, first ACTIVE preselected
//   * connect-panel-not-enabled.png    — 503 feature_disabled => "not enabled yet"
//
// Serves a build (BASE_URL) whose VITE_SUPABASE_URL points at the mock
// (SUPABASE_MOCK). No real backend, no credentials.
//
// Run: node scripts/screenshot-connect-panel.mjs
// (needs a served build: `VITE_SUPABASE_URL=... npx vite build && npx vite preview --port 4321`).

import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4321";
const SUPABASE = process.env.SUPABASE_MOCK || "http://127.0.0.1:9999";
const OUT_DIR = process.env.OUT_DIR || new URL("../docs/assets/", import.meta.url).pathname;

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "mock.panel@braxelmarkets.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Mock Panel User" },
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

const STATUS = {
  enabled: true,
  connected: false,
  integrations: [],
  welcome: { show: false, skipped: true },
};

// scenario -> how tradovate-connect answers when the form is submitted.
const CONNECT = {
  // 3 accounts; the first (id 2002) is the active one the server preselects.
  accounts: {
    status: 200,
    body: {
      ok: false,
      code: "account_selection_required",
      accounts: [
        { id: 2001, name: "DEMO2001", active: false, simulation: true },
        { id: 2002, name: "DEMO2002", active: true, simulation: true },
        { id: 2003, name: "DEMO2003", active: true, simulation: true },
      ],
      preselectAccountId: 2002,
    },
  },
  // The kill switch is off: canonical 503 feature_disabled.
  disabled: {
    status: 503,
    body: {
      ok: false,
      error: "feature_disabled",
      feature: "tradovate",
      message: "tradovate is disabled by its runtime switch.",
    },
  },
  // Our function is not deployed.
  notFound: { status: 404, body: { code: "NOT_FOUND" } },
};

async function capture(browser, { lng = "en", scenario = "none", openPanel = true, file }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.evaluateOnNewDocument((session, lang) => {
    try {
      localStorage.setItem("braxel-auth-session", JSON.stringify(session));
      localStorage.setItem("i18nextLng", lang);
    } catch {}
  }, SESSION, lng);

  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith(SUPABASE)) return req.continue();
    if (req.method() === "OPTIONS") return req.respond({ status: 204, headers: jsonHeaders, body: "" });
    const u = url.replace(SUPABASE, "");
    const body = (obj, status = 200) => req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });

    if (u.startsWith("/auth/v1/user")) return body(USER);
    if (u.startsWith("/auth/v1/token")) return body(SESSION);
    if (u.startsWith("/auth/v1/logout")) return req.respond({ status: 204, body: "" });
    if (u.startsWith("/rest/v1/services")) return body([]);
    if (u.startsWith("/rest/v1/profiles")) return body([{ id: USER.id, first_name: "Mock", last_name: "Panel", kyc_status: null }]);
    if (u.startsWith("/rest/v1/kyc_submissions")) return body([]);
    if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
    if (u.startsWith("/rest/v1/trades")) return body([]);
    if (u.startsWith("/functions/v1/tradovate-status")) return body(STATUS);
    if (u.startsWith("/functions/v1/tradovate-data")) return body({ trades: [], fills: [], summary: null });
    if (u.startsWith("/functions/v1/tradovate-connect")) {
      const c = CONNECT[scenario] || CONNECT.notFound;
      return body(c.body, c.status);
    }
    return body({});
  });

  const q = lng && lng !== "en" ? `?lng=${lng}` : "";
  await page.goto(`${BASE}/dashboard${q}`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));

  if (openPanel) {
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((el) =>
        /log in on tradovate|تسجيل الدخول/i.test(el.textContent || ""),
      );
      b?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
  }

  if (scenario !== "none") {
    // Fill username + password and submit.
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const user = inputs.find((i) => i.type !== "password");
      const pass = inputs.find((i) => i.type === "password");
      const setVal = (el, v) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(el, v);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      };
      if (user) setVal(user, "demo-user");
      if (pass) setVal(pass, "demo-pass");
    });
    await new Promise((r) => setTimeout(r, 200));
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((el) =>
        /connect account/i.test(el.textContent || ""),
      );
      b?.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
  }

  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    // A demo/live toggle would render the LIVE label as a selectable button.
    const buttons = Array.from(document.querySelectorAll("button"));
    const liveButton = buttons.some((el) => /^live$/i.test((el.textContent || "").trim()));
    const demoOnlyNotice = /demo \(paper trading\) only|التجريبي فقط/i.test(text);
    // Preselected account: the button carrying the aria-pressed state.
    const selected = buttons.find((el) => el.getAttribute("aria-pressed") === "true");
    return {
      dir: document.documentElement.dir,
      liveButton,
      demoOnlyNotice,
      selectedAccount: selected ? (selected.textContent || "").trim() : null,
      notEnabled: /not enabled yet|لم يتم التفعيل بعد/i.test(text),
      serviceUnavailable: /service is unavailable|serviço de ligação da braxel|service de connexion braxel/i.test(text),
      text: text.slice(0, 600),
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
results.push(await capture(browser, { file: "connect-panel-demo-only-ltr.png" }));
results.push(await capture(browser, { lng: "ar", file: "connect-panel-demo-only-rtl.png" }));
results.push(await capture(browser, { scenario: "accounts", file: "connect-panel-account-preselected.png" }));
results.push(await capture(browser, { scenario: "disabled", file: "connect-panel-not-enabled.png" }));

await browser.close();
console.log(JSON.stringify(results, null, 2));

const byFile = Object.fromEntries(results.map((r) => [r.file, r]));
const ok =
  // No demo/live selector anywhere; demo-only notice present.
  !byFile["connect-panel-demo-only-ltr.png"].liveButton &&
  byFile["connect-panel-demo-only-ltr.png"].demoOnlyNotice &&
  byFile["connect-panel-demo-only-rtl.png"].dir === "rtl" &&
  !byFile["connect-panel-demo-only-rtl.png"].liveButton &&
  byFile["connect-panel-demo-only-rtl.png"].demoOnlyNotice &&
  // Several accounts: the first ACTIVE (DEMO2002) is preselected.
  /DEMO2002/.test(byFile["connect-panel-account-preselected.png"].selectedAccount || "") &&
  // 503 feature_disabled => "not enabled yet", never "service unavailable".
  byFile["connect-panel-not-enabled.png"].notEnabled &&
  !byFile["connect-panel-not-enabled.png"].serviceUnavailable;
console.log("\nASSERTIONS:", ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
