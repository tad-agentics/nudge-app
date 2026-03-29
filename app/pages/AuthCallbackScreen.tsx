import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { persistGoogleRefreshToken } from "~/lib/persist-google-tokens";
import { supabase } from "~/lib/supabase";

export function AuthCallbackScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const desc =
      params.get("error_description") ?? params.get("error") ?? null;
    if (desc) {
      setError(desc);
      return;
    }

    let cancelled = false;

    void (async () => {
      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionErr) {
        setError(sessionErr.message);
        return;
      }

      if (!session) {
        setError(
          "We couldn’t finish signing you in. You can still use Nudge — try Google again from Settings.",
        );
        return;
      }

      await persistGoogleRefreshToken(session);
      if (!cancelled) {
        navigate("/app", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <div className="max-w-md rounded-2xl bg-linen p-8 text-center shadow-lg">
          <h1 className="mb-4 text-xl text-espresso" style={{ fontWeight: 700 }}>
            Sign-in issue
          </h1>
          <p className="mb-6 leading-relaxed text-espresso/80">{error}</p>
          <Link
            to="/app"
            className="inline-block rounded-2xl bg-ink px-6 py-3 text-cream hover:opacity-90"
            style={{ fontWeight: 600 }}
          >
            Continue to app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
        <p className="text-xl">Signing you in...</p>
      </div>
    </div>
  );
}
