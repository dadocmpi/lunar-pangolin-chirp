import { Navigate, useLocation } from "react-router-dom";
import { resolveCheckoutPlanKey } from "@/lib/checkout";

/**
 * Legacy entry point kept for old links. The single-page checkout at
 * /checkout is the only application flow, so this route forwards the selected
 * plan (router state or ?plan=) instead of rendering a second form.
 */
const RegisterApplication = () => {
  const location = useLocation();
  const planKey = resolveCheckoutPlanKey({
    statePlan: location.state?.plan,
    queryPlan: new URLSearchParams(location.search).get("plan"),
  }) ?? "starter";

  return (
    <Navigate
      to={`/checkout?plan=${planKey}`}
      replace
      state={{ plan: { id: planKey } }}
    />
  );
};

export default RegisterApplication;
