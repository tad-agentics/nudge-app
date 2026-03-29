export type ActionType = "email" | "call" | "browse" | "generic";

export type Task = {
  id: string;
  title: string;
  rationaleText: string;
  scheduledAt?: string;
  skipCount: number;
  actionType: ActionType;
  actionTarget?: string;
  status: "active" | "done";
  effortMinutes?: number;
  deadline?: string;
};

export type Profile = {
  displayName: string;
  email: string;
  subscriptionStatus: "free" | "paid" | "trialing";
  subscriptionPhase: "freemium" | "trialing" | "paid" | "free_post_trial";
  calendarProvider: "none" | "google" | "apple";
  calendarSchedulingEnabled: boolean;
};

export type PlanSlot = {
  time: string;
  type: "task" | "meeting";
  title?: string;
  taskId?: string;
};

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Email Kevin about deposit refund",
    rationaleText: "This unblocks your deposit refund.",
    scheduledAt: "9:00 AM",
    skipCount: 4,
    actionType: "email",
    actionTarget: "kevin@example.com",
    status: "active",
    effortMinutes: 5,
    deadline: "2026-03-30",
  },
  {
    id: "2",
    title: "Call Sarah about project timeline",
    rationaleText: "Day 5 with this one. Start with just finding the number?",
    skipCount: 5,
    actionType: "call",
    actionTarget: "+1-555-0123",
    status: "active",
    effortMinutes: 15,
  },
  {
    id: "3",
    title: "Research Chicago venue options",
    rationaleText: "Wedding deadline is in 3 weeks. Getting venue locked down first makes everything easier.",
    skipCount: 0,
    actionType: "browse",
    actionTarget: "https://www.google.com/search?q=chicago+wedding+venues",
    status: "active",
    effortMinutes: 30,
  },
  {
    id: "4",
    title: "Review quarterly budget spreadsheet",
    rationaleText: "Mike asked for this yesterday. Quick review is all you need.",
    skipCount: 1,
    actionType: "generic",
    status: "active",
    effortMinutes: 20,
  },
  {
    id: "5",
    title: "Book dentist appointment",
    rationaleText: "You've been meaning to do this for 2 months. Takes 3 minutes.",
    skipCount: 0,
    actionType: "call",
    actionTarget: "+1-555-0456",
    status: "active",
    effortMinutes: 5,
  },
];

export const mockProfile: Profile = {
  displayName: "Sarah",
  email: "sarah@example.com",
  subscriptionStatus: "free",
  subscriptionPhase: "freemium",
  calendarProvider: "none",
  calendarSchedulingEnabled: false,
};

export const mockPaidProfile: Profile = {
  ...mockProfile,
  subscriptionStatus: "paid",
  subscriptionPhase: "paid",
  calendarProvider: "google",
  calendarSchedulingEnabled: true,
};

export const mockPlanSlots: PlanSlot[] = [
  { time: "9:00 AM", type: "task", title: "Email Kevin about deposit refund", taskId: "1" },
  { time: "9:30 AM", type: "meeting", title: "Meeting" },
  { time: "10:30 AM", type: "task", title: "Research Chicago venue options", taskId: "3" },
  { time: "11:30 AM", type: "task", title: "Review quarterly budget spreadsheet", taskId: "4" },
  { time: "1:00 PM", type: "meeting", title: "Busy" },
  { time: "2:30 PM", type: "task", title: "Book dentist appointment", taskId: "5" },
];

export const quizQuestions = [
  {
    id: 1,
    question: "When do you typically start working on a task?",
    options: [
      "As soon as I think of it",
      "After carefully planning when to do it",
      "When the deadline is close",
      "When someone reminds me",
    ],
  },
  {
    id: 2,
    question: "How do you feel about your to-do list?",
    options: [
      "Energized — it's my roadmap",
      "Overwhelmed — there's too much",
      "Guilty — I keep ignoring it",
      "Confused — I don't know where to start",
    ],
  },
  {
    id: 3,
    question: "What usually stops you from starting?",
    options: [
      "I'm not sure how to begin",
      "I don't have enough time right now",
      "I'm worried I'll do it wrong",
      "It feels boring or unpleasant",
    ],
  },
  {
    id: 4,
    question: "How do you decide what to work on?",
    options: [
      "Whatever feels most urgent",
      "Whatever seems easiest",
      "Whatever I'm in the mood for",
      "I struggle to decide, so I don't start",
    ],
  },
  {
    id: 5,
    question: "When you're stuck, what helps you most?",
    options: [
      "Breaking the task into smaller steps",
      "Setting a timer and committing to 10 minutes",
      "Getting encouragement from someone",
      "Switching to something else entirely",
    ],
  },
  {
    id: 6,
    question: "How often do you reschedule tasks?",
    options: [
      "Rarely — I stick to my plan",
      "Sometimes — when things come up",
      "Often — my plans never work out",
      "Always — I over-schedule myself",
    ],
  },
  {
    id: 7,
    question: "What's your relationship with deadlines?",
    options: [
      "I hit them with time to spare",
      "I hit them, but it's stressful",
      "I miss them more than I'd like",
      "I avoid tasks with deadlines",
    ],
  },
  {
    id: 8,
    question: "After completing a task, you usually feel:",
    options: [
      "Proud and accomplished",
      "Relieved it's over",
      "Guilty it took so long",
      "Surprised you actually did it",
    ],
  },
];

