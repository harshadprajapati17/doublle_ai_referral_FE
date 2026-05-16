import {
  parseBillingSubscriptionsMeJson,
  type BillingSubscription,
} from "@/lib/referrals/billing-payload";
import { getClientAuthBearer } from "@/lib/referrals/auth-token";
import {
  composeReferralEnrollment,
  isPendingEnrollmentNotFound,
  parseReferralMeJson,
  parseReferralProgramJson,
  type ReferralMeFetchResult,
  type ReferralMePayload,
  type ReferralProgramPayload,
} from "@/lib/referrals/referral-payload";
import type { SessionUser } from "@/lib/referrals/types";

export function getPublicAuthApiBase(): string | null {
  const base = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim();
  return base ? base.replace(/\/$/, "") : null;
}

function authHeaders(bearer: string): Record<string, string> {
  return {
    accept: "application/json",
    authorization: `Bearer ${bearer}`,
  };
}

async function apiGet(base: string, bearer: string, path: string): Promise<Response> {
  return fetch(`${base}${path}`, {
    method: "GET",
    headers: authHeaders(bearer),
  });
}

export async function fetchReferralProgramClient(
  base: string,
  bearer: string,
): Promise<ReferralProgramPayload | null> {
  const response = await apiGet(base, bearer, "/api/v1/referral/program");
  if (!response.ok) {
    console.error("[fetchReferralProgramClient] non-OK", response.status, await response.text());
    return null;
  }
  try {
    return parseReferralProgramJson(await response.json());
  } catch {
    return null;
  }
}

export async function fetchReferralMeClient(
  base: string,
  bearer: string,
): Promise<ReferralMeFetchResult> {
  const response = await apiGet(base, bearer, "/api/v1/referral/me");

  if (!response.ok) {
    const body = await response.text();
    if (isPendingEnrollmentNotFound(response.status, body)) {
      return { kind: "pending" };
    }
    console.error("[fetchReferralMeClient] non-OK", response.status, body);
    return { kind: "error" };
  }

  try {
    const parsed = parseReferralMeJson(await response.json());
    if (parsed) {
      return { kind: "ok", payload: parsed };
    }
  } catch {
    /* fall through */
  }

  return { kind: "error" };
}

/** GET program, then GET /me — visible in browser DevTools Network tab. */
export async function loadReferralEnrollmentClient(): Promise<ReferralMePayload | null> {
  const base = getPublicAuthApiBase();
  const bearer = getClientAuthBearer();
  if (!base || !bearer) {
    return null;
  }

  const program = await fetchReferralProgramClient(base, bearer);
  if (!program) {
    return null;
  }

  const me = await fetchReferralMeClient(base, bearer);
  return composeReferralEnrollment(program, me);
}

export async function fetchBillingSubscriptionsMeClient(): Promise<{
  subscriptions: BillingSubscription[];
  status: number;
}> {
  const base = getPublicAuthApiBase();
  const bearer = getClientAuthBearer();
  if (!base || !bearer) {
    return { subscriptions: [], status: 0 };
  }

  const response = await apiGet(base, bearer, "/api/v1/billing/subscriptions/me");
  if (!response.ok) {
    console.error(
      "[fetchBillingSubscriptionsMeClient] non-OK",
      response.status,
      await response.text(),
    );
    return { subscriptions: [], status: response.status };
  }

  try {
    const json = await response.json();
    return {
      subscriptions: parseBillingSubscriptionsMeJson(json),
      status: response.status,
    };
  } catch {
    return { subscriptions: [], status: response.status };
  }
}

export async function fetchAuthMeClient(): Promise<SessionUser | null> {
  const base = getPublicAuthApiBase();
  const bearer = getClientAuthBearer();
  if (!base || !bearer) {
    return null;
  }

  const response = await apiGet(base, bearer, "/api/v1/auth/me");
  if (!response.ok) {
    return null;
  }

  try {
    const json = await response.json();
    if (!json || typeof json !== "object") {
      return null;
    }
    const root = json as Record<string, unknown>;
    const data =
      root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : root;
    const user =
      data.user && typeof data.user === "object"
        ? (data.user as Record<string, unknown>)
        : data;

    const email =
      typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    if (!email) {
      return null;
    }

    const id =
      typeof user.id === "string"
        ? user.id.trim()
        : typeof user.userId === "string"
          ? user.userId.trim()
          : email;

    const name =
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : (email.split("@")[0] ?? "Referrer");

    return { id, name, email };
  } catch {
    return null;
  }
}

export async function acceptReferralTermsClient(): Promise<{
  ok: boolean;
  status: number;
}> {
  const base = getPublicAuthApiBase();
  const bearer = getClientAuthBearer();
  if (!base || !bearer) {
    return { ok: false, status: 0 };
  }

  const response = await fetch(`${base}/api/v1/referral/terms/accept`, {
    method: "POST",
    headers: {
      ...authHeaders(bearer),
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  return { ok: response.ok, status: response.status };
}
