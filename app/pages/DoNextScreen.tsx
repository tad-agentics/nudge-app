import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Mail,
  Phone,
  ExternalLink,
  Check,
  SkipForward,
  Settings,
  Calendar,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { WarmStripe } from "~/components/WarmStripe";
import { mockTasks } from "~/data/mockData";
import type { Task } from "~/data/mockData";
import { useAuth } from "~/lib/auth";
import { FREE_ACTIVE_TASK_LIMIT } from "~/lib/constants";

export function DoNextScreen() {
  const { user, profile, authReady, signInWithGoogle } = useAuth();
  const [tasks, setTasks] = useState(
    mockTasks.filter((t) => t.status === "active"),
  );
  const [input, setInput] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState("");
  const [completionMessage, setCompletionMessage] = useState("Done.");
  const [showAuth24h, setShowAuth24h] = useState(false);
  const [showConnectGoogle, setShowConnectGoogle] = useState(false);
  const [showFreeLimit, setShowFreeLimit] = useState(false);
  const [pendingEmailTask, setPendingEmailTask] = useState<Task | null>(null);

  const isPaid =
    profile?.subscription_status === "paid" ||
    profile?.subscription_status === "trialing";
  const isFreeTier = !isPaid;

  useEffect(() => {
    if (!authReady || user?.is_anonymous !== true) return;
    if (localStorage.getItem("nudge-dismissed-auth-24h")) return;
    const created = user.created_at
      ? new Date(user.created_at).getTime()
      : Date.now();
    const hours = (Date.now() - created) / 3_600_000;
    if (hours >= 24) {
      setShowAuth24h(true);
    }
  }, [authReady, user]);

  const topTask = tasks[0];
  const upcomingTasks = tasks.slice(1);

  const openMailto = (task: Task) => {
    if (task.actionTarget) {
      window.location.href = `mailto:${task.actionTarget}`;
    }
  };

  const handleStart = (task: Task) => {
    if (task.actionType === "email" && task.actionTarget) {
      if (user?.is_anonymous === true) {
        setPendingEmailTask(task);
        setShowConnectGoogle(true);
        return;
      }
      openMailto(task);
    } else if (task.actionType === "call" && task.actionTarget) {
      window.location.href = `tel:${task.actionTarget}`;
    } else if (task.actionType === "browse" && task.actionTarget) {
      window.open(task.actionTarget, "_blank");
    }
  };

  const handleDone = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setCompletedTaskTitle(task.title);

    if (task.skipCount >= 3) {
      setCompletionMessage(`That one was ${task.skipCount} days old. Done.`);
    } else {
      setCompletionMessage("Done.");
    }

    setShowDone(true);

    setTimeout(() => {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setShowDone(false);
      setCompletedTaskTitle("");
      setCompletionMessage("Done.");
    }, 2000);
  };

  const handleSkip = (taskId: string) => {
    setTasks((prev) =>
      prev
        .map((t) =>
          t.id === taskId ? { ...t, skipCount: t.skipCount + 1 } : t,
        )
        .sort((a, b) => {
          if (a.id === taskId) return 1;
          if (b.id === taskId) return -1;
          return 0;
        }),
    );
    toast("Rescheduled to later today.");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isFreeTier && tasks.length >= FREE_ACTIVE_TASK_LIMIT) {
      setShowFreeLimit(true);
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: input,
      rationaleText: "Added just now. You'll tackle this soon.",
      skipCount: 0,
      actionType: "generic",
      status: "active",
    };

    setTasks([...tasks, newTask]);
    setInput("");
    toast("Task added");
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
      </div>
    );
  }

  if (showDone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center bg-ink px-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Check className="mx-auto mb-4 h-16 w-16 text-success" />
          </motion.div>
          <h2 className="text-2xl text-cream" style={{ fontWeight: 600 }}>
            {completionMessage}
          </h2>
          <p className="mt-2 text-stone">{completedTaskTitle}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <nav className="sticky top-0 z-40 border-b border-parchment bg-cream">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1
            className="text-xl"
            style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Nudge
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/app/plan"
              className="text-stone transition-colors hover:text-espresso"
            >
              <Calendar className="h-5 w-5" />
            </Link>
            <Link
              to="/app/review"
              className="text-stone transition-colors hover:text-espresso"
            >
              <BarChart3 className="h-5 w-5" />
            </Link>
            <Link
              to="/app/settings"
              className="text-stone transition-colors hover:text-espresso"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <form onSubmit={handleAddTask} className="mb-12">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you need to get done?"
            rows={3}
            className="w-full resize-none rounded-2xl border-2 border-parchment bg-white px-6 py-4 outline-none transition-colors focus:border-orange"
          />
        </form>

        {tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-2xl text-stone">All done.</p>
            <p className="mt-2 text-stone">Nothing left to do right now.</p>
          </div>
        ) : (
          <>
            {topTask && (
              <div className="mb-12">
                <h2 className="mb-3 ml-1 text-sm text-stone">Do next</h2>
                <motion.div
                  layout
                  className="relative overflow-hidden rounded-2xl bg-ink p-8 text-cream shadow-2xl"
                >
                  {topTask.skipCount >= 3 && (
                    <WarmStripe className="absolute left-0 right-0 top-0" />
                  )}
                  <h3 className="mb-3 text-2xl" style={{ fontWeight: 600 }}>
                    {topTask.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-stone">
                    {topTask.rationaleText}
                  </p>

                  {topTask.scheduledAt && (
                    <span className="mb-6 inline-block rounded-full bg-orange/30 px-3 py-1.5 text-xs text-orange">
                      {topTask.scheduledAt}
                    </span>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {topTask.actionType !== "generic" && (
                      <button
                        type="button"
                        onClick={() => handleStart(topTask)}
                        className="flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-ink transition-opacity hover:opacity-90"
                        style={{ fontWeight: 600 }}
                      >
                        {topTask.actionType === "email" && (
                          <Mail className="h-4 w-4" />
                        )}
                        {topTask.actionType === "call" && (
                          <Phone className="h-4 w-4" />
                        )}
                        {topTask.actionType === "browse" && (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        Start →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDone(topTask.id)}
                      className="flex items-center gap-2 rounded-full bg-cream/20 px-6 py-3 text-cream transition-colors hover:bg-cream/30"
                      style={{ fontWeight: 600 }}
                    >
                      <Check className="h-4 w-4" />
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkip(topTask.id)}
                      className="flex items-center gap-2 rounded-full bg-cream/10 px-6 py-3 text-cream/70 transition-colors hover:bg-cream/20"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div>
                <h2 className="mb-3 ml-1 text-sm text-stone">Coming up</h2>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className="relative overflow-hidden rounded-2xl bg-linen p-6"
                    >
                      {task.skipCount >= 3 && (
                        <WarmStripe className="absolute left-0 right-0 top-0" />
                      )}
                      <h4 className="mb-2" style={{ fontWeight: 600 }}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-stone">{task.rationaleText}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAuth24h && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6">
          <div className="max-w-md rounded-2xl bg-linen p-8 shadow-xl">
            <p className="mb-6 leading-relaxed text-espresso">
              Sign in to sync your tasks and schedule them on your calendar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="flex-1 rounded-2xl bg-ink px-4 py-3 text-cream hover:opacity-90"
                style={{ fontWeight: 600 }}
              >
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("nudge-dismissed-auth-24h", "1");
                  setShowAuth24h(false);
                }}
                className="flex-1 rounded-2xl border-2 border-parchment px-4 py-3 text-espresso hover:bg-parchment/50"
                style={{ fontWeight: 600 }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectGoogle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6">
          <div className="max-w-md rounded-2xl bg-linen p-8 shadow-xl">
            <p className="mb-6 leading-relaxed text-espresso">
              Connect Google to unlock email and calendar actions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowConnectGoogle(false);
                  void signInWithGoogle();
                }}
                className="flex-1 rounded-2xl bg-ink px-4 py-3 text-cream hover:opacity-90"
                style={{ fontWeight: 600 }}
              >
                Connect Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnectGoogle(false);
                  if (pendingEmailTask) openMailto(pendingEmailTask);
                  setPendingEmailTask(null);
                }}
                className="flex-1 rounded-2xl border-2 border-parchment px-4 py-3 text-espresso hover:bg-parchment/50"
                style={{ fontWeight: 600 }}
              >
                Use mailto instead
              </button>
            </div>
          </div>
        </div>
      )}

      {showFreeLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6">
          <div className="max-w-md rounded-2xl bg-linen p-8 shadow-xl">
            <p className="mb-6 leading-relaxed text-espresso">
              You&apos;ve hit 5 active tasks. Unlock unlimited tasks + calendar
              scheduling — $6.99/month or $49.99/year.
            </p>
            <p className="mb-6 text-sm leading-relaxed text-espresso/80">
              Sign in to keep adding tasks — free forever for 5 tasks, or upgrade
              for unlimited.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/app/upgrade"
                className="flex-1 rounded-2xl bg-orange px-4 py-3 text-center text-white hover:opacity-90"
                style={{ fontWeight: 600 }}
                onClick={() => setShowFreeLimit(false)}
              >
                Upgrade
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowFreeLimit(false);
                  void signInWithGoogle();
                }}
                className="flex-1 rounded-2xl border-2 border-parchment px-4 py-3 text-espresso hover:bg-parchment/50"
                style={{ fontWeight: 600 }}
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
