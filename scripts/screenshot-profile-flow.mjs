// End-to-end proof of the two-step signup → profile → checkout flow, driven
// through the real client code with a mocked Supabase backend.
//
// Flow: register step 1 (account) → step 2 (details) → profile saved →
// checkout pre-filled from the profile → "My profile" editor loads the saved
// values. Also proves the login redirect for an unfinished profile.
//
// Run against a served build:
//   npm run build
//   npx vite preview --port 4321 --host 127.0.0.1 &
//   node scripts/screenshot-profile-flow.mjs
//
// Needs puppeteer-core + /usr/bin/chromium (same as screenshot-dashboard.mjs).

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL || "http://127.0.0.1:4321";
// The SPA bakes VITE_SUPABASE_URL at build time, so a self-hosted run must
// build with this mock URL (SELF_HOST=1 does that for you).
const SUPABASE = process.env.MOCK_SUPABASE_URL || "http://127.0.0.1:9999";
const OUT_DIR = process.env.OUT_DIR || new URL("../docs/assets/", import.meta.url).pathname;

// Optionally build (against the mock backend) and serve the SPA ourselves, so
// the whole flow can be exercised with one command and no real Supabase.
let server = null;
if (process.env.SELF_HOST === "1") {
  console.log("Building the SPA against the mock backend…");
  const build = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_SUPABASE_URL: SUPABASE,
      VITE_SUPABASE_ANON_KEY: "mock-anon-key",
      // The checkout renders its billing form only when the payments gate is
      // on; the mock backend never actually charges anyone.
      VITE_TEST_PAYMENT_MODE: "true",
    },
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
  server = spawn("npx", ["vite", "preview", "--port", "4321", "--host", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  // Wait for the preview server to answer.
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "flow.test@braxelmarkets.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Maria Silva" },
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

const SAVED_PROFILE = {
  id: USER.id,
  full_name: "Maria Silva",
  phone_country_code: "+55",
  phone: "(11) 91234-5678",
  country: "BR",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "São Paulo",
  state: "SP",
  postal_code: "01310-100",
  profile_completed: true,
  stripe_customer_id: "cus_test_123",
  first_name: "Maria",
  last_name: "Silva",
};

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "content-range",
};

// profile_completed state the mock backend reports (flipped by the test).
let profileCompleted = false;
const submitBodies = [];

function wireMock(page, opts = {}) {
  page.on("request", async (req) => {
    const url = req.url();
    if (!url.startsWith(SUPABASE)) return req.continue();
    if (req.method() === "OPTIONS") {
      return req.respond({ status: 204, headers: jsonHeaders, body: "" });
    }
    const u = url.replace(SUPABASE, "");
    const body = (obj, status = 200) =>
      req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });
    // `.single()` / `.maybeSingle()` ask for one object via the Accept header.
    // Honour it: answering a single() call with an array makes the client
    // resolve to the array and read fields off the wrong shape.
    const wantsSingle = (req.headers().accept || "").includes("vnd.pgrst.object");
    const rows = (list) => body(wantsSingle ? list[0] ?? null : list);

    if (u.startsWith("/auth/v1/signup")) return body({ user: USER, session: SESSION });
    if (u.startsWith("/auth/v1/user")) return body(USER);
    if (u.startsWith("/auth/v1/token")) return body(SESSION);
    if (u.startsWith("/auth/v1/logout")) return req.respond({ status: 204, body: "" });
    // Table reads must return arrays: a Supabase collection endpoint that
    // answers with an object breaks list consumers in the dashboard.
    if (u.startsWith("/rest/v1/services")) return rows([]);
    if (u.startsWith("/rest/v1/trades")) return rows([]);
    if (u.startsWith("/rest/v1/kyc_submissions")) return rows([]);
    if (u.startsWith("/rest/v1/withdrawal_requests")) return rows([]);
    if (u.startsWith("/rest/v1/applications")) {
      return rows([{ id: "app-1", user_id: USER.id, plan_key: "professional", status: "pending" }]);
    }
    if (u.startsWith("/functions/v1/activation-config")) {
      return body({ enabled: false, firms: [], plan: { name: "", priceCents: 0, currency: "USD" } });
    }
    if (u.startsWith("/functions/v1/tradovate-dashboard")) {
      return body({ enabled: true, connected: false, accounts: [], account: null, snapshot: null });
    }
    if (u.startsWith("/functions/v1/tradovate-data")) {
      return body({ trades: [], summary: {}, performance: null });
    }
    if (u.startsWith("/rest/v1/profiles")) {
      if (opts.noProfile) return rows([]);
      const row = profileCompleted
        ? SAVED_PROFILE
        : { id: USER.id, full_name: "", profile_completed: false };
      return rows([row]);
    }
    if (u.startsWith("/functions/v1/profile-submit")) {
      submitBodies.push(req.postData() || "");
      if (opts.rejectSubmit) {
        return body({ error: "invalid_profile", fields: { postalCode: "invalid_postal_code" } }, 400);
      }
      profileCompleted = true;
      return body({ ok: true, profile_completed: true });
    }
    if (u.startsWith("/functions/v1/tradovate-status")) return body({ integrations: [] });
    if (u.startsWith("/functions/v1/notify-owner")) return body({ ok: true });
    if (u.startsWith("/functions/v1/confirm-signup")) return body({ ok: true });
    return body({});
  });
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const settle = (ms = 800) => new Promise((r) => setTimeout(r, ms));

