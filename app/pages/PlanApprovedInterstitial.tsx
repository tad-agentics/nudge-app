import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";

import { WarmStripe } from "~/components/WarmStripe";
import type { PlanSlot } from "~/lib/plan-types";

type PlanDoneState = {
  slots?: PlanSlot[];
  taskCount?: number;
  planDate?: string;
};

export function PlanApprovedInterstitial() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as PlanDoneState;

  const taskCount = state.taskCount ?? 0;
  const slots = state.slots ?? [];
  const previewSlots = slots
    .filter((s) => s.type === "task")
    .slice(0, 5);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/app");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-cream px-6"
    >
      <div className="max-w-md text-center">
        <WarmStripe className="mx-auto mb-8 w-32" />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-3xl text-espresso"
          style={{ fontWeight: 600 }}
        >
          {taskCount} tasks scheduled. Your day is set.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl bg-linen p-6"
        >
          <div className="space-y-2 text-left text-sm">
            {previewSlots.length === 0 ? (
              <p className="text-stone">Your plan is on your calendar.</p>
            ) : (
              previewSlots.map((s) => (
                <div key={s.start_iso} className="flex justify-between gap-2">
                  <span className="text-stone">{s.time}</span>
                  <span className="text-espresso" style={{ fontWeight: 600 }}>
                    {s.title ?? "Task"}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => navigate("/app")}
          className="mt-6 text-stone transition-colors hover:text-espresso"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
