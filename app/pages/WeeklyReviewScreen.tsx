import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Share2 } from "lucide-react";
import { WarmStripe } from "~/components/WarmStripe";
import { motion } from "motion/react";
import CountUp from "react-countup";

import { useAuth } from "~/lib/auth";
import { useWeeklyReview } from "~/hooks/useWeeklyReview";

export function WeeklyReviewScreen() {
  const navigate = useNavigate();
  const { profile, profileLoading } = useAuth();
  const isPaid =
    profile?.subscription_status === "paid" ||
    profile?.subscription_status === "trialing";
  const dataEnabled = !!profile && !profileLoading && isPaid;

  const {
    weekTaskCount,
    streakDays,
    saveMoment,
    statsLoading,
    statsError,
    insightText,
    insightLoading,
    insightError,
  } = useWeeklyReview(dataEnabled);

  const [anticipationDone, setAnticipationDone] = useState(false);

  useEffect(() => {
    if (!dataEnabled) {
      setAnticipationDone(true);
      return;
    }
    setAnticipationDone(false);
    const t = window.setTimeout(() => setAnticipationDone(true), 1200);
    return () => window.clearTimeout(t);
  }, [dataEnabled]);

  const showPaidLoading = dataEnabled && (!anticipationDone || statsLoading);

  const showError = dataEnabled && statsError != null && !statsLoading;

  const onShare = async () => {
    const text = `${weekTaskCount} tasks done • ${streakDays}-day streak`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch {
      /* user cancel or clipboard denied */
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <p className="text-stone">Loading…</p>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="text-stone hover:text-espresso transition-colors mb-8"
          >
            ← Back
          </button>
          <div className="bg-linen rounded-2xl p-6 text-stone space-y-3">
            <p className="text-espresso" style={{ fontWeight: 600 }}>
              Weekly review is part of Nudge paid.
            </p>
            <p className="text-sm leading-relaxed">
              Upgrade to see completions, streak, and a short insight each week.
            </p>
            <Link
              to="/app/upgrade"
              className="inline-block text-orange hover:text-terra transition-colors text-sm"
              style={{ fontWeight: 600 }}
            >
              View plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showPaidLoading && !showError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-stone"
        >
          Counting your wins…
        </motion.p>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-stone text-center max-w-md">
          Couldn&apos;t load right now. Try again in a few seconds.
        </p>
        <button
          type="button"
          onClick={() => navigate(0)}
          className="text-orange hover:text-terra transition-colors text-sm"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="text-stone text-sm"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (dataEnabled && weekTaskCount === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="text-stone hover:text-espresso transition-colors mb-8"
          >
            ← Back
          </button>
          <p className="text-xl text-stone mb-2">No tasks completed this week.</p>
          <p className="text-stone text-sm">
            When you check things off, they show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          type="button"
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
          <h1 className="mb-2" style={{ fontWeight: 700 }}>
            <span className="text-[2rem]" style={{ color: "#D4763C" }}>
              <CountUp end={weekTaskCount} duration={1} useEasing />
            </span>{" "}
            <span className="text-[2rem] text-espresso">
              tasks this week.
            </span>
          </h1>
        </motion.div>

        {insightError ? (
          <p className="text-sm text-stone mb-8 text-center">
            Couldn&apos;t load insight. The rest of your week still saved.
          </p>
        ) : null}
        {!insightError && insightText.trim().length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-linen rounded-2xl p-6 mb-8"
          >
            <p className="leading-relaxed text-espresso">{insightText}</p>
          </motion.div>
        ) : null}

        {saveMoment ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-linen rounded-2xl overflow-hidden mb-8 relative"
          >
            <WarmStripe />
            <div className="p-6">
              <h3 className="mb-2 text-espresso" style={{ fontWeight: 600 }}>
                {saveMoment.headline}
              </h3>
              <p className="text-sm text-stone mb-3">{saveMoment.body}</p>
              <p className="text-xs text-stone">{saveMoment.when}</p>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-linen rounded-2xl p-6 text-center"
        >
          <p className="text-lg mb-4 text-espresso" style={{ fontWeight: 600 }}>
            {weekTaskCount} tasks done • {streakDays}-day streak
          </p>
          <button
            type="button"
            onClick={() => void onShare()}
            className="flex items-center gap-2 mx-auto text-orange hover:text-terra transition-colors"
            aria-label="Share summary"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </motion.div>
      </div>
    </div>
  );
}
