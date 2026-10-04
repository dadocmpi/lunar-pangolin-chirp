# Rollback

Short runbook for the owner. No terminal needed.

## 1. Roll the website back (Vercel)

The site is a static SPA. Rolling back is instant and does not touch the
database.

1. Open <https://vercel.com/dashboard> and select the **braxelmarkets** project.
2. Open the **Deployments** tab.
3. Find the last deployment that was good (the one just before the bad release).
4. Click the **⋯** menu on that deployment → **Promote to Production**.
5. Confirm. Vercel re-points production to that build in a few seconds.

Notes:
- The previous deployment is always kept, so this never requires a rebuild.
- Promotion does not change Edge Functions or the database — see below.

## 2. Disable features without a redeploy (Supabase secrets)

These take effect on the next request; no Vercel deploy and no function
redeploy are needed. Set them in the Supabase website:
**Project → Edge Functions → Secrets**.

- `TRADOVATE_ENABLED=false` — switches the whole Tradovate integration off.
  Connect/data return `503 feature_disabled` and the panel shows "not enabled
  yet" (not an outage). **Unset means enabled**; only the exact string `false`
  disables it.
- `AI_KYC_ENABLED=false` — every KYC check falls back to human manual review
  (fails closed).
- `WITHDRAWAL_KYC_GATE_ENABLED` — leave **unset** in normal operation. Only the
  exact string `false` changes it, and `false` **refuses** withdrawals; it never
  bypasses KYC.
- `TRADOVATE_ALLOWED_ENVIRONMENTS` — leave **unset** for demo-only. Setting
  `demo,live` re-enables live trading later with no code change.

These are runtime switches, so they are the fastest way to stop a misbehaving
feature while keeping the site up.

## 3. Database migrations have NO automatic rollback

`supabase db push` (run by the release workflow) only moves forward. There is no
automatic down-migration.

- **Take a Supabase backup before running the release workflow**
  (Project → Database → Backups, or `pg_dump`). Without a backup there is no
  supported way to undo an applied migration.
- If a migration must be undone, restore from that backup; do not hand-edit the
  database to force a state.
- Migrations are idempotent and safe to re-run, so a partially applied release
  can be re-run rather than reversed.
