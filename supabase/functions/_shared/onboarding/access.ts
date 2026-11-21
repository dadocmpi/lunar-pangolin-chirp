// ============================================================================
// Ownership helpers for account-link rows.
//
// The browser never supplies a user id. Every customer handler derives the
// caller from the verified JWT and every read/write is scoped by that id. These
// pure predicates make the rule explicit and unit-testable; the handlers still
// add the `user_id = ctx.user.id` filter to the query itself.
// ============================================================================

export interface OwnedRow {
  user_id?: string | null;
}

/** True only when the row belongs to the requesting user. */
export function ownsRow(requesterId: string | null | undefined, row: OwnedRow | null | undefined): boolean {
  if (!requesterId || !row) return false;
  return row.user_id === requesterId;
}

/** A body/query user id is never trusted; this always yields the JWT user. */
export function resolveOwnerId(jwtUserId: string): string {
  return jwtUserId;
}
