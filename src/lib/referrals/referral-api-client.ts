import {
  filterActiveSubscriptions,
  parseBillingSubscriptionsMeJson,
  type BillingAccountCredits,
  type BillingRefereeBenefit,
  type BillingSubscription,
} from "@/lib/referrals/billing-payload";
import {
  isAuthApiConfigured,
  resolveAuthApiBaseUrl,
} from "@/lib/auth/api-base";
import { getClientAuthBearer } from "@/lib/referrals/auth-token";
import {
  buildReferrerDashboardData,
  buildReferrerDashboardFromApi,
} from "@/lib/referrals/build-referrer-dashboard";
import { parseReferralDashboardJson } from "@/lib/referrals/referral-dashboard-payload";
import {
  composeReferralEnrollment,
  isPendingEnrollmentNotFound,
  parseReferralMeJson,
  parseReferralProgramJson,
  parseReferralTermsAcceptJson,
  pendingEnrollmentFromProgram,
  type ReferralMeFetchResult,
  type ReferralMePayload,
  type ReferralProgramPayload,
  type ReferralTermsAcceptPayload,
} from "@/lib/referrals/referral-payload";
import type { ReferrerDashboardData } from "@/lib/referrals/types";
import {
  mapReferralTransactionsToUi,
  parseReferralTransactionsJson,
} from "@/lib/referrals/referral-transactions-payload";
import type { SessionUser, TransactionData } from "@/lib/referrals/types";
import {
  parseReferralCodeValidateJson,
  toValidateReferralCodeResult,
  type ValidateReferralCodeResult,
} from "@/lib/referrals/validate-referral-code";
export type { ValidateReferralCodeResult } from "@/lib/referrals/validate-referral-code";

export function getPublicAuthApiBase(): string | null {
  return resolveAuthApiBaseUrl();
}

export { isAuthApiConfigured };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Browser: same-origin `/api/v1/*` proxy (reads HttpOnly session cookie server-side).
 * SSR/tests: direct `AUTH_API_BASE_URL` when available.
 */
function resolveClientFetchOrigin(): string {
  if (isBrowser()) {
    return "";
  }
  return resolveAuthApiBaseUrl() ?? "";
}

type ApiFetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;
};

async function apiFetch(
  path: string,
  init: ApiFetchInit = {},
): Promise<Response> {
  const { auth = true, headers = {}, ...rest } = init;
  const origin = resolveClientFetchOrigin();
  const mergedHeaders: Record<string, string> = {
    accept: "application/json",
    ...headers,
  };

  if (!isBrowser() && auth) {
    const bearer = getClientAuthBearer();
    if (bearer) {
      mergedHeaders.authorization = `Bearer ${bearer}`;
    }
  }

  return fetch(`${origin}${path}`, {
    ...rest,
    headers: mergedHeaders,
    credentials: isBrowser() ? "include" : rest.credentials,
  });
}

export type ReferralProgramFetchResult =
  | { kind: "ok"; payload: ReferralProgramPayload }
  | { kind: "error"; status?: number };

export async function fetchReferralProgramClient(): Promise<ReferralProgramFetchResult> {
  try {
    const response = await apiFetch("/api/v1/referral/program");
    if (!response.ok) {
      console.error(
        "[fetchReferralProgramClient] non-OK",
        response.status,
        await response.text(),
      );
      return { kind: "error", status: response.status };
    }
    const parsed = parseReferralProgramJson(await response.json());
    if (parsed) {
      return { kind: "ok", payload: parsed };
    }
    return { kind: "error", status: response.status };
  } catch (error) {
    console.error("[fetchReferralProgramClient] fetch threw", error);
    return { kind: "error" };
  }
}

export async function fetchReferralMeClient(): Promise<ReferralMeFetchResult> {
  try {
    const response = await apiFetch("/api/v1/referral/me");

    if (!response.ok) {
      const body = await response.text();
      if (isPendingEnrollmentNotFound(response.status, body)) {
        return { kind: "pending" };
      }
      console.error("[fetchReferralMeClient] non-OK", response.status, body);
      return { kind: "error", status: response.status };
    }

    const parsed = parseReferralMeJson(await response.json());
    if (parsed) {
      return { kind: "ok", payload: parsed };
    }
    return { kind: "error" };
  } catch (error) {
    console.error("[fetchReferralMeClient] fetch threw", error);
    return { kind: "error" };
  }
}

