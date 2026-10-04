// ============================================================================
// Account selection for the Tradovate connect flow (pure, server-side).
//
// After a successful login the accounts that belong to the Tradovate user are
// listed. The user never types an account id:
//
//   * exactly one account  -> chosen automatically (no extra click),
//   * several accounts     -> the caller asks the user, preselecting the first
//                             ACTIVE account; if none is active the connection
//                             is refused with an accurate "no active account"
//                             reason,
//   * an explicit id       -> honoured only when it belongs to the login.
//
// Kept free of Deno/Supabase imports so it is unit-testable from Node and Deno.
// ============================================================================

import type { TradovateAccount } from "./types.ts";

export type AccountSelection =
  | { kind: "chosen"; account: TradovateAccount }
  | { kind: "required"; preselectAccountId: number }
  | { kind: "no_accounts" }
  | { kind: "no_active" }
  | { kind: "not_available" }
  | { kind: "invalid_account" };

export function selectAccount(
  accounts: TradovateAccount[],
  requestedAccountId: number | null,
): AccountSelection {
  if (accounts.length === 0) return { kind: "no_accounts" };

  if (requestedAccountId !== null) {
    if (!Number.isFinite(requestedAccountId)) return { kind: "invalid_account" };
    const found = accounts.find((a) => a.id === requestedAccountId);
    return found ? { kind: "chosen", account: found } : { kind: "not_available" };
  }

  if (accounts.length === 1) return { kind: "chosen", account: accounts[0] };

  const active = accounts.find((a) => a.active === true);
  if (!active) return { kind: "no_active" };
  return { kind: "required", preselectAccountId: active.id };
}
