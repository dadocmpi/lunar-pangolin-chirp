// ============================================================================
// Credential + integration persistence (service role only).
//
// All reads/writes here run through the service-role client inside an Edge
// Function. The browser never calls these functions and never receives the
// ciphertext. Every write is explicitly scoped to a verified user_id.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  decryptCredentials,
  encryptCredentials,
  isEncryptionConfigured,
} from "./crypto.ts";
import type {
  TradovateCredentials,
  TradovateEnvironment,
} from "./types.ts";

export interface IntegrationRow {
  id: string;
  user_id: string;
  environment: TradovateEnvironment;
  tradovate_account_id: number;
  tradovate_user_id: number | null;
  account_spec: string | null;
  label: string | null;
  status: string;
  last_fill_id: number;
  token_expires_at: string | null;
}

export class CredentialStoreError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "CredentialStoreError";
  }
}

/**
 * Create or update an integration and its encrypted credentials, bound to the
 * verified user_id. Returns the integration id.
 */
export async function upsertIntegrationWithCredentials(
  admin: SupabaseClient,
  input: {
    userId: string;
    environment: TradovateEnvironment;
    tradovateAccountId: number;
    tradovateUserId?: number | null;
    accountSpec?: string | null;
    label?: string | null;
    credentials: TradovateCredentials;
    status?: string;
  },
): Promise<string> {
  if (!isEncryptionConfigured()) {
    throw new CredentialStoreError(
      "encryption_not_configured",
      "TRADOVATE_ENCRYPTION_KEY is not set",
    );
  }
  const secret = Deno.env.get("TRADOVATE_ENCRYPTION_KEY") ?? "";
  const parts = await encryptCredentials(input.credentials, secret);

  const { data: integ, error: integErr } = await admin
    .from("integrations")
    .upsert({
      user_id: input.userId,
      provider: "tradovate",
      environment: input.environment,
      tradovate_account_id: input.tradovateAccountId,
      tradovate_user_id: input.tradovateUserId ?? null,
      account_spec: input.accountSpec ?? null,
      label: input.label ?? null,
      status: input.status ?? "pending",
    }, { onConflict: "user_id,provider,environment,tradovate_account_id" })
    .select("id")
    .single();

  if (integErr || !integ) {
    throw new CredentialStoreError("integration_upsert_failed", integErr?.message);
  }

  const { error: credErr } = await admin
    .from("integration_credentials")
    .upsert({
      integration_id: integ.id,
      ciphertext: parts.ciphertext,
      iv: parts.iv,
      auth_tag: parts.authTag,
      key_version: parts.keyVersion,
    }, { onConflict: "integration_id" });

  if (credErr) {
    throw new CredentialStoreError("credential_upsert_failed", credErr.message);
  }
  return integ.id as string;
}

/** Load and decrypt credentials for an integration the user owns. */
export async function loadCredentials(
  admin: SupabaseClient,
  userId: string,
  integrationId: string,
): Promise<{ integration: IntegrationRow; credentials: TradovateCredentials }> {
  if (!isEncryptionConfigured()) {
    throw new CredentialStoreError("encryption_not_configured");
  }
  const { data: integ, error: integErr } = await admin
    .from("integrations")
    .select(
      "id, user_id, environment, tradovate_account_id, tradovate_user_id, account_spec, label, status, last_fill_id, token_expires_at",
    )
    .eq("id", integrationId)
    .eq("user_id", userId) // ownership enforced even though service role bypasses RLS
    .maybeSingle();

  if (integErr) throw new CredentialStoreError("integration_read_failed", integErr.message);
  if (!integ) throw new CredentialStoreError("integration_not_found");

  const { data: cred, error: credErr } = await admin
    .from("integration_credentials")
    .select("ciphertext, iv, auth_tag, key_version")
    .eq("integration_id", integrationId)
    .maybeSingle();

  if (credErr) throw new CredentialStoreError("credential_read_failed", credErr.message);
  if (!cred) throw new CredentialStoreError("credentials_missing");

  const credentials = await decryptCredentials({
    ciphertext: cred.ciphertext,
    iv: cred.iv,
    authTag: cred.auth_tag,
    keyVersion: cred.key_version,
  }, Deno.env.get("TRADOVATE_ENCRYPTION_KEY") ?? "");

  return { integration: integ as IntegrationRow, credentials };
}

/** List a user's integrations (no credentials). */
export async function listIntegrations(
  admin: SupabaseClient,
  userId: string,
): Promise<IntegrationRow[]> {
  const { data, error } = await admin
    .from("integrations")
    .select(
      "id, user_id, environment, tradovate_account_id, tradovate_user_id, account_spec, label, status, last_fill_id, token_expires_at",
    )
    .eq("user_id", userId)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });
  if (error) throw new CredentialStoreError("integration_list_failed", error.message);
  return (data ?? []) as IntegrationRow[];
}

