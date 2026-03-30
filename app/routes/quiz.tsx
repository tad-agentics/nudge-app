import type { Route } from "./+types/quiz";
import { ProcrastinationQuiz } from "~/pages/ProcrastinationQuiz";

const siteUrl = "https://nudge.app";

export function meta(_args: Route.MetaArgs) {
  const title = "What's your procrastination type? | Nudge";
  const description =
    "Eight questions, 60 seconds — get your procrastination type and share your result. No signup.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${siteUrl}/quiz` },
    { property: "og:image", content: `${siteUrl}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function QuizRoute() {
  return <ProcrastinationQuiz />;
}
