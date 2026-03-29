import type { Route } from "./+types/quiz";
import { ProcrastinationQuiz } from "~/pages/ProcrastinationQuiz";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "What's your procrastination type? | Nudge" },
    {
      name: "description",
      content:
        "Take the 60-second Nudge quiz — shareable results and an install path to the app.",
    },
  ];
}

export default function QuizRoute() {
  return <ProcrastinationQuiz />;
}
