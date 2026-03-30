/** Shared secret for cron + server-to-server Edge calls (send-email, notifications-dispatch). */
export function assertInternalSecret(req: Request): Response | null {
  const expected = Deno.env.get("NUDGE_EDGE_INTERNAL_SECRET")?.trim() ?? "";
  if (expected.length === 0) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "NUDGE_EDGE_INTERNAL_SECRET" },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  const got = req.headers.get("x-nudge-internal-secret")?.trim() ?? "";
  if (got !== expected) {
    return new Response(
      JSON.stringify({
        error: { code: "UNAUTHORIZED", message: "Invalid internal secret" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  return null;
}
