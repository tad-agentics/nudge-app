import { useEffect } from "react";
import { useNavigate } from "react-router";

import { supabase } from "~/lib/supabase";

export function AuthCallbackScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/app", { replace: true });
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      navigate("/app", { replace: true });
      if (!session) {
        console.info(
          "Nudge: auth callback without session — opening app for anonymous use",
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
        <p className="text-xl">Signing you in...</p>
      </div>
    </div>
  );
}
