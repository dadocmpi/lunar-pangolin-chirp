# Go live — one-click Supabase release

This page is for the owner. You do not need a terminal, Git, or any command
line. Everything below happens in the GitHub website (and one look at Vercel).
Follow it top to bottom.

The whole backend release is **one button** in GitHub Actions. That button:

1. applies the 6 pending database migrations, in order;
2. deploys every Supabase Edge Function;
3. runs a smoke test that fails if any function is missing.

It stops at the first problem, so you can never end up with code deployed
before the database it needs.

---

## Before you start (one time only)

The repository must already have these three secrets. Someone technical sets
them once, in the GitHub website:

1. Open the repository: <https://github.com/dadocmpi/lunar-pangolin-chirp>
2. Click **Settings** (top bar of the repository, not your account settings).
3. In the left menu: **Secrets and variables** → **Actions**.
4. Under **Repository secrets**, these three names must exist:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_PASSWORD`

You never see the values again after they are saved, and the release log never
prints them. If one is missing, the release stops immediately and tells you
which one in red.

### Edge Function secrets (set once, in Supabase)

The Tradovate integration has its own secrets, set in the **Supabase** website
(Project → Edge Functions → Secrets), never in GitHub and never in the code:

- `TRADOVATE_ENABLED` — leave **unset** to enable, or set the exact string
  `false` to switch the whole integration off at runtime.
- `TRADOVATE_ALLOWED_ENVIRONMENTS` — **leave unset for demo-only.** Unset (or
  empty) means only the DEMO environment is accepted, so **live trading is
  disabled by default**. Setting it to `demo,live` re-enables live later with no
  code change. The server rejects a `live` request with `422
  environment_not_allowed` while it is demo-only.
- `TRADOVATE_ENCRYPTION_KEY` — encrypts stored credentials (AES-256-GCM).
- `TRADOVATE_APP_CID` / `TRADOVATE_APP_SECRET` — the app-level API key pair.
- `AI_KYC_ENABLED` — leave **unset**, or `false` to route every KYC check to
  manual review.
- `WITHDRAWAL_KYC_GATE_ENABLED` — leave **unset** (only `false` changes it, and
  `false` *refuses* withdrawals; never set it in normal operation).

Also, the release workflow is a *manual* workflow. GitHub only shows a manual
workflow in the Actions list **after its file is on the default branch**
(`main`). That is why the order below starts by merging.

---

## The order (do not change it)

Do these in this exact order. Step 2 is the one-click release.

### Step 1 — Merge the pull request into `main`

1. Open the pull request: <https://github.com/dadocmpi/lunar-pangolin-chirp/pull/47>
2. Click the green **Merge pull request** button, then **Confirm merge**.
3. Merge **only** PR #47. Close PR #45 and PR #46 without merging (they are
   already included in #47).

**What happens next, on its own (nothing to click):**

- **Vercel** starts a **Production** deployment and finishes it a minute or two
  later. This is the website update.
- GitHub starts a workflow called **Deploy Supabase Edge Functions**. Because
  the database migrations are not applied yet, that workflow **skips** the
  function deploy on purpose (it prints a yellow warning: "Migrations for this
  commit are NOT applied... Skipping Edge Function deploy"). **This is
  expected.** It means your live functions are still the old ones — nothing is
  broken, nothing is half-deployed.

In between, the new website may show a few Tradovate/KYC areas as "unavailable"
or empty. That is the fail-closed design: it shows a safe empty state instead of
wrong data. It goes away after Step 2.

### Step 2 — Run the one-click release

1. Open the **Actions** tab: <https://github.com/dadocmpi/lunar-pangolin-chirp/actions>
2. In the left-hand list, click **Supabase release (migrations + functions + smoke)**.
   (If you do not see it, refresh the page — it appears only after Step 1.)
3. On the right, click the **Run workflow** button, then the green **Run workflow**
   in the small box that opens.
4. Wait. The run takes a few minutes. A yellow dot means "running"; a green tick
   means "done"; a red cross means "stopped at a problem".

The run does the three steps in order:

| Step | What it does |
|---|---|
| 1/3 Apply migrations | `supabase db push` — applies the 6 pending migrations in filename order |
| 2/3 Deploy Edge Functions | `supabase functions deploy` — deploys every function |
| 3/3 Smoke test | Calls every function; fails if any answers 404 (missing) |

### Step 3 — Read the result

At the bottom of the run page there is a **Summary** box. It shows a small
table:

- **1. Migrations applied** — `success`
- **2. Edge Functions deployed** — `success`
- **3. Smoke test (no function returned 404)** — `success`

If all three say **success**, the backend is live.

If any step is not `success`, the release stopped there and the steps after it
did **not** run. Open the red step, read the last few lines (they are written
in plain language), fix the cause, and click **Run workflow** again. Migrations
are safe to re-run.

### Step 4 — Final check

1. Open the site in a private/incognito window: <https://braxelmarkets.vercel.app/>
2. Create a fresh test account and walk through the dashboard and the Tradovate
   card.

The Tradovate connect panel offers **DEMO only** right now (there is no
demo/live selector). Live is disabled on the server by default and is only
turned on later by setting `TRADOVATE_ALLOWED_ENVIRONMENTS=demo,live`. When the
integration is switched off (`TRADOVATE_ENABLED=false`) the panel says it is
"not enabled yet" — that is the kill switch working, not an outage.

---

## Notes for the person maintaining this

- **One-click only.** `supabase-release.yml` is the only workflow with
  `workflow_dispatch`. The push-triggered `deploy-supabase-functions.yml` keeps
  its migration pre-flight safety gate and has **no** manual trigger, so the
  functions can never be deployed twice by clicking around.
- **Schema before code is enforced twice:** the manual release always runs
  `db push` before `functions deploy`, and the automatic workflow *skips* a
  functions deploy whenever the database is not yet at the commit's migration
  head.
- **No secrets in logs.** The workflow checks the three secrets exist but never
  echoes their values; GitHub also masks them.
- **Stop at the first failure.** Each step is its own GitHub step, so a failure
  in step 1 or 2 means step 3 never runs.

---

## Quick troubleshooting

| What you see | What it means | What to do |
|---|---|---|
| "Missing repository secret(s): ..." in red | A secret is not set | Add it under Settings → Secrets and variables → Actions |
| `Deploy Supabase Edge Functions` run finished with a yellow warning "Skipping" | Database was not migrated yet | Expected after Step 1 — run the **Supabase release** workflow (Step 2) |
| Smoke test failed, "MISS <function>" | That function is not deployed | Re-run the **Supabase release** workflow; if it repeats, check the deploy step log |
| You cannot see the "Supabase release" workflow in Actions | It is not on `main` yet | Finish Step 1 (merge), refresh the Actions page |
