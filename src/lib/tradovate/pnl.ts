// Re-export the canonical isomorphic PnL engine so the browser and the Edge
// Function share one implementation. The source of truth lives under
// supabase/functions/_shared/tradovate/pnl.ts and has no runtime-specific APIs.
export * from "../../../supabase/functions/_shared/tradovate/pnl.ts";
