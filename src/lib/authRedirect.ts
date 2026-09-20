import { planKeyFromParam, type PlanKey } from './planKeys';

export const LOGIN_ROUTE = '/login';
export const REGISTER_APPLICATION_ROUTE = '/register-application';
export const DEFAULT_POST_LOGIN_ROUTE = '/dashboard';

/**
 * Accept only same-origin absolute paths. Rejects absolute URLs
 * (`https://evil`), protocol-relative URLs (`//evil`), backslash tricks and the
 * login route itself (which would create a redirect loop). Query/hash are
 * dropped so a caller can rebuild a clean destination.
 */
export const sanitizeRedirectPath = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  if (value.includes('\\')) return null;
  const path = value.split(/[?#]/)[0];
  if (!path || path === LOGIN_ROUTE) return null;
  return path;
};

/** Build `/login?redirect=<path>&plan=<key>` while keeping only known plan keys. */
export const buildLoginRedirect = (path: unknown, planKey: PlanKey | null): string | null => {
  const target = sanitizeRedirectPath(path);
  if (!target) return null;
  const params = new URLSearchParams({ redirect: target });
  if (planKey) params.set('plan', planKey);
  return `${LOGIN_ROUTE}?${params.toString()}`;
};

/** Destination to continue to after a successful login, preserving the plan. */
export const buildPostLoginDestination = (path: unknown, planKey: PlanKey | null): string | null => {
  const target = sanitizeRedirectPath(path);
  if (!target) return null;
  if (!planKey) return target;
  return `${target}?${new URLSearchParams({ plan: planKey }).toString()}`;
};

/**
 * Resolve both the intended destination and the selected plan from the login
 * query string. Falls back to the application form when only a plan is present,
 * and to the dashboard otherwise.
 */
export const resolveLoginRedirect = (search: string): { target: string; plan: PlanKey | null } => {
  const params = new URLSearchParams(search);
  const plan = planKeyFromParam(params.get('plan'));
  const target = sanitizeRedirectPath(params.get('redirect'));
  if (target) return { target, plan };
  if (plan) return { target: REGISTER_APPLICATION_ROUTE, plan };
  return { target: DEFAULT_POST_LOGIN_ROUTE, plan: null };
};