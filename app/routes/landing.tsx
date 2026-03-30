import type { Route } from "./+types/landing";
import { LandingPage } from "~/pages/LandingPage";

const siteUrl = "https://nudge.app";

export function meta(_args: Route.MetaArgs) {
  const title = "Nudge — The app that plans your day — and tells you why.";
  const description =
    "Nudge prioritizes your tasks, explains its reasoning, and proposes a daily plan on your calendar. You approve it in 10 seconds. Then just start.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${siteUrl}/` },
    { property: "og:image", content: `${siteUrl}/og-image.png` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function LandingRoute() {
  return <LandingPage />;
}
