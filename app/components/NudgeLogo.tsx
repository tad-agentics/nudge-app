export function NudgeLogo({ variant }: { variant?: "light" | "dark" }) {
  const textColor = variant === "dark" ? "text-cream" : "text-espresso";

  return (
    <div className="flex flex-col items-start">
      <h1
        className={`text-3xl ${textColor} tracking-tight`}
        style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
      >
        Nudge
      </h1>
      <div className="mt-0.5 h-0.5 w-16 bg-gradient-to-r from-orange via-terra to-brown" />
    </div>
  );
}
