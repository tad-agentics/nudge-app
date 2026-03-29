import { useState } from "react";
import { Link } from "react-router";
import { Mail, Phone, ExternalLink, Check, SkipForward, Settings, Calendar, BarChart3 } from "lucide-react";
import { WarmStripe } from "~/components/WarmStripe";
import { mockTasks } from "~/data/mockData";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Task } from "~/data/mockData";

export function DoNextScreen() {
  const [tasks, setTasks] = useState(mockTasks.filter((t) => t.status === "active"));
  const [input, setInput] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState("");
  const [completionMessage, setCompletionMessage] = useState("Done.");

  const topTask = tasks[0];
  const upcomingTasks = tasks.slice(1);

  const handleStart = (task: Task) => {
    if (task.actionType === "email" && task.actionTarget) {
      window.location.href = `mailto:${task.actionTarget}`;
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
    
    // Vary message based on skip count (avoidance escalation)
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
      prev.map((t) =>
        t.id === taskId ? { ...t, skipCount: t.skipCount + 1 } : t
      ).sort((a, b) => {
        if (a.id === taskId) return 1;
        if (b.id === taskId) return -1;
        return 0;
      })
    );
    toast("Rescheduled to later today.");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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

  if (showDone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-ink flex items-center justify-center px-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Check className="w-16 h-16 text-success mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl text-cream" style={{ fontWeight: 600 }}>
            {completionMessage}
          </h2>
          <p className="text-stone mt-2">{completedTaskTitle}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Navigation */}
      <nav className="bg-cream border-b border-parchment sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Nudge
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/app/plan" className="text-stone hover:text-espresso transition-colors">
              <Calendar className="w-5 h-5" />
            </Link>
            <Link to="/app/review" className="text-stone hover:text-espresso transition-colors">
              <BarChart3 className="w-5 h-5" />
            </Link>
            <Link to="/app/settings" className="text-stone hover:text-espresso transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Task Input */}
        <form onSubmit={handleAddTask} className="mb-12">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you need to get done?"
            rows={3}
            className="w-full px-6 py-4 bg-white rounded-2xl border-2 border-parchment focus:border-orange outline-none transition-colors resize-none"
          />
        </form>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-stone">All done.</p>
            <p className="text-stone mt-2">Nothing left to do right now.</p>
          </div>
        ) : (
          <>
            {/* Do Next Card */}
            {topTask && (
              <div className="mb-12">
                <h2 className="text-sm text-stone mb-3 ml-1">Do next</h2>
                <motion.div
                  layout
                  className="bg-ink text-cream rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                >
                  {topTask.skipCount >= 3 && (
                    <WarmStripe className="absolute top-0 left-0 right-0" />
                  )}
                  <h3 className="text-2xl mb-3" style={{ fontWeight: 600 }}>
                    {topTask.title}
                  </h3>
                  <p className="text-stone mb-6 leading-relaxed">
                    {topTask.rationaleText}
                  </p>

                  {topTask.scheduledAt && (
                    <span className="inline-block text-xs bg-orange/30 text-orange px-3 py-1.5 rounded-full mb-6">
                      {topTask.scheduledAt}
                    </span>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {topTask.actionType !== "generic" && (
                      <button
                        onClick={() => handleStart(topTask)}
                        className="px-6 py-3 bg-cream text-ink rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
                        style={{ fontWeight: 600 }}
                      >
                        {topTask.actionType === "email" && <Mail className="w-4 h-4" />}
                        {topTask.actionType === "call" && <Phone className="w-4 h-4" />}
                        {topTask.actionType === "browse" && <ExternalLink className="w-4 h-4" />}
                        Start →
                      </button>
                    )}
                    <button
                      onClick={() => handleDone(topTask.id)}
                      className="px-6 py-3 bg-cream/20 text-cream rounded-full hover:bg-cream/30 transition-colors flex items-center gap-2"
                      style={{ fontWeight: 600 }}
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                    <button
                      onClick={() => handleSkip(topTask.id)}
                      className="px-6 py-3 bg-cream/10 text-cream/70 rounded-full hover:bg-cream/20 transition-colors flex items-center gap-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Coming Up */}
            {upcomingTasks.length > 0 && (
              <div>
                <h2 className="text-sm text-stone mb-3 ml-1">Coming up</h2>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className="bg-linen rounded-2xl p-6 relative overflow-hidden"
                    >
                      {task.skipCount >= 3 && (
                        <WarmStripe className="absolute top-0 left-0 right-0" />
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
    </div>
  );
}