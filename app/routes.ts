import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("quiz", "routes/quiz.tsx"),
  route("app", "routes/app/layout.tsx", [
    index("routes/app/do-next.tsx"),
    route("plan", "routes/app/plan.tsx", [
      route("done", "routes/app/plan-done.tsx"),
    ]),
    route("review", "routes/app/review.tsx"),
    route("upgrade", "routes/app/upgrade.tsx"),
    route("settings", "routes/app/settings.tsx"),
    route("auth", "routes/app/auth/layout.tsx", [
      route("callback", "routes/app/auth/callback.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
