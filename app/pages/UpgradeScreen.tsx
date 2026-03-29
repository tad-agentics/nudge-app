import { useState } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";

export function UpgradeScreen() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");

  const handleCheckout = () => {
    // In real app, would open Stripe Checkout
    alert("This would open Stripe Checkout in production");
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/app")}
          className="text-stone hover:text-espresso transition-colors mb-8"
        >
          ← Back
        </button>

        <h1 className="text-4xl mb-4" style={{ fontWeight: 700 }}>
          Unlock unlimited tasks + calendar scheduling
        </h1>
        <p className="text-stone mb-12">
          You've completed 12 tasks so far — unlock unlimited + calendar.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`bg-linen rounded-2xl p-8 text-left border-2 transition-all ${
              selectedPlan === "monthly"
                ? "border-orange shadow-lg"
                : "border-transparent hover:border-parchment"
            }`}
          >
            {selectedPlan === "monthly" && (
              <div className="flex justify-end mb-2">
                <Check className="w-6 h-6 text-orange" />
              </div>
            )}
            <h3 className="text-2xl mb-2" style={{ fontWeight: 700 }}>
              Monthly
            </h3>
            <p className="text-4xl mb-4" style={{ fontWeight: 700 }}>
              $6.99<span className="text-lg text-stone">/month</span>
            </p>
            <ul className="space-y-2 text-sm text-stone">
              <li>✓ Unlimited tasks</li>
              <li>✓ Calendar scheduling</li>
              <li>✓ Weekly reviews</li>
            </ul>
          </button>

          {/* Annual Plan */}
          <button
            onClick={() => setSelectedPlan("annual")}
            className={`bg-linen rounded-2xl p-8 text-left border-2 transition-all relative ${
              selectedPlan === "annual"
                ? "border-orange shadow-lg"
                : "border-transparent hover:border-parchment"
            }`}
          >
            <div className="absolute -top-3 right-4 bg-orange text-white text-xs px-3 py-1 rounded-full">
              Save 29%
            </div>
            {selectedPlan === "annual" && (
              <div className="flex justify-end mb-2">
                <Check className="w-6 h-6 text-orange" />
              </div>
            )}
            <h3 className="text-2xl mb-2" style={{ fontWeight: 700 }}>
              Annual
            </h3>
            <p className="text-4xl mb-4" style={{ fontWeight: 700 }}>
              $49.99<span className="text-lg text-stone">/year</span>
            </p>
            <p className="text-sm text-stone mb-4">($4.17/month)</p>
            <ul className="space-y-2 text-sm text-stone">
              <li>✓ Unlimited tasks</li>
              <li>✓ Calendar scheduling</li>
              <li>✓ Weekly reviews</li>
            </ul>
          </button>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full px-6 py-4 bg-ink text-cream rounded-2xl hover:opacity-90 transition-opacity mb-4"
          style={{ fontWeight: 600 }}
        >
          Continue to Checkout
        </button>

        <p className="text-center text-sm text-stone">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}