import "server-only";

import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";
import { fetchReferralProgram } from "@/lib/referrals/fetch-referral-program";
import {
  composeReferralEnrollment,
  isPendingEnrollmentNotFound,
  parseReferralMeJson,
  type ReferralMeFetchResult,
  type ReferralMePayload,
} from "@/lib/referrals/referral-payload";

export type { ReferralMePayload };

async function fetchReferralMeResponse(
  base: string,
  headers: Record<string, string>,
): Promise<ReferralMeFetchResult> {
  const url = `${base}/api/v1/referral/me`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchReferralMe] fetch threw", { url, error });
    return { kind: "error" };
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = await response.text();
    } catch {
      /* ignore */
    }

    if (isPendingEnrollmentNotFound(response.status, bodyPreview)) {
      return { kind: "pending" };
    }

    console.error("[fetchReferralMe] non-OK", {
      url,
      status: response.status,
      bodyPreview: bodyPreview.slice(0, 500),
    });
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

/**
 * Server-side: GET /api/v1/referral/program, then GET /api/v1/referral/me.
 * The live `/referal` page loads via `loadReferralEnrollmentClient` (browser fetch, DevTools Network).
 */
export async function fetchReferralMe(): Promise<ReferralMePayload | null> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return null;
  }

  const program = await fetchReferralProgram();
  if (!program) {
    return null;
  }

  const me = await fetchReferralMeResponse(base, headers);
  return composeReferralEnrollment(program, me);
}
