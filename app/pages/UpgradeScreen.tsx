import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check } from "lucide-react";

import { useAuth } from "~/lib/auth";
import {
  invokeStripeCheckout,
  StripeInvokeError,
} from "~/lib/functions/stripe";
import { supabase } from "~/lib/supabase";

export function UpgradeScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, user, profile, refreshProfile, signInWithGoogle } =
    useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [ctaLoading, setCtaLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);

  const completed =
    profile?.lifetime_completions_count ?? 0;
  const phase = profile?.subscription_phase ?? "freemium";

  const proofLine =
    phase === "trialing"
      ? `In 14 days, you completed ${completed} tasks.`
      : `${completed} tasks completed so far — unlock unlimited + calendar.`;

  const isCheckoutSuccess = params.get("checkout") === "success";

  const pollUntilPaid = useCallback(async () => {
    if (!user?.id) return;
    setSyncPending(true);
    for (let i = 0; i < 30; i++) {
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .maybeSingle();
      const st = data?.subscription_status as string | undefined;
      if (st === "paid" || st === "trialing") {
        await refreshProfile();
        setSyncPending(false);
        navigate("/app", { replace: true });
        return;
      }
      await new Promise((r) => setTimeout(r, 1200));
      await refreshProfile();
    }
    setSyncPending(false);
  }, [user?.id, refreshProfile, navigate]);

  useEffect(() => {
    if (!isCheckoutSuccess || !user?.id) return;
    void pollUntilPaid();
  }, [isCheckoutSuccess, user?.id, pollUntilPaid]);

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (user?.is_anonymous === true) {
      await signInWithGoogle();
      return;
    }
    setCtaLoading(true);
    try {
      const origin = window.location.origin;
      const { url } = await invokeStripeCheckout(session, {
        price_key: selectedPlan,
        success_url: `${origin}/app/upgrade?checkout=success`,
        cancel_url: `${origin}/app/upgrade?checkout=cancel`,
      });
      window.location.href = url;
    } catch (e) {
      if (e instanceof StripeInvokeError) {
        setCheckoutError(
          e.code === "SERVER_CONFIG"
            ? "Checkout isn’t configured yet."
            : "Couldn’t start checkout. Try again in a few seconds.",
        );
      } else {
        setCheckoutError(
          "Couldn’t start checkout. Try again in a few seconds.",
        );
      }
    } finally {
      setCtaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="mb-8 text-stone transition-colors hover:text-espresso"
        >
          ← Back
        </button>

        {syncPending && (
          <p className="mb-6 rounded-2xl bg-linen px-4 py-3 text-sm text-stone">
            Updating your account…
          </p>
        )}

        <h1 className="mb-4 text-4xl" style={{ fontWeight: 700 }}>
          Unlock unlimited tasks + calendar scheduling — $6.99/month.
        </h1>
        <p className="mb-4 text-stone leading-relaxed">{proofLine}</p>
        <p className="mb-12 text-sm text-stone leading-relaxed">
          $49.99/year ($4.17/month) — start with a 14-day trial.
        </p>

        {checkoutError && (
          <p className="mb-6 text-sm text-orange">{checkoutError}</p>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`rounded-2xl border-2 bg-linen p-8 text-left transition-all ${
              selectedPlan === "monthly"
                ? "border-orange shadow-lg"
                : "border-transparent hover:border-parchment"
            }`}
          >
            {selectedPlan === "monthly" && (
              <div className="mb-2 flex justify-end">
                <Check className="h-6 w-6 text-orange" />
              </div>
            )}
            <h3 className="mb-2 text-2xl" style={{ fontWeight: 700 }}>
              Monthly
            </h3>
            <p className="mb-4 text-4xl" style={{ fontWeight: 700 }}>
              $6.99<span className="text-lg text-stone">/month</span>
            </p>
            <ul className="space-y-2 text-sm text-stone">
              <li>✓ Unlimited tasks</li>
              <li>✓ Calendar scheduling</li>
              <li>✓ Weekly reviews</li>
            </ul>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("annual")}
            className={`relative rounded-2xl border-2 bg-linen p-8 text-left transition-all ${
              selectedPlan === "annual"
                ? "border-orange shadow-lg"
                : "border-transparent hover:border-parchment"
            }`}
          >
            <div className="absolute -top-3 right-4 rounded-full bg-orange px-3 py-1 text-xs text-white">
              Save 29%
            </div>
            {selectedPlan === "annual" && (
              <div className="mb-2 flex justify-end">
                <Check className="h-6 w-6 text-orange" />
              </div>
            )}
            <h3 className="mb-2 text-2xl" style={{ fontWeight: 700 }}>
              Annual
            </h3>
            <p className="mb-4 text-4xl" style={{ fontWeight: 700 }}>
              $49.99<span className="text-lg text-stone">/year</span>
            </p>
            <p className="mb-4 text-sm text-stone">($4.17/month)</p>
            <ul className="space-y-2 text-sm text-stone">
              <li>✓ Unlimited tasks</li>
              <li>✓ Calendar scheduling</li>
              <li>✓ Weekly reviews</li>
            </ul>
          </button>
        </div>

        <button
          type="button"
          disabled={ctaLoading || syncPending}
          onClick={() => void handleCheckout()}
          className="mb-4 w-full rounded-2xl bg-ink px-6 py-4 text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ fontWeight: 600 }}
        >
          {user?.is_anonymous === true
            ? "Sign in with Google to continue"
            : ctaLoading
              ? "Redirecting…"
              : "Continue to Checkout"}
        </button>

        <p className="text-center text-sm text-stone">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
