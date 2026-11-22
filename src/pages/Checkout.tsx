"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import CheckoutStatusBadge from "@/components/CheckoutStatusBadge";
import { PaymentsDisabledNotice } from "@/components/PaymentsDisabledNotice";
import CheckoutNotice from "@/components/checkout/CheckoutNotice";
import PlanSummaryCard from "@/components/checkout/PlanSummaryCard";
import CheckoutCustomerForm from "@/components/checkout/CheckoutCustomerForm";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import CardPaymentPanel from "@/components/checkout/CardPaymentPanel";
import CryptoPaymentPanel from "@/components/checkout/CryptoPaymentPanel";
import BankTransferPanel from "@/components/checkout/BankTransferPanel";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { notifyOwner } from "@/lib/notifyOwner";
import { PLAN_PRICING } from "@/lib/plans";
import { isPaymentsEnabled, isTestPaymentMode } from "@/lib/paymentsFlag";
import { fetchProfile, saveProfile } from "@/lib/profile";
import { usePaymentStatus, type CheckoutPaymentStatus } from "@/hooks/usePaymentStatus";
import {
  checkoutErrorKey,
  configuredCryptoNetworks,
  defaultMethod,
  EMPTY_CHECKOUT_CUSTOMER,
  fetchCheckoutConfig,
  paymentStatusNotice,
  prefillCheckoutCustomer,
  resolveCheckoutPlanKey,
  resolveMethodAvailability,
  toBillingPayload,
  validateCheckoutCustomer,
  type CheckoutBillingPayload,
  type CheckoutConfig,
  type CheckoutCustomerFields,
  type CheckoutErrors,
  type CheckoutFieldKey,
  type CheckoutMethodId,
  type CheckoutResponse,
} from "@/lib/checkout";

interface ApplicationRecord {
  id: string;
  user_id: string;
  plan_key: string;
  plan_name?: string | null;
  email?: string | null;
}

class CheckoutCallError extends Error {
  code: string;
  paymentId: string | null;
  constructor(code: string, paymentId: string | null = null) {
    super(code);
    this.name = "CheckoutCallError";
    this.code = code;
    this.paymentId = paymentId;
  }
}

