import { fetchBillingSubscriptionsMeClient } from "@/lib/referrals/referral-api-client";

/** Poll GET /subscriptions/me until an active subscription appears (post-Razorpay auth). */
export async function pollUntilActiveSubscription(options?: {
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<boolean> {
  const maxAttempts = options?.maxAttempts ?? 15;
  const intervalMs = options?.intervalMs ?? 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const billing = await fetchBillingSubscriptionsMeClient();
    if (billing.activeSubscriptions.length > 0) {
      return true;
    }

    if (billing.status === 401) {
      return false;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, intervalMs);
      });
    }
  }

  return false;
}