export type ReferralEnrollmentLoadResult = {
  enrollment: ReferralMePayload | null;
  issue?: "misconfigured" | "no_session" | "api_unreachable" | "unauthorized";
};

export type ReferralDashboardLoadResult = {
  data: ReferrerDashboardData | null;
  issue?: "misconfigured" | "no_session" | "api_unreachable" | "unauthorized";
};

export type ReferralDashboardFetchResult =
  | {
      kind: "ok";
      payload: NonNullable<ReturnType<typeof parseReferralDashboardJson>>;
    }
  | { kind: "pending" }
  | { kind: "error"; status?: number };

/** GET /api/v1/referral/me/dashboard — referees, summary stats, and commissions. */
export async function fetchReferralDashboardClient(): Promise<ReferralDashboardFetchResult> {
  if (!isAuthApiConfigured()) {
    return { kind: "error" };
  }

  try {
    const response = await apiFetch("/api/v1/referral/me/dashboard");
    if (!response.ok) {
      const body = await response.text();
      if (isPendingEnrollmentNotFound(response.status, body)) {
        return { kind: "pending" };
      }
      console.error(
        "[fetchReferralDashboardClient] non-OK",
        response.status,
        body,
      );
      return { kind: "error", status: response.status };
    }

    const parsed = parseReferralDashboardJson(await response.json());
    if (parsed) {
      return { kind: "ok", payload: parsed };
    }
    return { kind: "error", status: response.status };
  } catch (error) {
    console.error("[fetchReferralDashboardClient] fetch threw", error);
    return { kind: "error" };
  }
}

/** GET program + GET /me/dashboard — primary referral dashboard loader. */
export async function loadReferralDashboardClient(): Promise<ReferralDashboardLoadResult> {
  if (!isAuthApiConfigured()) {
    return { data: null, issue: "misconfigured" };
  }

  const program = await fetchReferralProgramClient();
  if (program.kind === "error") {
    if (program.status === 401) {
      return { data: null, issue: "no_session" };
    }
    return { data: null, issue: "api_unreachable" };
  }

  const dashboard = await fetchReferralDashboardClient();
  const appBaseUrl = isBrowser() ? window.location.origin : undefined;

  if (dashboard.kind === "ok") {
    return {
      data: buildReferrerDashboardFromApi(
        dashboard.payload,
        program.payload,
        appBaseUrl,
      ),
    };
  }

  if (dashboard.kind === "pending") {
    return {
      data: buildReferrerDashboardData(
        pendingEnrollmentFromProgram(program.payload),
        appBaseUrl,
      ),
    };
  }

  if (dashboard.kind === "error" && dashboard.status === 401) {
    return { data: null, issue: "unauthorized" };
  }

  return { data: null, issue: "api_unreachable" };
}

/** GET program, then GET /me — visible in DevTools as `/api/v1/referral/*` on your app origin. */
export async function loadReferralEnrollmentClient(): Promise<ReferralEnrollmentLoadResult> {
  if (!isAuthApiConfigured()) {
    return { enrollment: null, issue: "misconfigured" };
  }

  const program = await fetchReferralProgramClient();
  if (program.kind === "error") {
    if (program.status === 401) {
      return { enrollment: null, issue: "no_session" };
    }
    return { enrollment: null, issue: "api_unreachable" };
  }

  const me = await fetchReferralMeClient();
  if (me.kind === "error" && me.status === 401) {
    return { enrollment: null, issue: "unauthorized" };
  }

  const enrollment = composeReferralEnrollment(program.payload, me);
  if (!enrollment) {
    return { enrollment: null, issue: "api_unreachable" };
  }

  return { enrollment };
}

