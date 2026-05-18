import "server-only";

import {
  filterActiveSubscriptions,
  parseBillingSubscriptionsMeJson,
  type BillingRefereeBenefit,
  type BillingSubscription,
} from "@/lib/referrals/billing-payload";
import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";

export type BillingSubscriptionsMeResult = {
  subscriptions: BillingSubscription[];
  activeSubscriptions: BillingSubscription[];
  refereeBenefit: BillingRefereeBenefit | null;
  status: number;
};

/** GET {AUTH_API_BASE_URL}/api/v1/billing/subscriptions/me */
export async function fetchBillingSubscriptionsMe(): Promise<BillingSubscriptionsMeResult> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return { subscriptions: [], activeSubscriptions: [], refereeBenefit: null, status: 0 };
  }

  const url = `${base}/api/v1/billing/subscriptions/me`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchBillingSubscriptionsMe] fetch threw", { url, error });
    return { subscriptions: [], activeSubscriptions: [], refereeBenefit: null, status: 0 };
  }

  if (!response.ok) {
    console.error(
      "[fetchBillingSubscriptionsMe] non-OK",
      response.status,
      await response.text(),
    );
    return {
      subscriptions: [],
      activeSubscriptions: [],
      refereeBenefit: null,
      status: response.status,
    };
  }

  try {
    const payload = parseBillingSubscriptionsMeJson(await response.json());
    return {
      subscriptions: payload.subscriptions,
      activeSubscriptions: filterActiveSubscriptions(payload.subscriptions),
      refereeBenefit: payload.refereeBenefit,
      status: response.status,
    };
  } catch {
    return {
      subscriptions: [],
      activeSubscriptions: [],
      refereeBenefit: null,
      status: response.status,
    };
  }
}
