// ============================================================================
// Profile data access for the browser.
//
// Reads go straight to Supabase (RLS restricts every user to their own row).
// Writes go through the profile-submit Edge Function, which re-validates every
// field server-side — the browser is never trusted for validation.
// ============================================================================

import { functionsUrl, supabase } from "@/integrations/supabase/client";
import { normalizeProfile, type ProfileFields } from "./profileValidation";

export interface ProfileRow extends ProfileFields {
  id: string;
  profileCompleted: boolean;
  stripeCustomerId: string | null;
  /** Raw row as returned by Supabase (snake_case). */
  raw: Record<string, unknown>;
}

function fromRow(row: Record<string, unknown>): ProfileRow {
  return {
    id: String(row.id ?? ""),
    fullName: (row.full_name as string) ?? "",
    phoneCountryCode: (row.phone_country_code as string) ?? "",
    phone: (row.phone as string) ?? "",
    country: (row.country as string) ?? "",
    street: (row.street as string) ?? "",
    number: (row.number as string) ?? "",
    complement: (row.complement as string) ?? "",
    city: (row.city as string) ?? "",
    state: (row.state as string) ?? "",
    postalCode: (row.postal_code as string) ?? "",
    profileCompleted: row.profile_completed === true,
    stripeCustomerId: (row.stripe_customer_id as string) ?? null,
    raw: row,
  };
}

const SELECT_COLUMNS =
  "id, full_name, phone_country_code, phone, country, street, number, complement, city, state, postal_code, profile_completed, stripe_customer_id, first_name, last_name";

/** Load the signed-in user's profile, or null when no row exists yet. */
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Record<string, unknown>) : null;
}

export interface SaveProfileResult {
  ok: boolean;
  /** Per-field error codes when the server rejects the payload. */
  fields?: Record<string, string>;
  error?: string;
}

export interface SaveProfileOptions {
  /** Record the Terms acceptance timestamp (only the first one is kept). */
  acceptedTerms?: boolean;
  /** Record the Privacy Policy acceptance timestamp. */
  acceptedPrivacy?: boolean;
}

/** Persist the profile through the validating Edge Function. */
export async function saveProfile(
  fields: ProfileFields,
  options: SaveProfileOptions = {},
): Promise<SaveProfileResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { ok: false, error: "unauthorized" };

  const payload = {
    ...normalizeProfile(fields),
    acceptedTerms: options.acceptedTerms === true,
    acceptedPrivacy: options.acceptedPrivacy === true,
  };

  const res = await fetch(functionsUrl("profile-submit"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: json?.error ?? `http_${res.status}`,
      fields: json?.fields,
    };
  }
  return { ok: true };
}

/** True when every required field is present. Used by the checkout guard. */
export function isProfileComplete(profile: ProfileRow | null): boolean {
  return profile?.profileCompleted === true;
}