/** GET /api/v1/referral/me/transactions — commission history for the referrer. */
export async function fetchReferralTransactionsClient(): Promise<{
  transactions: TransactionData[];
  status: number;
}> {
  if (!isAuthApiConfigured()) {
    return { transactions: [], status: 0 };
  }

  try {
    const response = await apiFetch("/api/v1/referral/me/transactions");
    if (!response.ok) {
      console.error(
        "[fetchReferralTransactionsClient] non-OK",
        response.status,
        await response.text(),
      );
      return { transactions: [], status: response.status };
    }

    const payload = parseReferralTransactionsJson(await response.json());
    return {
      transactions: mapReferralTransactionsToUi(payload.transactions),
      status: response.status,
    };
  } catch (error) {
    console.error("[fetchReferralTransactionsClient] fetch threw", error);
    return { transactions: [], status: 0 };
  }
}

/** Loads the signed-in user from the HttpOnly session cookie (server reads cookie). */
export async function fetchSessionUserClient(): Promise<SessionUser | null> {
  if (!isBrowser()) {
    return null;
  }

  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as { user?: SessionUser };
    return json.user ?? null;
  } catch {
    return null;
  }
}

/** GET /api/v1/billing/subscriptions/me — DevTools: `/api/v1/billing/subscriptions/me`. */
export async function fetchBillingSubscriptionsMeClient(): Promise<{
  subscriptions: BillingSubscription[];
  activeSubscriptions: BillingSubscription[];
  accountCredits: BillingAccountCredits | null;
  refereeBenefit: BillingRefereeBenefit | null;
  status: number;
}> {
  if (!isAuthApiConfigured()) {
    return {
      subscriptions: [],
      activeSubscriptions: [],
      accountCredits: null,
      refereeBenefit: null,
      status: 0,
    };
  }

  const response = await apiFetch("/api/v1/billing/subscriptions/me");
  if (!response.ok) {
    console.error(
      "[fetchBillingSubscriptionsMeClient] non-OK",
      response.status,
      await response.text(),
    );
    return {
      subscriptions: [],
      activeSubscriptions: [],
      accountCredits: null,
      refereeBenefit: null,
      status: response.status,
    };
  }

  try {
    const json = await response.json();
    const payload = parseBillingSubscriptionsMeJson(json);
    return {
      subscriptions: payload.subscriptions,
      activeSubscriptions: filterActiveSubscriptions(payload.subscriptions),
      accountCredits: payload.accountCredits,
      refereeBenefit: payload.refereeBenefit,
      status: response.status,
    };
  } catch {
    return {
      subscriptions: [],
      activeSubscriptions: [],
      accountCredits: null,
      refereeBenefit: null,
      status: response.status,
    };
  }
}

/** POST /api/v1/referral/code/validate — browser signup validation. */
export async function validateReferralCodeClient(
  code: string,
): Promise<ValidateReferralCodeResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { kind: "invalid", code: normalized };
  }

  if (!isAuthApiConfigured()) {
    return { kind: "error" };
  }

  try {
    const response = await apiFetch("/api/v1/referral/code/validate", {
      method: "POST",
      auth: false,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: normalized }),
    });

    if (response.status === 400) {
      return { kind: "invalid", code: normalized };
    }

    if (!response.ok) {
      console.error(
        "[validateReferralCodeClient] non-OK",
        response.status,
        await response.text(),
      );
      return { kind: "error" };
    }

    return toValidateReferralCodeResult(
      normalized,
      parseReferralCodeValidateJson(await response.json()),
    );
  } catch (error) {
    console.error("[validateReferralCodeClient] fetch threw", error);
    return { kind: "error" };
  }
}

export type ReferralTermsAcceptClientResult =
  | { ok: true; accept: ReferralTermsAcceptPayload }
  | { ok: false; status: number };

export async function acceptReferralTermsClient(): Promise<ReferralTermsAcceptClientResult> {
  if (!isAuthApiConfigured()) {
    return { ok: false, status: 0 };
  }

  const response = await apiFetch("/api/v1/referral/terms/accept", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const accept = parseReferralTermsAcceptJson(await response.json());
  if (!accept) {
    console.error("[acceptReferralTermsClient] unexpected accept response shape");
    return { ok: false, status: response.status };
  }

  return { ok: true, accept };
}
