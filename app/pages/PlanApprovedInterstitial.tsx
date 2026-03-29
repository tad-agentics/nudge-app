import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { WarmStripe } from "~/components/WarmStripe";

export function PlanApprovedInterstitial() {
  const navigate = useNavigate();

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
      className="min-h-screen bg-cream flex items-center justify-center px-6"
    >
      <div className="max-w-md text-center">
        <WarmStripe className="mx-auto mb-8 w-32" />
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl mb-4"
          style={{ fontWeight: 600 }}
        >
          6 tasks scheduled. Your day is set.
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-linen rounded-2xl p-6 mt-8"
        >
          <div className="space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-stone">9:00 AM</span>
              <span>Email Kevin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">10:30 AM</span>
              <span>Research venues</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone">11:30 AM</span>
              <span>Review budget</span>
            </div>
          </div>
        </motion.div>

        <button
          onClick={() => navigate("/app")}
          className="mt-6 text-stone hover:text-espresso transition-colors"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}