function newIdempotencyKey(): string {
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

const BADGE_STATUSES: CheckoutPaymentStatus[] = [
  "created",
  "pending",
  "processing",
  "confirmed",
  "failed",
  "rejected",
  "refunded",
  "disputed",
  "canceled",
  "pending_manual",
];

/** The badge only accepts canonical statuses; unknown provider values are ignored. */
function badgeStatus(value: string | null | undefined): CheckoutPaymentStatus | null {
  return value && (BADGE_STATUSES as string[]).includes(value)
    ? (value as CheckoutPaymentStatus)
    : null;
}

const FIELD_ELEMENT_IDS: Partial<Record<CheckoutFieldKey, string>> = {
  firstName: "checkout-firstName",
  lastName: "checkout-lastName",
  email: "checkout-email",
  phoneCountryCode: "checkout-phoneCountryCode",
  phone: "checkout-phone",
  country: "checkout-country",
  street: "checkout-street",
  number: "checkout-number",
  complement: "checkout-complement",
  city: "checkout-city",
  state: "checkout-state",
  postalCode: "checkout-postalCode",
};

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const testMode = isTestPaymentMode();
  const paymentsEnabled = isPaymentsEnabled();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [fields, setFields] = useState<CheckoutCustomerFields>(EMPTY_CHECKOUT_CUSTOMER);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [updateProfile, setUpdateProfile] = useState(false);
  const [initialIncomplete, setInitialIncomplete] = useState(false);

  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [configUnavailable, setConfigUnavailable] = useState(false);
  const [method, setMethod] = useState<CheckoutMethodId | null>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState<string | null>(null);

  const [busyMethod, setBusyMethod] = useState<CheckoutMethodId | null>(null);
  const [responses, setResponses] = useState<Partial<Record<CheckoutMethodId, CheckoutResponse>>>({});
  const [methodErrors, setMethodErrors] = useState<Partial<Record<CheckoutMethodId, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [consent, setConsent] = useState({ terms: false, privacy: false });
  const [consentError, setConsentError] = useState<string | null>(null);

  const keysRef = useRef<Partial<Record<CheckoutMethodId, string>>>({});
  const ensuredApplicationRef = useRef<string | null>(null);
  const statePlan = (location.state as { plan?: unknown } | null)?.plan;
  const resolvedPlanKey = resolveCheckoutPlanKey({
    statePlan,
    queryPlan: new URLSearchParams(location.search).get("plan"),
  });

  const { view: serverStatus } = usePaymentStatus(
    paymentsEnabled ? paymentId : null,
    4000,
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!authUser) {
        // Return to the exact plan after login. The query string survives the
        // round-trip; the router state keeps the first render instant.
        const returnTo = resolvedPlanKey
          ? `/checkout?plan=${resolvedPlanKey}`
          : "/pricing";
        navigate("/login", {
          state: { from: returnTo, plan: statePlan },
          replace: true,
        });
        return;
      }
      if (!resolvedPlanKey) {
        setLoading(false);
        return;
      }

      // A previous application for this plan may exist; it is only a prefill
      // fallback. The authoritative create-or-reuse happens server-side in
      // application-ensure when the customer actually starts a payment.
      let app: ApplicationRecord | null = null;
      const { data, error } = await supabase
        .from("applications")
        .select("id, user_id, plan_key, plan_name, email")
        .eq("user_id", authUser.id)
        .eq("plan_key", resolvedPlanKey)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) app = data as ApplicationRecord;
      if (cancelled) return;
      setApplication(app);
      ensuredApplicationRef.current = null;

      let profileRaw: Record<string, unknown> | null = null;
      try {
        const profile = await fetchProfile(authUser.id);
        profileRaw = profile?.raw ?? null;
      } catch (profileErr) {
        // Fail open: a profile read error must not block a paying customer.
        console.error("Checkout profile prefill failed:", profileErr);
      }
      if (cancelled) return;

      const prefilled = prefillCheckoutCustomer({
        profile: profileRaw,
        application: app as unknown as Record<string, unknown>,
        authEmail: authUser.email,
        authFullName: (authUser.user_metadata?.full_name as string) ?? null,
      });
      setFields(prefilled);
      setInitialIncomplete(!validateCheckoutCustomer(prefilled).ok);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate, resolvedPlanKey, statePlan]);

  // Provider availability is server-driven. When the endpoint is unreachable we
  // keep every method selectable; the payment functions still enforce the real
  // destination and fail closed, so no unsupported payment can be created.
  useEffect(() => {
    if (!paymentsEnabled) return;
    let cancelled = false;
    (async () => {
      const fetched = await fetchCheckoutConfig();
      if (cancelled) return;
      setConfig(fetched);
      setConfigUnavailable(fetched === null);
      setMethod((current) => {
        if (current && resolveMethodAvailability(fetched, current).available) return current;
        return defaultMethod(fetched) ?? current ?? "card";
      });
      const networks = configuredCryptoNetworks(fetched);
      setCryptoNetwork((current) =>
        current && networks.some((n) => n.id === current) ? current : networks[0]?.id ?? null
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentsEnabled]);

  // The plan selector comes from the URL/state; the server re-derives the
  // canonical plan, price and currency from its own table.
  const planKey = resolvedPlanKey;
  const planIsKnown = planKey !== null;

  const enhancedPlan = useMemo(() => {
    if (!planKey) return null;
    return {
      id: planKey,
      name: application?.plan_name ||
        t(`plans.${planKey}`, {
          defaultValue: planKey.charAt(0).toUpperCase() + planKey.slice(1),
        }),
      amountUsd: PLAN_PRICING[planKey].monthlyUsd,
    };
  }, [application?.plan_name, planKey, t]);

  const statusNotice = serverStatus
    ? paymentStatusNotice(serverStatus.status, method)
    : null;
  const confirmed = serverStatus?.status === "confirmed";
  const availableNetworks = configuredCryptoNetworks(config);

  const handleFieldChange = (field: CheckoutFieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const focusFirstError = (nextErrors: CheckoutErrors) => {
    const firstKey = Object.keys(nextErrors)[0] as CheckoutFieldKey | undefined;
    const elementId = firstKey ? FIELD_ELEMENT_IDS[firstKey] : undefined;
    if (elementId) document.getElementById(elementId)?.focus();
  };

  /**
   * Create-or-reuse the application for this plan server-side. The function
   * scopes everything to the JWT user, validates the plan against the server
   * table and never trusts a client price/currency. The id is cached for this
   * checkout session so a retry cannot create a second application.
   */
  const ensureApplication = async (billing: CheckoutBillingPayload): Promise<string> => {
    if (!resolvedPlanKey) throw new CheckoutCallError("invalid_plan");
    if (ensuredApplicationRef.current) return ensuredApplicationRef.current;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new CheckoutCallError("unauthorized");
    const res = await fetch(functionsUrl("application-ensure"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planKey: resolvedPlanKey,
        billing,
        termsAccepted: consent.terms,
        privacyAccepted: consent.privacy,
      }),
    });
    const json = await res.json().catch(() => ({}));
    const applicationId = typeof json?.application_id === "string"
      ? json.application_id
      : null;
    if (!res.ok || !applicationId) {
      throw new CheckoutCallError(
        typeof json?.error === "string" ? json.error : `http_${res.status}`,
      );
    }
    ensuredApplicationRef.current = applicationId;
    return applicationId;
  };

  interface PreparedCheckout {
    billing: CheckoutBillingPayload;
    applicationId: string;
    planKey: NonNullable<typeof resolvedPlanKey>;
  }

  const prepareBilling = async (): Promise<PreparedCheckout | null> => {
    if (!resolvedPlanKey) return null;
    const validation = validateCheckoutCustomer(fields);
    setErrors(validation.errors);
    if (!validation.ok) {
      setSubmitError(t("checkoutPage.errors.invalidAddress"));
      focusFirstError(validation.errors);
      return null;
    }
    if (!consent.terms) {
      setConsentError(t("application.errors.terms_required"));
      document.getElementById("checkout-consent-terms")?.focus();
      return null;
    }
    if (!consent.privacy) {
      setConsentError(t("application.errors.privacy_required"));
      document.getElementById("checkout-consent-privacy")?.focus();
      return null;
    }
    setConsentError(null);
    if (updateProfile) {
      try {
        await saveProfile({ ...validation.value, fullName: validation.fullName });
      } catch (profileErr) {
        console.error("Profile update from checkout failed:", profileErr);
      }
    }
    const billing = toBillingPayload(validation.value, validation.fullName);
    const applicationId = await ensureApplication(billing);
    return { billing, applicationId, planKey: resolvedPlanKey };
  };

  const callEdgeFunction = async (
    fn: "stripe-checkout" | "crypto-checkout" | "wise-checkout",
    body: Record<string, unknown>,
  ): Promise<CheckoutResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new CheckoutCallError("unauthorized");
    const res = await fetch(functionsUrl(fn), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new CheckoutCallError(
        typeof json?.error === "string" ? json.error : `http_${res.status}`,
        typeof json?.payment_id === "string" ? json.payment_id : null,
      );
    }
    return json as CheckoutResponse;
  };

  const handleCheckoutError = async (which: CheckoutMethodId, err: unknown) => {
    const code = err instanceof CheckoutCallError
      ? err.code
      : err instanceof Error
      ? err.message
      : "unknown";
    setMethodErrors((prev) => ({ ...prev, [which]: t(checkoutErrorKey(code)) }));
    if (err instanceof CheckoutCallError && err.paymentId) {
      setPaymentId(err.paymentId);
    }
    await notifyOwner({
      type: "erro",
      subject: "Falha ao iniciar checkout",
      replyTo: fields.email || null,
      data: {
        plano: resolvedPlanKey,
        email: fields.email || null,
        metodo: which,
        erro: code,
        origem: "checkout",
      },
    });
  };

  const idempotencyKey = (which: CheckoutMethodId): string => {
    if (!keysRef.current[which]) keysRef.current[which] = newIdempotencyKey();
    return keysRef.current[which] as string;
  };

  const beginCheckout = (which: CheckoutMethodId) => {
    setBusyMethod(which);
    setSubmitError(null);
    setMethodErrors((prev) => ({ ...prev, [which]: undefined }));
  };

  const handleCard = async () => {
    if (busyMethod) return;
    beginCheckout("card");
    try {
      const prepared = await prepareBilling();
      if (!prepared) return;
      const res = await callEdgeFunction("stripe-checkout", {
        planId: prepared.planKey,
        applicationId: prepared.applicationId,
        currency: "USD",
        idempotencyKey: idempotencyKey("card"),
        isTest: testMode,
        billing: prepared.billing,
      });
      setResponses((prev) => ({ ...prev, card: res }));
      if (res.pending_payment_id) setPaymentId(res.pending_payment_id);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setMethodErrors((prev) => ({ ...prev, card: t("checkoutPage.errors.generic") }));
      }
    } catch (err) {
      await handleCheckoutError("card", err);
    } finally {
      setBusyMethod(null);
    }
  };

  const handleCrypto = async () => {
    if (busyMethod) return;
    if (!cryptoNetwork) {
      setMethodErrors((prev) => ({
        ...prev,
        crypto: t("checkoutPage.errors.unsupportedMethod"),
      }));
      return;
    }
    beginCheckout("crypto");
    try {
      const prepared = await prepareBilling();
      if (!prepared) return;
      const res = await callEdgeFunction("crypto-checkout", {
        planId: prepared.planKey,
        applicationId: prepared.applicationId,
        currency: "USD",
        network: cryptoNetwork,
        idempotencyKey: idempotencyKey("crypto"),
        isTest: testMode,
        billing: prepared.billing,
      });
      setResponses((prev) => ({ ...prev, crypto: res }));
      if (res.payment?.id) setPaymentId(res.payment.id);
    } catch (err) {
      await handleCheckoutError("crypto", err);
    } finally {
      setBusyMethod(null);
    }
  };

  const handleBank = async () => {
    if (busyMethod) return;
    beginCheckout("bank");
    try {
      const prepared = await prepareBilling();
      if (!prepared) return;
      const res = await callEdgeFunction("wise-checkout", {
        planId: prepared.planKey,
        applicationId: prepared.applicationId,
        currency: "USD",
        idempotencyKey: idempotencyKey("bank"),
        isTest: testMode,
        billing: prepared.billing,
      });
      setResponses((prev) => ({ ...prev, bank: res }));
      if (res.payment?.id) setPaymentId(res.payment.id);
    } catch (err) {
      await handleCheckoutError("bank", err);
    } finally {
      setBusyMethod(null);
    }
  };

  const handleMethodChange = (next: CheckoutMethodId) => {
    if (!resolveMethodAvailability(config, next).available) return;
    setMethod(next);
    setSubmitError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070A]">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} aria-hidden="true" />
        <span className="sr-only">{t("checkout.loading")}</span>
      </div>
    );
  }

  if (!paymentsEnabled) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
        <Navbar />
        <div className="container mx-auto px-4 pb-20 pt-[140px] md:px-8">
          <Link
            to="/pricing"
            className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
          >
            <ArrowLeft size={14} aria-hidden="true" /> {t("nav.pricing")}
          </Link>
          <PaymentsDisabledNotice />
        </div>
        <Footer />
      </div>
    );
  }

  if (!planIsKnown || !enhancedPlan) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
        <Navbar />
        <div className="container mx-auto px-4 pb-20 pt-[140px] md:px-8">
          <div className="max-w-xl border border-white/10 bg-[#080B12] p-8">
            <h1 className="mb-4 text-lg font-bold uppercase tracking-widest text-[#E4C88B]">
              {t("checkout.invalidPlanTitle")}
            </h1>
            <p className="mb-8 text-[11px] leading-relaxed text-slate-400">
              {t("checkout.invalidPlanDesc")}
            </p>
            <Button asChild className="h-12 rounded-none bg-[#C5A059] px-6 text-[11px] font-black uppercase tracking-[0.2em] text-[#05070A] hover:bg-[#C5A059]/85">
              <Link to="/pricing">{t("nav.pricing")}</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeError = method ? methodErrors[method] : null;

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <main className="container mx-auto px-4 pb-20 pt-[140px] md:px-8">
        <Link
          to="/pricing"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> {t("checkoutSuccess.backToPricing")}
        </Link>

        <header className="mb-10 max-w-2xl">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059]">
            {t("checkoutPage.eyebrow")}
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
            {t("checkoutPage.title")}
          </h1>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            {t("checkoutPage.subtitle")}
          </p>
        </header>

        {testMode && (
          <div className="mb-8 flex items-center gap-3 border-2 border-yellow-500/60 bg-yellow-500/10 p-4 text-[10px] font-bold uppercase tracking-widest text-yellow-300">
            <ShieldAlert size={18} aria-hidden="true" />
            {t("checkout.testModeBanner")}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <PlanSummaryCard
              planName={enhancedPlan.name}
              amountUsd={enhancedPlan.amountUsd}
              currency="USD"
            />
          </div>

          <div className="space-y-8 lg:col-span-7">
            {configUnavailable && (
              <CheckoutNotice tone="warning">
                {t("checkoutPage.configUnavailable")}
              </CheckoutNotice>
            )}

            {paymentId && (
              <section
                aria-labelledby="checkout-status-title"
                className="space-y-3 border border-white/10 bg-[#080B12] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    id="checkout-status-title"
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"
                  >
                    {t("checkoutSuccess.currentStatus")}
                  </h2>
                  {serverStatus?.status && (
                    <CheckoutStatusBadge status={serverStatus.status} />
                  )}
                </div>
                {statusNotice && (
                  <CheckoutNotice tone={statusNotice.tone}>
                    {t(statusNotice.key)}
                  </CheckoutNotice>
                )}
                <p className="break-all text-[9px] uppercase tracking-widest text-slate-600">
                  {t("checkoutSuccess.paymentId")}: {paymentId}
                </p>
                {confirmed && (
                  <Button
                    asChild
                    className="h-12 w-full rounded-none bg-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] text-[#05070A] hover:bg-[#C5A059]/85 sm:w-auto"
                  >
                    <Link to="/dashboard">{t("checkoutPage.confirmedCta")}</Link>
                  </Button>
                )}
              </section>
            )}

            {!confirmed && (
              <>
                {initialIncomplete && !submitError && (
                  <CheckoutNotice tone="warning">
                    {t("checkoutPage.missingFieldsNote")}
                  </CheckoutNotice>
                )}

                {submitError && (
                  <CheckoutNotice tone="error">{submitError}</CheckoutNotice>
                )}

                <section className="border border-white/10 bg-[#080B12] p-5 md:p-7">
                  <CheckoutCustomerForm
                    fields={fields}
                    errors={errors}
                    updateProfile={updateProfile}
                    onChange={handleFieldChange}
                    onUpdateProfileChange={setUpdateProfile}
                  />
                </section>

                <section
                  aria-labelledby="checkout-consent-title"
                  className="space-y-4 border border-white/10 bg-[#080B12] p-5 md:p-7"
                >
                  <h2
                    id="checkout-consent-title"
                    className="text-[11px] font-bold uppercase tracking-[0.3em] text-white"
                  >
                    {t("checkoutPage.consentTitle")}
                  </h2>
                  <label className="flex items-start gap-3">
                    <Checkbox
                      id="checkout-consent-terms"
                      checked={consent.terms}
                      onCheckedChange={(value) => {
                        setConsent((prev) => ({ ...prev, terms: value === true }));
                        setConsentError(null);
                      }}
                      aria-invalid={Boolean(consentError)}
                      aria-describedby={consentError ? "checkout-consent-error" : undefined}
                      className="mt-0.5 border-white/20 data-[state=checked]:border-[#C5A059] data-[state=checked]:bg-[#C5A059]"
                    />
                    <span className="text-[10px] leading-relaxed text-slate-400">
                      {t("application.terms_accepted")}{" "}
                      <Link to="/terms" className="text-[#C5A059] underline">
                        {t("application.viewTerms")}
                      </Link>
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <Checkbox
                      id="checkout-consent-privacy"
                      checked={consent.privacy}
                      onCheckedChange={(value) => {
                        setConsent((prev) => ({ ...prev, privacy: value === true }));
                        setConsentError(null);
                      }}
                      aria-invalid={Boolean(consentError)}
                      aria-describedby={consentError ? "checkout-consent-error" : undefined}
                      className="mt-0.5 border-white/20 data-[state=checked]:border-[#C5A059] data-[state=checked]:bg-[#C5A059]"
                    />
                    <span className="text-[10px] leading-relaxed text-slate-400">
                      {t("application.privacy_accepted")}{" "}
                      <Link to="/privacy" className="text-[#C5A059] underline">
                        {t("application.viewPrivacy")}
                      </Link>
                    </span>
                  </label>
                  {consentError && (
                    <p
                      id="checkout-consent-error"
                      role="alert"
                      className="text-[10px] font-bold uppercase tracking-widest text-red-400"
                    >
                      {consentError}
                    </p>
                  )}
                </section>

                <section className="space-y-5 border border-white/10 bg-[#080B12] p-5 md:p-7">
                  <PaymentMethodSelector
                    config={config}
                    value={method}
                    onChange={handleMethodChange}
                  />

                  {method === "card" && (
                    <CardPaymentPanel
                      busy={busyMethod === "card"}
                      disabled={!resolveMethodAvailability(config, "card").available}
                      onContinue={handleCard}
                    />
                  )}

                  {method === "crypto" && (
                    <CryptoPaymentPanel
                      networks={availableNetworks}
                      selectedNetwork={cryptoNetwork}
                      onSelectNetwork={setCryptoNetwork}
                      onCreate={handleCrypto}
                      busy={busyMethod === "crypto"}
                      disabled={!resolveMethodAvailability(config, "crypto").available}
                      response={responses.crypto ?? null}
                      status={badgeStatus(serverStatus?.status ?? responses.crypto?.payment?.status)}
                    />
                  )}

                  {method === "bank" && (
                    <BankTransferPanel
                      onCreate={handleBank}
                      busy={busyMethod === "bank"}
                      disabled={!resolveMethodAvailability(config, "bank").available}
                      response={responses.bank ?? null}
                      status={badgeStatus(serverStatus?.status ?? responses.bank?.payment?.status)}
                    />
                  )}

                  {activeError && <CheckoutNotice tone="error">{activeError}</CheckoutNotice>}

                  <p className="flex items-start gap-2 border border-dashed border-white/10 p-3 text-[9px] uppercase leading-relaxed tracking-widest text-slate-600">
                    <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                    {t("checkoutPage.serverTruthNote")}
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