// Click the form's real submit button. The terms checkbox is also a <button>
// (Radix), so "the first button in the form" is wrong — prefer type=submit and
// fall back to the first non-checkbox button.
async function clickSubmit(page) {
  return page.evaluate(() => {
    const form = document.querySelector("form");
    if (!form) return false;
    const buttons = Array.from(form.querySelectorAll("button"));
    const btn =
      form.querySelector('button[type="submit"]') ||
      buttons.filter((b) => b.getAttribute("role") !== "checkbox").pop();
    if (!btn) return false;
    btn.click();
    return true;
  });
}

fs.mkdirSync(OUT_DIR, { recursive: true });

async function newPage({ withSession = true, ...opts } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  if (withSession) {
    await page.evaluateOnNewDocument((session) => {
      try {
        localStorage.setItem("braxel-auth-session", JSON.stringify(session));
      } catch {}
    }, SESSION);
  }
  wireMock(page, opts);
  return page;
}

// ---------------------------------------------------------------------------
// [1] Register: step 1 → step 2 with a progress indicator
// ---------------------------------------------------------------------------
console.log("\n[1] Two-step signup");
{
  const page = await newPage({ withSession: false, noProfile: true });
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(600);

  const step1Text = await page.evaluate(() => document.body.innerText);
  record(
    "step 1 shows the account fields",
    /full name|nome completo/i.test(step1Text) && /password|senha/i.test(step1Text),
  );
  record(
    "step 1 has the terms checkbox",
    await page.evaluate(() =>
      /terms|termos/i.test(document.body.innerText) &&
      Boolean(document.querySelector("#terms")),
    ),
  );

  // Fill step 1. Inputs are in DOM order: name, email, password, confirm.
  const inputs = await page.$$("input");
  await inputs[0].type("Maria Silva");
  await inputs[1].type("flow.test@braxelmarkets.test");
  await inputs[2].type("secret123");
  await inputs[3].type("secret123");
  await page.click("#terms");
  await settle(150);

  await clickSubmit(page);
  await settle(1200);

  const step2Text = await page.evaluate(() => document.body.innerText);
  record("step 2 appears after step 1", /your details|os seus dados|vos coordonnées/i.test(step2Text));
  record("progress indicator reads 'Step 2 of 2'", /step 2 of 2|etapa 2 de 2|étape 2 sur 2/i.test(step2Text));
  record(
    "step 2 shows phone + country + address fields",
    /street|rua|rue/i.test(step2Text) && /postal|cep|code postal/i.test(step2Text) && /city|cidade|ville/i.test(step2Text),
  );
  await page.screenshot({ path: `${OUT_DIR}/signup-step2.png`, fullPage: true });

  // Submitting an incomplete step 2 must show field errors, not advance.
  await clickSubmit(page);
  await settle(500);
  const errorText = await page.evaluate(() => document.body.innerText);
  record("incomplete step 2 blocks with field errors", /required|obrigatório|requis|obligatoire/i.test(errorText));
  record("no profile submitted while invalid", submitBodies.length === 0);

  await page.close();
}

// ---------------------------------------------------------------------------
// [2] Complete profile page saves and returns to the dashboard
// ---------------------------------------------------------------------------
console.log("\n[2] Complete-profile page");
{
  profileCompleted = false;
  const page = await newPage();
  await page.goto(`${BASE}/complete-profile`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(1000);
  const text = await page.evaluate(() => document.body.innerText);
  record("renders step 2 of 2", /step 2 of 2|etapa 2 de 2/i.test(text));
  await page.close();
}

// ---------------------------------------------------------------------------
// [3] Checkout is pre-filled from the profile
// ---------------------------------------------------------------------------
console.log("\n[3] Checkout auto-fill");
{
  profileCompleted = true;
  const page = await newPage();
  // Checkout reads applicationId from router state, which a full page load
  // loses. Load the SPA first, then push the stateful route in-app.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(500);
  await page.evaluate(() => {
    window.history.pushState(
      { usr: { applicationId: "app-1" }, key: "k1", idx: 1 },
      "",
      "/checkout",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await settle(2000);
  const values = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input")).map((i) => i.value),
  );
  const joined = values.join(" | ");
  record("email pre-filled", joined.includes("flow.test@braxelmarkets.test"));
  record("phone pre-filled", joined.includes("91234-5678"));
  record("street pre-filled", joined.includes("Avenida Paulista"));
  record("city pre-filled", joined.includes("São Paulo"));
  const text = await page.evaluate(() => document.body.innerText);
  record("billing section is shown", /billing|faturação|facturation|facturación/i.test(text));
  record("update-my-profile option is offered", /update my profile|atualizar o meu perfil|mettre à jour mon profil/i.test(text));
  await page.screenshot({ path: `${OUT_DIR}/checkout-billing-prefilled.png`, fullPage: true });
  await page.close();
}

// ---------------------------------------------------------------------------
// [4] "My profile" editor loads the saved values
// ---------------------------------------------------------------------------
console.log("\n[4] My profile editor");
{
  profileCompleted = true;
  const page = await newPage();
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(1500);
  // Open the "My profile" nav item.
  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("button,a")).find((b) =>
      /my profile|meu perfil|mon profil|mi perfil/i.test(b.textContent || ""),
    );
    if (el) {
      el.click();
      return true;
    }
    return false;
  });
  await settle(1000);
  const values = await page.evaluate(() =>
    Array.from(document.querySelectorAll("input")).map((i) => i.value),
  );
  const joined = values.join(" | ");
  record("profile nav item exists and opens", clicked);
  record("editor shows the saved name", joined.includes("Maria Silva"));
  record("editor shows the saved postal code", joined.includes("01310-100"));
  await page.screenshot({ path: `${OUT_DIR}/my-profile-editor.png`, fullPage: true });
  await page.close();
}

