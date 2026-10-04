// ============================================================================
// ProtectedRoute — enforces the Tradovate connect gate around the dashboard.
//
// When REQUIRE_TRADOVATE_CONNECTION is ON and the user has no connection, a
// direct visit to /dashboard is redirected to /connect-tradovate. The decision
// itself lives in src/lib/tradovate/guard.ts and is unit-tested.
// ============================================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTradovateConnection } from "@/hooks/useTradovateConnection";
import { CONNECT_GATE_PATH } from "@/lib/tradovate/guard";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { loading, required, connected } = useTradovateConnection(true);

  // Block while loading so a stale direct URL never flashes the dashboard.
  if (required && loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={40} />
      </div>
    );
  }

  if (required && !connected) {
    return (
      <Navigate
        to={CONNECT_GATE_PATH}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
