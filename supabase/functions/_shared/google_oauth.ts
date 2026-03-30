/** Exchange Google OAuth refresh token for access token (Edge). */
export async function googleRefreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string; expires_in: number }> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") ?? "";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("missing_google_oauth_env");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json() as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error ?? `token_refresh_${res.status}`);
  }
  return {
    access_token: data.access_token,
    expires_in: data.expires_in ?? 3600,
  };
}
