// ============================================================================
// Server-side profile validation.
//
// The client validates the same fields (src/lib/profileValidation.ts) for a
// friendly UX, but the server NEVER trusts the browser: every field is
// re-validated here before it is written to public.profiles. `npm run
// check:profile` asserts the two rule sets stay in sync.
//
// Pure and dependency-free apart from the country-code set, so it can be
// unit-tested without Deno.env or a database.
// ============================================================================

import { isKnownCountryCode } from "./countries.ts";

export interface ProfilePayload {
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

export type ProfileErrorCode =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_phone_code"
  | "invalid_phone"
  | "invalid_country"
  | "invalid_postal_code";

export type ProfileErrors = Partial<Record<keyof ProfilePayload, ProfileErrorCode>>;

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

export function validateProfile(input: Record<string, unknown>): {
  ok: boolean;
  errors: ProfileErrors;
  value: ProfilePayload;
} {
  const errors: ProfileErrors = {};

  const fullName = trimmed(input.fullName);
  if (!fullName) errors.fullName = "required";
  else if (fullName.length < PROFILE_LIMITS.fullNameMin) errors.fullName = "too_short";
  else if (fullName.length > PROFILE_LIMITS.fullNameMax) errors.fullName = "too_long";

  const phoneCountryCode = trimmed(input.phoneCountryCode);
  if (!phoneCountryCode) errors.phoneCountryCode = "required";
  else if (!DIAL_CODE_RE.test(phoneCountryCode)) errors.phoneCountryCode = "invalid_phone_code";

  const phone = trimmed(input.phone);
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

  const country = trimmed(input.country).toUpperCase();
  if (!country) errors.country = "required";
  else if (!isKnownCountryCode(country)) errors.country = "invalid_country";

  const street = trimmed(input.street);
  if (!street) errors.street = "required";
  else if (street.length > PROFILE_LIMITS.streetMax) errors.street = "too_long";

  const number = trimmed(input.number);
  if (!number) errors.number = "required";
  else if (number.length > PROFILE_LIMITS.numberMax) errors.number = "too_long";

  const complement = trimmed(input.complement);
  if (complement.length > PROFILE_LIMITS.complementMax) errors.complement = "too_long";

  const city = trimmed(input.city);
  if (!city) errors.city = "required";
  else if (city.length > PROFILE_LIMITS.textMax) errors.city = "too_long";

  const state = trimmed(input.state);
  if (!state) errors.state = "required";
  else if (state.length > PROFILE_LIMITS.textMax) errors.state = "too_long";

  const postalCode = trimmed(input.postalCode);
  if (!postalCode) errors.postalCode = "required";
  else if (
    postalCode.length < PROFILE_LIMITS.postalCodeMin ||
    postalCode.length > PROFILE_LIMITS.postalCodeMax ||
    !POSTAL_RE.test(postalCode)
  ) {
    errors.postalCode = "invalid_postal_code";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: {
      fullName,
      phoneCountryCode,
      phone,
      country,
      street,
      number,
      complement,
      city,
      state,
      postalCode,
    },
  };
}

/** The profiles row shape written by the Edge Function. */
export function toProfileRow(payload: ProfilePayload, userId: string) {
  return {
    id: userId,
    full_name: payload.fullName,
    phone_country_code: payload.phoneCountryCode,
    phone: payload.phone,
    country: payload.country,
    street: payload.street,
    number: payload.number,
    complement: payload.complement || null,
    city: payload.city,
    state: payload.state,
    postal_code: payload.postalCode,
    profile_completed: true,
  };
}
