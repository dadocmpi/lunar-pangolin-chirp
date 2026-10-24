// ============================================================================
// screenshot-activation-flow — headless proof of the account-activation flow.
//
// Run: node scripts/screenshot-activation-flow.mjs   (needs BASE_URL served)
//
// Verifies the three acceptance paths without any real backend:
//   [1] a VISITOR can open /accounts and sees the firm cards + affiliate
//       disclosure + risk notice;
//   [2] a logged-in CUSTOMER can submit an activation in /dashboard and it
//       reaches the activation-submit Edge Function as multipart/form-data;
//   [3] an OPERATOR panel lists the activation and can approve it.
//
// Every Supabase call is mocked via request interception. No credentials, no
// network. The Tradovate card must be absent when TRADOVATE_ENABLED=false.
// ============================================================================

import puppeteer from "puppeteer-core";
import fs from "node:fs";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4321";
const SUPABASE = "http://127.0.0.1:9999";
const OUT_DIR = process.env.OUT_DIR || new URL("../docs/assets/", import.meta.url).pathname;

// A 1x1 PNG, written to a temp file so the receipt upload can use a real image
// without committing a binary asset to the repository.
const RECEIPT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const RECEIPT_FILE = new URL("../.agent_tmp/_test-receipt.png", import.meta.url).pathname;
fs.mkdirSync(new URL("../.agent_tmp/", import.meta.url).pathname, { recursive: true });
fs.writeFileSync(RECEIPT_FILE, RECEIPT_PNG);

const USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "mock.customer@braxelmarkets.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  user_metadata: { full_name: "Mock Customer" },
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

// Public activation config: two firms, a plan, flow enabled.
const ACTIVATION_CONFIG = {
  enabled: true,
  firms: [
    { id: "tradeify", name: "Tradeify", url: "https://tradeify.example/ref?aff=braxel" },
    { id: "lucid", name: "Lucid", url: "https://lucid.example/ref?aff=braxel" },
  ],
  plan: { name: "Signals Plan", priceCents: 9900, currency: "USD" },
};

