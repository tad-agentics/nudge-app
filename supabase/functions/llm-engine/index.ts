import { corsHeaders } from "../_shared/cors.ts";

/** Anthropic proxy — structure / reason_batch / decompose / weekly_insight. */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: {
        code: "NOT_IMPLEMENTED",
        message: "llm-engine stub — deploy prompts in core-engine wave.",
      },
    }),
    { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