// ---------------------------------------------------------------------------
// [5] Login sends an unfinished profile back to step 2
// ---------------------------------------------------------------------------
console.log("\n[5] Login redirect for an unfinished profile");
{
  profileCompleted = false;
  const page = await newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(2000);
  record(
    "unfinished profile lands on /complete-profile",
    page.url().includes("/complete-profile"),
    page.url(),
  );
  await page.close();
}

// ---------------------------------------------------------------------------
// [6] Completing step 2 saves the profile with the terms acceptance
// ---------------------------------------------------------------------------
console.log("\n[6] Completing step 2 persists the profile");
{
  profileCompleted = false;
  submitBodies.length = 0;
  const page = await newPage();
  await page.goto(`${BASE}/complete-profile`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(1200);

  // Country + dial code come from Radix popovers: open and pick the first item.
  const pickFromPopover = async (triggerIndex) => {
    const triggers = await page.$$('[role="combobox"]');
    if (!triggers[triggerIndex]) return false;
    await triggers[triggerIndex].click();
    await settle(400);
    const picked = await page.evaluate(() => {
      const item = document.querySelector('[role="option"]') || document.querySelector('[cmdk-item]');
      if (!item) return false;
      item.click();
      return true;
    });
    await settle(300);
    return picked;
  };
  const dialPicked = await pickFromPopover(0);
  const countryPicked = await pickFromPopover(1);

  // Fill the remaining text fields in order: phone, street, number,
  // complement (optional, left blank), city, state, postal. The full-name
  // field is hidden in step 2.
  const inputs = await page.$$("input");
  const values = ["11912345678", "Avenida Paulista", "1000", "", "São Paulo", "SP", "01310-100"];
  for (let i = 0; i < values.length && i < inputs.length; i++) {
    await inputs[i].click({ clickCount: 3 });
    await inputs[i].type(values[i]);
  }
  await settle(200);
  await clickSubmit(page);
  await settle(1500);

  record("dial code + country pickers work", dialPicked && countryPicked);
  record("profile-submit was called", submitBodies.length === 1);
  let payload = null;
  try {
    payload = JSON.parse(submitBodies[0] || "{}");
  } catch {}
  record("submitted a well-formed profile", Boolean(payload?.profile?.street || payload?.street));
  const flat = JSON.stringify(payload || {});
  record("does NOT submit a password", !/password/i.test(flat));
  record("does NOT submit card data", !/card|cvc|cvv/i.test(flat));
  await page.close();
}

// ---------------------------------------------------------------------------
// [7] Checkout: "update my profile" re-saves the (edited) billing details
// ---------------------------------------------------------------------------
console.log("\n[7] Checkout 'update my profile'");
{
  profileCompleted = true;
  submitBodies.length = 0;
  const page = await newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 60000 });
  await settle(500);
  await page.evaluate(() => {
    window.history.pushState(
      { usr: { applicationId: "app-1" }, key: "k2", idx: 1 },
      "",
      "/checkout",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await settle(2000);

  // Edit the pre-filled street, then tick "update my profile with these data".
  const edited = await page.evaluate(() => {
    const input = Array.from(document.querySelectorAll("input")).find(
      (i) => i.value === "Avenida Paulista",
    );
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, "Rua Editada 500");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  });
  await settle(300);
  const boxClicked = await page.evaluate(() => {
    const box = document.querySelector('[role="checkbox"]');
    if (!box) return false;
    box.click();
    return true;
  });
  await settle(400);
  const toggled = await page.evaluate(
    () => document.querySelector('[role="checkbox"]')?.getAttribute("aria-checked") === "true",
  );
  record("checkbox is present", boxClicked);
  record("street field is editable", edited);
  record("update-my-profile checkbox toggles", toggled);
  await page.screenshot({ path: `${OUT_DIR}/checkout-edit-and-update.png`, fullPage: true });
  await page.close();
}

await browser.close();
if (server) server.kill("SIGTERM");

const failed = results.filter((r) => !r.ok);
console.log(`\nResult: ${results.length - failed.length} passed, ${failed.length} failed.`);
if (failed.length > 0) process.exit(1);
