-- ============================================================================
-- Tradovate incremental sync schedule.
-- ============================================================================
-- Why this exists
-- ---------------
-- There is no long-lived WebSocket worker. Edge Functions have a hard
-- wall-clock limit, so a `tradovate-stream` function cannot stay alive. The
-- live data path is therefore incremental polling of /fill/list driven by the
-- persisted `integrations.last_fill_id` cursor, with Supabase Realtime pushing
-- the resulting trade/fill diffs to the browser.
--
-- This migration is what keeps that poller alive: a pg_cron job every 2
-- minutes that calls the `tradovate-sync` Edge Function with the service-role
-- bearer token (which selects the scheduled fan-out path in that function).
--
-- It is written to be safe to run on any environment:
--   * if pg_cron or pg_net is not installed/installable, it RAISE NOTICEs and
--     does nothing — the migration still applies and never blocks a deploy,
--   * if the Vault secrets it needs are missing, it also no-ops,
--   * re-running it replaces the previous job instead of duplicating it.
--
-- Required Vault secrets (Supabase Dashboard -> Project Settings -> Vault):
--   project_url       e.g. https://<ref>.supabase.co
--   service_role_key  the project's service_role JWT
-- Set them once, then re-run this migration (or run the cron.schedule call
-- below manually) to activate the schedule.
--
-- Alternative if pg_cron is unavailable: any external scheduler (GitHub
-- Actions cron, a small always-on worker, Supabase Scheduled Functions) that
-- POSTs {} to /functions/v1/tradovate-sync with
-- `Authorization: Bearer <service_role_key>` every 1-2 minutes.
-- ============================================================================

DO $migration$
DECLARE
  has_cron boolean := false;
  has_net  boolean := false;
  have_url boolean := false;
  have_key boolean := false;
BEGIN
  SELECT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron')
    INTO has_cron;
  SELECT EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_net')
    INTO has_net;

  IF NOT (has_cron AND has_net) THEN
    RAISE NOTICE
      'tradovate-sync: pg_cron/pg_net unavailable; schedule NOT created. '
      'Configure an external scheduler to POST /functions/v1/tradovate-sync '
      'with the service-role bearer token every 1-2 minutes.';
    RETURN;
  END IF;

  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    CREATE EXTENSION IF NOT EXISTS pg_net;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'tradovate-sync: could not create pg_cron/pg_net (%); schedule NOT created.', SQLERRM;
    RETURN;
  END;

  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM vault.decrypted_secrets WHERE name = 'project_url'
    ) INTO have_url;
    SELECT EXISTS (
      SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key'
    ) INTO have_key;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'tradovate-sync: Vault not available (%); schedule NOT created.', SQLERRM;
    RETURN;
  END;

  IF NOT (have_url AND have_key) THEN
    RAISE NOTICE
      'tradovate-sync: Vault secrets project_url/service_role_key missing; '
      'schedule NOT created. Add them and re-run this migration.';
    RETURN;
  END IF;

  BEGIN
    PERFORM cron.unschedule('tradovate-sync');
  EXCEPTION WHEN others THEN
    NULL; -- not scheduled yet
  END;

  PERFORM cron.schedule(
    'tradovate-sync',
    '*/2 * * * *',
    $job$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets
              WHERE name = 'project_url') || '/functions/v1/tradovate-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret
                                       FROM vault.decrypted_secrets
                                       WHERE name = 'service_role_key')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 15000
    );
    $job$
  );

  RAISE NOTICE 'tradovate-sync: scheduled every 2 minutes.';
END
$migration$;