/** Northstar §7c — five procrastination types (names + core pattern copy verbatim). */
export type QuizTypeId =
  | "avoider"
  | "optimizer"
  | "firefighter"
  | "overloader"
  | "perfectionist";

export const quizResults: Record<
  QuizTypeId,
  { name: string; description: string; ctaPlural: string }
> = {
  avoider: {
    name: "The Avoider",
    description:
      "Skips tasks that feel emotionally uncomfortable — phone calls, confrontations, ambiguous decisions. Does easy tasks compulsively to feel productive.",
    ctaPlural: "Avoiders",
  },
  optimizer: {
    name: "The Optimizer",
    description:
      "Spends more time organizing tasks than doing them. The system IS the procrastination.",
    ctaPlural: "Optimizers",
  },
  firefighter: {
    name: "The Firefighter",
    description:
      "Only acts when something becomes urgent. Important-but-not-urgent tasks never get touched until they're crises.",
    ctaPlural: "Firefighters",
  },
  overloader: {
    name: "The Overloader",
    description:
      "Says yes to everything. 40 tasks, paralyzed by volume.",
    ctaPlural: "Overloaders",
  },
  perfectionist: {
    name: "The Perfectionist",
    description:
      "Delays starting because the output won't be good enough.",
    ctaPlural: "Perfectionists",
  },
};

/** Northstar §7b — verbatim FAQ (9 items). */
export const faqItems = [
  {
    question: "How is this different from Todoist or Apple Reminders?",
    answer:
      "Those apps store your tasks. Nudge decides what you should do first, tells you why, and proposes a daily plan on your calendar. It's the difference between a filing cabinet and a chief of staff.",
  },
  {
    question: "How is this different from Motion?",
    answer:
      "Motion auto-schedules but never explains why. It reshuffles your entire day whenever anything changes — users report 10+ reschedules daily. Nudge explains every recommendation (\"this unblocks your deposit refund\"), proposes a stable daily plan you approve each morning, and detects when you're avoiding tasks. Motion optimizes your schedule. Nudge understands your behavior.",
  },
  {
    question: "How does calendar scheduling work?",
    answer:
      "Connect Google or Apple Calendar. Each morning, Nudge proposes a daily plan: your tasks time-blocked around your meetings. You preview it, adjust anything, and tap \"Approve.\" Events appear on a dedicated \"Nudge\" sub-calendar. Nothing touches your calendar without your permission. Once approved, the plan stays stable — no surprise reshuffling.",
  },
  {
    question: "Does it read my emails or calendar events?",
    answer:
      "Nudge reads your calendar to find open slots and avoid conflicts. It does NOT read your emails — it only creates email drafts when you tap \"Start.\" Calendar data is only used for scheduling.",
  },
  {
    question: "What if I disagree with the priority or scheduled time?",
    answer:
      "In the morning preview, drag any task to a different slot before approving. During the day, tap \"Skip\" and the task returns to the queue for tomorrow's plan. You can also drag Nudge events in your calendar app — Nudge respects the move.",
  },
  {
    question: "How does it know what I'm avoiding?",
    answer:
      "Nudge tracks which tasks you skip repeatedly. After 3 skips, it changes approach — breaking the task into a smaller first step, scheduling it in a shorter block, or surfacing it when you have the most energy. No guilt, just smart re-framing.",
  },
  {
    question: "Does it work for both work and personal tasks?",
    answer:
      "Yes. Nudge handles everything in one stream — because your dentist appointment doesn't care that you also have a client proposal due.",
  },
  {
    question: "Is it free?",
    answer:
      "The free plan includes AI prioritization + rationale for up to 5 active tasks. Calendar scheduling, voice capture, Gmail integration, and unlimited tasks are in the paid plan ($6.99/month or $49.99/year). Cheaper than Motion ($29+), Sunsama ($16), or Morgen ($15).",
  },
  {
    question: "Is my data private?",
    answer:
      "Your tasks are encrypted at rest and in transit. Nudge uses your behavioral patterns only to improve your own recommendations. No data is shared with third parties or used to train AI models.",
  },
];

/** Northstar §7b — verbatim social proof. */
export const testimonials = [
  {
    name: "Kevin P.",
    role: "33, logistics coordinator, Portland",
    quote:
      "I open my calendar Monday morning and my tasks are already time-blocked around my meetings. I didn't plan any of it. I just start at 9am and go.",
  },
  {
    name: "Sarah K.",
    role: "28, marketing manager, London",
    quote:
      "It caught a car registration renewal I'd been ignoring for 3 weeks — kept rescheduling it on my calendar until I couldn't avoid it anymore. Saved me $150 in late fees.",
  },
  {
    name: "James T.",
    role: "35, freelance consultant, Austin",
    quote:
      "I realized I avoid every task that involves a phone call. Nudge started scheduling calls in 10-minute blocks at 9am when I have the most energy. Now I do them first and they don't haunt me all week.",
  },
];
