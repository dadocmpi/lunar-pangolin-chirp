// ============================================================================
// Client-side profile validation.
//
// Pure functions — no I/O, no React — so they can be unit-tested and reused by
// both the two-step signup and the "My profile" editor. The server re-validates
// every field in supabase/functions/_shared/profile/validation.ts; the two must
// agree, and `npm run check:profile` enforces the parity.
//
// Error codes (not sentences) are returned so each UI string is localized.
// ============================================================================

import { isKnownCountryCode } from "./countries";

export interface ProfileFields {
  fullName: string;
  phoneCountryCode: string;
  phone: string;
  country: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  postalCode: string;
}

export type ProfileFieldKey = keyof ProfileFields;

export type ProfileErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_phone_code"
  | "invalid_phone"
  | "invalid_country"
  | "invalid_postal_code";

export type ProfileErrors = Partial<Record<ProfileFieldKey, ProfileErrorCode>>;

export const PROFILE_LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  phoneMin: 4,
  phoneMax: 20,
  phoneDigitsMin: 6,
  phoneDigitsMax: 15,
  textMax: 120,
  streetMax: 200,
  numberMax: 20,
  complementMax: 200,
  postalCodeMin: 3,
  postalCodeMax: 12,
} as const;

const DIAL_CODE_RE = /^\+[0-9]{1,4}$/;
// The national number is stored without the dial code: allow digits and the
// usual separators (spaces, parentheses, dash, dot) but no letters or a leading
// "+". The real check is the digit count, so "(11) 91234-5678" is accepted.
const PHONE_ALLOWED_RE = /^[0-9 ().-]+$/;
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,}$/;

function digitCount(value: string): number {
  let n = 0;
  for (const ch of value) if (ch >= "0" && ch <= "9") n++;
  return n;
}

function trimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Validate every field. Returns an empty object when the profile is complete. */
export function validateProfile(fields: Partial<ProfileFields>): ProfileErrors {
  const errors: ProfileErrors = {};

  const fullName = trimmed(fields.fullName);
  if (!fullName) errors.fullName = "required";
  else if (fullName.length < PROFILE_LIMITS.fullNameMin) errors.fullName = "too_short";
  else if (fullName.length > PROFILE_LIMITS.fullNameMax) errors.fullName = "too_long";

  const dial = trimmed(fields.phoneCountryCode);
  if (!dial) errors.phoneCountryCode = "required";
  else if (!DIAL_CODE_RE.test(dial)) errors.phoneCountryCode = "invalid_phone_code";

  const phone = trimmed(fields.phone);
  if (!phone) errors.phone = "required";
  else if (
    phone.length < PROFILE_LIMITS.phoneMin ||
    phone.length > PROFILE_LIMITS.phoneMax ||
    !PHONE_ALLOWED_RE.test(phone) ||
    digitCount(phone) < PROFILE_LIMITS.phoneDigitsMin ||
    digitCount(phone) > PROFILE_LIMITS.phoneDigitsMax
  ) {
    errors.phone = "invalid_phone";
  }

  const country = trimmed(fields.country);
  if (!country) errors.country = "required";
  else if (!isKnownCountryCode(country)) errors.country = "invalid_country";

  const street = trimmed(fields.street);
  if (!street) errors.street = "required";
  else if (street.length > PROFILE_LIMITS.streetMax) errors.street = "too_long";

  const number = trimmed(fields.number);
  if (!number) errors.number = "required";
  else if (number.length > PROFILE_LIMITS.numberMax) errors.number = "too_long";

  const complement = trimmed(fields.complement);
  if (complement.length > PROFILE_LIMITS.complementMax) errors.complement = "too_long";

  const city = trimmed(fields.city);
  if (!city) errors.city = "required";
  else if (city.length > PROFILE_LIMITS.textMax) errors.city = "too_long";

  const state = trimmed(fields.state);
  if (!state) errors.state = "required";
  else if (state.length > PROFILE_LIMITS.textMax) errors.state = "too_long";

  const postalCode = trimmed(fields.postalCode);
  if (!postalCode) errors.postalCode = "required";
  else if (
    postalCode.length < PROFILE_LIMITS.postalCodeMin ||
    postalCode.length > PROFILE_LIMITS.postalCodeMax ||
    !POSTAL_RE.test(postalCode)
  ) {
    errors.postalCode = "invalid_postal_code";
  }

  return errors;
}

/** True when there is at least one error. */
export function hasProfileErrors(errors: ProfileErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Normalise a raw object (e.g. a profiles row) into the form field shape. */
export function toProfileFields(row: Record<string, unknown> | null | undefined): ProfileFields {
  const get = (k: string) => (typeof row?.[k] === "string" ? (row[k] as string) : "");
  return {
    fullName: get("full_name"),
    phoneCountryCode: get("phone_country_code"),
    phone: get("phone"),
    country: get("country"),
    street: get("street"),
    number: get("number"),
    complement: get("complement"),
    city: get("city"),
    state: get("state"),
    postalCode: get("postal_code"),
  };
}

/** Trim every field before it is sent to the server. */
export function normalizeProfile(fields: ProfileFields): ProfileFields {
  return {
    fullName: fields.fullName.trim(),
    phoneCountryCode: fields.phoneCountryCode.trim(),
    phone: fields.phone.trim(),
    country: fields.country.trim().toUpperCase(),
    street: fields.street.trim(),
    number: fields.number.trim(),
    complement: fields.complement.trim(),
    city: fields.city.trim(),
    state: fields.state.trim(),
    postalCode: fields.postalCode.trim(),
  };
}
