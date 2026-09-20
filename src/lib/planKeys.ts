import type { PlanInfo } from '@/components/ApplicationForm';

// The only plan keys the checkout/application flow may act on. Kept identical
// to the server-side list in supabase/functions/_shared/plans.ts.
export const PLAN_KEYS = ['starter', 'professional', 'business', 'enterprise'] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

// Display-only defaults. The server is the source of truth for amounts charged;
// client-provided prices are never trusted (see resolvePlanInfo).
export const PLAN_DEFAULTS: Record<PlanKey, PlanInfo> = {
  starter: { id: 'starter', name: 'Starter', price: 200, priceUSD: 200, accountSize: '25,000', iconType: 'zap' },
  professional: { id: 'professional', name: 'Professional', price: 350, priceUSD: 350, accountSize: '50,000', iconType: 'award' },
  business: { id: 'business', name: 'Business', price: 600, priceUSD: 600, accountSize: '100,000', iconType: 'shield' },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 820, priceUSD: 820, accountSize: '150,000', iconType: 'crown' },
};

export const isPlanKey = (value: unknown): value is PlanKey =>
  typeof value === 'string' && (PLAN_KEYS as readonly string[]).includes(value);

/** Normalize an untrusted `plan` query param. Unknown values fall back to null. */
export const planKeyFromParam = (value: string | null | undefined): PlanKey | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isPlanKey(normalized) ? normalized : null;
};

/**
 * Resolve an untrusted plan payload (router state or query) to a display PlanInfo.
 * Only the known key is honored: the canonical monthly price/amount always come
 * from PLAN_DEFAULTS, so a client-supplied priceUSD can never reach checkout.
 * Localized display fields (name, accountSize, features, icon) may be carried over.
 */
export const resolvePlanInfo = (candidate: unknown): PlanInfo | null => {
  if (!candidate || typeof candidate !== 'object') return null;
  const c = candidate as { id?: unknown; plan_key?: unknown };
  const key = isPlanKey(c.id) ? c.id : isPlanKey(c.plan_key) ? c.plan_key : null;
  if (!key) return null;

  const base = PLAN_DEFAULTS[key];
  const src = candidate as Partial<PlanInfo>;
  return {
    ...base,
    name: typeof src.name === 'string' && src.name ? src.name : base.name,
    accountSize: typeof src.accountSize === 'string' && src.accountSize ? src.accountSize : base.accountSize,
    iconType: typeof src.iconType === 'string' && src.iconType ? src.iconType : base.iconType,
    features: Array.isArray(src.features) ? src.features : base.features,
    popular: src.popular ?? base.popular,
  };
};