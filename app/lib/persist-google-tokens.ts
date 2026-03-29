import type { Session } from "@supabase/supabase-js";

import { supabase } from "~/lib/supabase";

/** After Google OAuth, persist refresh token server-side (tech-spec TD-2). */
export async function persistGoogleRefreshToken(
  session: Session | null,
): Promise<void> {
  const rt = session?.provider_refresh_token;
  if (!rt) {
    return;
  }

  const { error } = await supabase.functions.invoke("store-google-tokens", {
    body: { refresh_token: rt },
  });

  if (error) {
    console.warn("Nudge: store-google-tokens failed", error.message);
  }
}
