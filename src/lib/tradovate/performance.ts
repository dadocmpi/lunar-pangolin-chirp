// Re-export the canonical isomorphic performance engine so the browser and the
// Edge Function compute identical statistics. The source of truth lives under
// supabase/functions/_shared/tradovate/performance.ts and has no runtime-
// specific APIs.
export * from "../../../supabase/functions/_shared/tradovate/performance.ts";
