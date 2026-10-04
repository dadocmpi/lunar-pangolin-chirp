// Proof that when OUR Edge Function is unreachable (404 / not deployed) the
// connect panel says "our service is unavailable" — NOT "could not reach
// Tradovate" and NOT "check your internet". Point BASE_URL at a served build.
//
// Run: node scripts/screenshot-connect-error.mjs
//
// The build under test must have been produced with
// VITE_SUPABASE_URL=http://127.0.0.1:9999 (see the CI/local recipe in
// docs/tradovate-runbook.md) so requests hit the mock below.

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
};

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });

await page.evaluateOnNewDocument((session) => {
  try {
    localStorage.setItem("braxel-auth-session", JSON.stringify(session));
  } catch {}
}, SESSION);

let connectStatus = 404;
await page.setRequestInterception(true);
page.on("request", (req) => {
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
  if (u.startsWith("/functions/v1/tradovate-status")) return body({ integrations: [] });
  // OUR Edge Function is not deployed: the platform answers 404 NOT_FOUND.
  if (u.startsWith("/functions/v1/tradovate-connect")) {
    return req.respond({
      status: connectStatus,
      headers: jsonHeaders,
      body: JSON.stringify({ code: "NOT_FOUND" }),
    });
  }
  return body({});
});

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));

// Open the connect panel via the card CTA.
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("button")).find((el) =>
    /log in on tradovate/i.test(el.textContent || ""),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 800));

// Fill and submit the form.
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

const text = await page.evaluate(() => document.body.innerText);
const serviceUnavailable = /connection service is unavailable|serviço de ligação da braxel|service de connexion braxel|servicio de conexión de braxel/i.test(text);
const blamesTradovate = /could not reach tradovate|impossible de joindre tradovate|impossibile raggiungere tradovate/i.test(text);
const blamesUserInternet = /check your (connection|internet)|vérifiez votre connexion|controlla la connessione/i.test(text);

console.log("connectStatus:", connectStatus);
console.log("showsServiceUnavailable:", serviceUnavailable);
console.log("blamesTradovate:", blamesTradovate);
console.log("blamesUserInternet:", blamesUserInternet);

fs.mkdirSync(OUT_DIR, { recursive: true });
await page.screenshot({ path: `${OUT_DIR}/connect-error-service-unavailable.png`, fullPage: true });
console.log("OUT", `${OUT_DIR}/connect-error-service-unavailable.png`);

await browser.close();

if (!serviceUnavailable || blamesTradovate || blamesUserInternet) {
  console.error(
    "FAIL: a 404 from our own Edge Function must show the service-unavailable message and never blame Tradovate or the user's internet.",
  );
  process.exit(1);
}
console.log("PASS: service unavailable is reported accurately.");