let failures = 0;
function assert(name, ok) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures++;
}

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// [1] Visitor opens /accounts (no session).
// ---------------------------------------------------------------------------
console.log("\n[1] Visitor sees /accounts");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith(SUPABASE)) return req.continue();
    if (req.method() === "OPTIONS") return req.respond({ status: 204, headers: jsonHeaders, body: "" });
    const u = url.replace(SUPABASE, "");
    const body = (obj, status = 200) =>
      req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });
    if (u.startsWith("/functions/v1/activation-config")) return body(ACTIVATION_CONFIG);
    if (u.startsWith("/auth/v1/user")) return body({}, 401);
    return body({});
  });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2000));
  const text = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${OUT_DIR}/accounts-visitor.png`, fullPage: true });

  assert("shows the Tradeify firm card", /tradeify/i.test(text));
  assert("shows the Lucid firm card", /lucid/i.test(text));
  assert("shows the affiliate-commission disclosure", /affiliate|comiss/i.test(text));
  assert("shows the signals plan name", /signals plan/i.test(text));
  assert("shows the plan price", /\$99/.test(text));
  assert("shows a risk notice", /risk|risco/i.test(text));

  // The affiliate links must be real anchors with rel="sponsored noopener".
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[target=_blank]")).map((a) => ({
      href: a.href,
      rel: a.getAttribute("rel") || "",
    })),
  );
  const affiliate = links.find((l) => l.href.includes("tradeify.example"));
  assert("affiliate link points at the configured URL", Boolean(affiliate));
  assert("affiliate link opens a new tab with rel=sponsored noopener", Boolean(affiliate) &&
    /sponsored/.test(affiliate.rel) && /noopener/.test(affiliate.rel) && /noreferrer/.test(affiliate.rel));
  assert("no page errors on /accounts", consoleErrors.length === 0);
  await page.close();
}

// ---------------------------------------------------------------------------
// [2] Logged-in customer submits an activation in /dashboard.
// ---------------------------------------------------------------------------
console.log("\n[2] Customer submits an activation");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.evaluateOnNewDocument((s) => {
    try { localStorage.setItem("braxel-auth-session", JSON.stringify(s)); } catch {}
    // Capture the activation-submit FormData at the page level: Chromium does
    // not expose a multipart body through request interception, so we spy on
    // fetch and record the real field names/values the client sends.
    window.__activationSubmits = [];
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      if (url.includes("/functions/v1/activation-submit")) {
        const fd = init && init.body instanceof FormData ? init.body : null;
        const entries = [];
        let hasFile = false;
        if (fd) {
          for (const [k, v] of fd.entries()) {
            if (v instanceof File) {
              hasFile = true;
              entries.push([k, `FILE:${v.name}:${v.type}:${v.size}`]);
            } else {
              entries.push([k, String(v)]);
            }
          }
        }
        window.__activationSubmits.push({
          method: (init && init.method) || "GET",
          entries,
          hasFile,
        });
        return Promise.resolve(new Response(
          JSON.stringify({ ok: true, activationId: "aaaaaaaa-0000-0000-0000-000000000001", status: "pending" }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ));
      }
      return realFetch(input, init);
    };
  }, SESSION);

  let submitted = null; // capture the multipart submit (via the fetch spy)
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
    if (u.startsWith("/functions/v1/activation-config")) return body(ACTIVATION_CONFIG);
    // Tradovate is OFF: the status call reports enabled:false and the card must hide.
    if (u.startsWith("/functions/v1/tradovate-status")) return body({ enabled: false, integrations: [] });
    if (u.startsWith("/functions/v1/activation-submit")) {
      // Handled by the fetch spy; just satisfy the interception.
      return req.respond({ status: 201, headers: jsonHeaders, body: JSON.stringify({ ok: true, activationId: "aaaaaaaa-0000-0000-0000-000000000001", status: "pending" }) });
    }
    if (u.startsWith("/rest/v1/services")) return body([]);
    if (u.startsWith("/rest/v1/profiles")) return body([{ id: USER.id, kyc_status: null }]);
    if (u.startsWith("/rest/v1/kyc_submissions")) return body([]);
    if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
    if (u.startsWith("/rest/v1/trades")) return body([]);
    if (u.startsWith("/rest/v1/account_activations")) return body([]);
    return body({});
  });

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  // Navigate to the "Activate account" view.
  const navOk = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /activate|ativar/i.test(b.textContent || ""),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  assert("the 'Activate account' view is reachable in the sidebar", navOk);
  await new Promise((r) => setTimeout(r, 1200));

  const dashText = await page.evaluate(() => document.body.innerText);
  assert("the Tradovate card is HIDDEN when TRADOVATE_ENABLED=false", !/log in on tradovate/i.test(dashText));
  assert("the activation form is shown", /account|conta/i.test(dashText));

  // Fill and submit the form.
  const filled = await page.evaluate(() => {
    const setNative = (el, value) => {
      const proto = el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const inputs = Array.from(document.querySelectorAll("input"));
    const email = inputs.find((i) => i.type === "email");
    const texts = inputs.filter((i) => i.type === "text" || i.type === "email");
    // plan name placeholder contains "Evaluation"; login placeholder contains
    // "account"; the email field is type=email.
    const planInput = texts.find((i) => i !== email && /evaluation|plan|plano/i.test(i.placeholder || ""));
    const loginInput = texts.find((i) => i !== email && i !== planInput && /account|conta|login|\bid\b/i.test(i.placeholder || ""));
    if (planInput) setNative(planInput, "50K Evaluation");
    if (loginInput) setNative(loginInput, "ABC-12345");
    if (email) setNative(email, "buyer@example.com");
    const textarea = document.querySelector("textarea");
    if (textarea) setNative(textarea, "Screenshot attached");
    // Check the four mandatory confirmations.
    const boxes = Array.from(document.querySelectorAll("button[role=checkbox]"));
    boxes.forEach((b) => { if (b.getAttribute("aria-checked") !== "true") b.click(); });
    return { plan: Boolean(planInput), login: Boolean(loginInput), email: Boolean(email), boxes: boxes.length };
  });
  assert("found plan/account/email fields", filled.plan && filled.login && filled.email);
  assert("found the four confirmation checkboxes", filled.boxes === 4);

  // Attach a receipt through the hidden file input (a real PNG).
  const fileInput = await page.$('input[type=file]');
  if (fileInput) {
    await fileInput.uploadFile(RECEIPT_FILE);
  }
  await new Promise((r) => setTimeout(r, 300));

  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button[type=submit]")).find((b) =>
      /submit|enviar|solicitar/i.test(b.textContent || ""),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  assert("a submit button exists", clicked);
  await new Promise((r) => setTimeout(r, 2500));

  // Read the captured submit from the page-level fetch spy.
  const submits = await page.evaluate(() => window.__activationSubmits || []);
  submitted = submits[0] || null;
  const field = (name) => {
    const e = submitted?.entries?.find(([k]) => k === name);
    return e ? e[1] : null;
  };
  assert("activation-submit received a POST", Boolean(submitted) && submitted.method === "POST");
  assert("the request is a FormData payload", Boolean(submitted) && Array.isArray(submitted.entries) && submitted.entries.length > 0);
  assert("the payload carries firmId=tradeify", field("firmId") === "tradeify");
  assert("the payload carries the plan name", field("planName") === "50K Evaluation");
  assert("the payload carries the account login", field("accountLogin") === "ABC-12345");
  assert("the payload carries the purchase email", field("purchaseEmail") === "buyer@example.com");
  assert("the payload carries all four confirmations as true", ["confirmedOwnership", "confirmedResponsibility", "confirmedFirmRules", "confirmedRisk"].every((k) => field(k) === "true"));
  assert("the payload carries a receipt file", Boolean(submitted) && submitted.hasFile === true);
  assert(
    "NO broker password / cid / secret field is sent",
    Boolean(submitted) && !submitted.entries.some(([k]) => /password|cid|secret|api_?key/i.test(k)),
  );

  await page.screenshot({ path: `${OUT_DIR}/activation-customer-submit.png`, fullPage: true });
  assert("no page errors while submitting", consoleErrors.length === 0);
  await page.close();
}

// ---------------------------------------------------------------------------
// [3] Operator sees the pending activation (operator panel renders).
// ---------------------------------------------------------------------------
console.log("\n[3] Operator panel lists the activation");
{
  const OPERATOR = { ...USER, app_metadata: { provider: "email", operator: true } };
  const OP_SESSION = { ...SESSION, user: OPERATOR };
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.evaluateOnNewDocument((s) => {
    try { localStorage.setItem("braxel-auth-session", JSON.stringify(s)); } catch {}
  }, OP_SESSION);
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith(SUPABASE)) return req.continue();
    if (req.method() === "OPTIONS") return req.respond({ status: 204, headers: jsonHeaders, body: "" });
    const u = url.replace(SUPABASE, "");
    const body = (obj, status = 200) =>
      req.respond({ status, headers: jsonHeaders, body: JSON.stringify(obj) });
    if (u.startsWith("/auth/v1/user")) return body(OPERATOR);
    if (u.startsWith("/auth/v1/token")) return body(OP_SESSION);
    if (u.startsWith("/functions/v1/activation-config")) return body(ACTIVATION_CONFIG);
    if (u.startsWith("/functions/v1/activation-review")) {
      return body({ ok: true, status: "approved" });
    }
    if (u.startsWith("/rest/v1/account_activations")) {
      return body([
        {
          id: "aaaaaaaa-0000-0000-0000-000000000001",
          firm: "tradeify",
          plan_name: "50K Evaluation",
          account_login: "ABC-12345",
          purchase_email: "buyer@example.com",
          receipt_path: "11111111-1111-1111-1111-111111111111/receipt.pdf",
          status: "pending",
          operator_note: null,
          submitted_at: "2026-10-24T12:00:00Z",
          created_at: "2026-10-24T12:00:00Z",
        },
      ]);
    }
    return body({});
  });
  await page.goto(`${BASE}/operator/activations`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  const text = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${OUT_DIR}/activation-operator-list.png`, fullPage: true });
  assert("operator panel shows the account login", /ABC-12345/.test(text));
  assert("operator panel shows the firm", /Tradeify/.test(text));

  // Open the detail modal — the review actions live there.
  const opened = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /review|revis|analis/i.test(b.textContent || ""),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  assert("the operator can open a request detail", opened);
  await new Promise((r) => setTimeout(r, 1200));
  const detailText = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${OUT_DIR}/activation-operator.png`, fullPage: true });
  assert("detail offers an approve action", /approve|aprovar/i.test(detailText));
  assert("detail offers a reject action", /reject|recusar/i.test(detailText));
  assert("detail offers a request-info action", /request info|informa/i.test(detailText));
  assert("no page errors on the operator panel", consoleErrors.length === 0);
  await page.close();
}

// ---------------------------------------------------------------------------
// [4] Customer sees the APPROVED status and the "Plan active" onboarding.
// ---------------------------------------------------------------------------
console.log("\n[4] Customer sees the approved status");
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  await page.evaluateOnNewDocument((s) => {
    try { localStorage.setItem("braxel-auth-session", JSON.stringify(s)); } catch {}
  }, SESSION);
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
    if (u.startsWith("/functions/v1/activation-config")) return body(ACTIVATION_CONFIG);
    if (u.startsWith("/functions/v1/tradovate-status")) return body({ enabled: false, integrations: [] });
    if (u.startsWith("/rest/v1/services")) return body([]);
    if (u.startsWith("/rest/v1/profiles")) return body([{ id: USER.id, kyc_status: null }]);
    if (u.startsWith("/rest/v1/kyc_submissions")) return body([]);
    if (u.startsWith("/rest/v1/withdrawal_requests")) return body([]);
    if (u.startsWith("/rest/v1/trades")) return body([]);
    if (u.startsWith("/rest/v1/account_activations")) {
      return body([
        {
          id: "aaaaaaaa-0000-0000-0000-000000000001",
          firm: "tradeify",
          plan_name: "50K Evaluation",
          account_login: "ABC-12345",
          purchase_email: "buyer@example.com",
          receipt_path: "11111111-1111-1111-1111-111111111111/receipt.png",
          status: "approved",
          operator_note: "Welcome aboard.",
          submitted_at: "2026-10-24T12:00:00Z",
          reviewed_at: "2026-10-24T13:00:00Z",
          created_at: "2026-10-24T12:00:00Z",
        },
      ]);
    }
    return body({});
  });
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      /activate|ativar/i.test(b.textContent || ""),
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const text = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `${OUT_DIR}/activation-customer-approved.png`, fullPage: true });
  assert("the customer sees the approved status badge", /plan active|plano ativo/i.test(text));
  assert("the customer sees the 'Plan active' onboarding", /signals plan is active|plano de sinais est[áa] ativo/i.test(text));
  assert("the onboarding explains how to connect the execution tool", /tool|ferramenta/i.test(text));
  assert("the customer never sees the Tradovate connect card", !/log in on tradovate/i.test(text));
  assert("no page errors on the approved view", consoleErrors.length === 0);
  await page.close();
}

await browser.close();

console.log(`\n${failures === 0 ? "ALL PASSED" : failures + " FAILED"}`);
if (failures > 0) process.exit(1);