/**
 * Disconnect: truly delete the credentials and mark the integration revoked.
 * The gate re-triggers on the next login because there is no valid connection.
 */
export async function disconnectIntegration(
  admin: SupabaseClient,
  userId: string,
  integrationId: string,
): Promise<void> {
  // Ownership check first.
  const { data: owned } = await admin
    .from("integrations")
    .select("id")
    .eq("id", integrationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!owned) throw new CredentialStoreError("integration_not_found");

  // Delete the secret material permanently.
  const { error: delErr } = await admin
    .from("integration_credentials")
    .delete()
    .eq("integration_id", integrationId);
  if (delErr) throw new CredentialStoreError("credential_delete_failed", delErr.message);

  const { error: updErr } = await admin
    .from("integrations")
    .update({
      status: "revoked",
      last_error_code: null,
      last_error_message: null,
      token_expires_at: null,
    })
    .eq("id", integrationId)
    .eq("user_id", userId);
  if (updErr) throw new CredentialStoreError("integration_revoke_failed", updErr.message);
}

/** True when the user has at least one non-revoked integration. */
export async function hasConnection(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("integrations")
    .select("id")
    .eq("user_id", userId)
    .neq("status", "revoked")
    .limit(1);
  return (data ?? []).length > 0;
}

/**
 * Has the user EVER had an integration row, including revoked ones?
 *
 * This is what keeps the first-run welcome screen from reappearing after a
 * disconnect: disconnecting soft-deletes (status='revoked') rather than
 * removing the row, so a revoked row means "already welcomed — show the card".
 */
export async function hasAnyIntegration(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("integrations")
    .select("id")
    .eq("user_id", userId)
    .limit(1);
  return (data ?? []).length > 0;
}

/**
 * Has the user dismissed the first-run welcome screen?
 *
 * Server-side (not just localStorage) so the soft gate does not reappear on
 * every login/device.
 *
 * Throws on ANY read failure, including the welcome-state table not existing
 * yet (migration not applied). The caller treats a throw as "cannot confirm
 * the welcome state" and FAILS OPEN to the normal dashboard: the first-run
 * screen is never shown on the strength of a failed read, and a missing table
 * can never produce a blocking state. `false` is returned only on a clean read
 * that genuinely found no skip row.
 */
export async function hasSkippedWelcome(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("tradovate_welcome_state")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new CredentialStoreError("welcome_state_read_failed", error.message);
  }
  return Boolean(data);
}

/** Record the user's "Skip for now" choice for the welcome screen. */
export async function markWelcomeSkipped(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin
    .from("tradovate_welcome_state")
    .upsert({ user_id: userId, skipped_at: new Date().toISOString() }, {
      onConflict: "user_id",
    });
  if (error) throw new CredentialStoreError("welcome_skip_failed", error.message);
}

/** Load a single non-revoked integration the user owns (no credentials). */
export async function getIntegration(
  admin: SupabaseClient,
  userId: string,
  integrationId: string,
): Promise<IntegrationRow | null> {
  const { data, error } = await admin
    .from("integrations")
    .select(
      "id, user_id, environment, tradovate_account_id, tradovate_user_id, account_spec, label, status, last_fill_id, token_expires_at",
    )
    .eq("id", integrationId)
    .eq("user_id", userId)
    .neq("status", "revoked")
    .maybeSingle();
  if (error) throw new CredentialStoreError("integration_read_failed", error.message);
  return (data as IntegrationRow | null) ?? null;
}

export interface SnapshotRow {
  payload: unknown;
  warnings: string[];
  fetched_at: string;
}

/**
 * Read the cached live snapshot for an integration. Returns null when there is
 * no row yet. Throws when the table is missing (migration not applied) so the
 * caller can decide to fetch live instead of pretending it is fresh.
 */
export async function readSnapshot(
  admin: SupabaseClient,
  integrationId: string,
): Promise<SnapshotRow | null> {
  const { data, error } = await admin
    .from("tradovate_account_snapshots")
    .select("payload, warnings, fetched_at")
    .eq("integration_id", integrationId)
    .maybeSingle();
  if (error) throw new CredentialStoreError("snapshot_read_failed", error.message);
  if (!data) return null;
  return {
    payload: data.payload,
    warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : [],
    fetched_at: String(data.fetched_at),
  };
}

/** Persist the live snapshot for an integration (service role only). */
export async function writeSnapshot(
  admin: SupabaseClient,
  integrationId: string,
  payload: unknown,
  warnings: string[],
): Promise<void> {
  const { error } = await admin
    .from("tradovate_account_snapshots")
    .upsert({
      integration_id: integrationId,
      payload,
      warnings,
      fetched_at: new Date().toISOString(),
    }, { onConflict: "integration_id" });
  if (error) throw new CredentialStoreError("snapshot_write_failed", error.message);
}
