import { isAuthApiConfigured } from "@/lib/referrals/referral-api-client";

import type { BillingFrequency } from "@/lib/billing/payments-config";

export type CreateSubscriptionBody = {
  amount: number;
  currency: string;
  frequency: BillingFrequency;
};

export type RazorpayCheckoutSession = {
  keyId: string;
  subscriptionId: string;
};

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function parseCheckoutSession(json: unknown): RazorpayCheckoutSession | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const checkout =
    data.checkout && typeof data.checkout === "object"
      ? (data.checkout as Record<string, unknown>)
      : null;

  if (!checkout) {
    return null;
  }

  const keyId = pickString(checkout, "keyId", "key_id", "razorpayKeyId");
  const subscriptionId = pickString(
    checkout,
    "subscriptionId",
    "subscription_id",
    "razorpaySubscriptionId",
  );

  if (!keyId || !subscriptionId) {
    return null;
  }

  return { keyId, subscriptionId };
}

function parseErrorMessage(json: unknown, status: number): string {
  if (json && typeof json === "object") {
    const root = json as Record<string, unknown>;
    const error =
      root.error && typeof root.error === "object"
        ? (root.error as Record<string, unknown>)
        : null;
    const message =
      (typeof error?.message === "string" && error.message.trim()) ||
      (typeof root.message === "string" && root.message.trim());
    if (message) {
      return message;
    }
  }
  return `Subscription create failed (${status})`;
}

/** POST /api/v1/billing/subscriptions — returns Razorpay checkout credentials. */
export async function createBillingSubscriptionClient(
  body: CreateSubscriptionBody,
): Promise<{
  ok: boolean;
  status: number;
  checkout: RazorpayCheckoutSession | null;
  errorMessage: string | null;
}> {
  if (!isAuthApiConfigured()) {
    return {
      ok: false,
      status: 0,
      checkout: null,
      errorMessage: "Billing API is not configured.",
    };
  }

  let response: Response;
  try {
    response = await fetch("/api/v1/billing/subscriptions", {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      checkout: null,
      errorMessage: "Could not reach the billing API.",
    };
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      checkout: null,
      errorMessage: parseErrorMessage(json, response.status),
    };
  }

  const checkout = parseCheckoutSession(json);
  if (!checkout) {
    return {
      ok: false,
      status: response.status,
      checkout: null,
      errorMessage: "Billing API did not return Razorpay checkout credentials.",
    };
  }

  return {
    ok: true,
    status: response.status,
    checkout,
    errorMessage: null,
  };
}
