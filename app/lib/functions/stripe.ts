import type { Session } from "@supabase/supabase-js";

export class StripeInvokeError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "StripeInvokeError";
  }
}

function baseUrl(): string {
  const raw = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  if (raw.length === 0) return "https://build-placeholder.supabase.co";
  return raw.replace(/\/$/, "");
}

function anonKey(): string {
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}

export async function invokeStripeCheckout(
  session: Session | null,
  body: {
    price_key: "monthly" | "annual";
    success_url: string;
    cancel_url: string;
  },
): Promise<{ url: string }> {
  if (!session?.access_token) {
    throw new StripeInvokeError(401, "UNAUTHORIZED", "Sign in required");
  }

  const res = await fetch(`${baseUrl()}/functions/v1/stripe-create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey(),
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    error?: { code?: string; message?: string };
    url?: string;
  };

  if (!res.ok || !json.url) {
    const code = json.error?.code ?? "UNKNOWN";
    const message = json.error?.message ?? res.statusText;
    throw new StripeInvokeError(res.status, code, message);
  }

  return { url: json.url };
}

export async function invokeStripePortal(
  session: Session | null,
  returnUrl: string,
): Promise<{ url: string }> {
  if (!session?.access_token) {
    throw new StripeInvokeError(401, "UNAUTHORIZED", "Sign in required");
  }

  const res = await fetch(`${baseUrl()}/functions/v1/stripe-create-portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey(),
    },
    body: JSON.stringify({ return_url: returnUrl }),
  });

  const json = (await res.json()) as {
    error?: { code?: string; message?: string };
    url?: string;
  };

  if (!res.ok || !json.url) {
    const code = json.error?.code ?? "UNKNOWN";
    const message = json.error?.message ?? res.statusText;
    throw new StripeInvokeError(res.status, code, message);
  }

  return { url: json.url };
}
