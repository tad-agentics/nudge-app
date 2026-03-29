import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Share2 } from "lucide-react";
import { WarmStripe } from "~/components/WarmStripe";
import { motion } from "motion/react";
import CountUp from "react-countup";

export function WeeklyReviewScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-stone"
        >
          Counting your wins...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/app")}
          className="text-stone hover:text-espresso transition-colors mb-8"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl mb-2" style={{ fontWeight: 700 }}>
            <CountUp end={14} duration={1.5} /> tasks
          </h1>
          <p className="text-xl text-stone">this week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-linen rounded-2xl p-6 mb-8"
        >
          <p className="leading-relaxed">
            You finished everything that mattered this week. Three of those tasks had been sitting for over a week before you started — momentum is building.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-linen rounded-2xl overflow-hidden mb-8 relative"
        >
          <WarmStripe />
          <div className="p-6">
            <h3 className="mb-2" style={{ fontWeight: 600 }}>
              Save moment
            </h3>
            <p className="text-sm text-stone mb-3">
              You finished the deposit refund task 2 hours before the deadline. That would have been a $500 forfeit.
            </p>
            <p className="text-xs text-stone">Thursday, 2:15 PM</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-linen rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-stone mb-3">Share your progress</p>
          <p className="text-lg mb-4" style={{ fontWeight: 600 }}>
            14 tasks done • 5-day streak
          </p>
          <button className="flex items-center gap-2 mx-auto text-orange hover:text-terra transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </motion.div>
      </div>
    </div>
  );
}