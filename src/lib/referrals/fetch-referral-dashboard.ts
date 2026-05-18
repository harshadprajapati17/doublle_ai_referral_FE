import "server-only";

import {
  buildReferrerDashboardData,
  buildReferrerDashboardFromApi,
} from "@/lib/referrals/build-referrer-dashboard";
import { fetchReferralProgram } from "@/lib/referrals/fetch-referral-program";
import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";
import { parseReferralDashboardJson } from "@/lib/referrals/referral-dashboard-payload";
import {
  isPendingEnrollmentNotFound,
  pendingEnrollmentFromProgram,
} from "@/lib/referrals/referral-payload";
import type { ReferrerDashboardData } from "@/lib/referrals/types";

/** GET {AUTH_API_BASE_URL}/api/v1/referral/me/dashboard */
export async function fetchReferrerDashboard(
  appBaseUrl?: string,
): Promise<ReferrerDashboardData | null> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return null;
  }

  const program = await fetchReferralProgram();
  if (!program) {
    return null;
  }

  const url = `${base}/api/v1/referral/me/dashboard`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchReferrerDashboard] fetch threw", { url, error });
    return null;
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = await response.text();
    } catch {
      /* ignore */
    }

    if (isPendingEnrollmentNotFound(response.status, bodyPreview)) {
      return buildReferrerDashboardData(
        pendingEnrollmentFromProgram(program),
        appBaseUrl,
      );
    }

    console.error("[fetchReferrerDashboard] non-OK", {
      url,
      status: response.status,
      bodyPreview: bodyPreview.slice(0, 500),
    });
    return null;
  }

  try {
    const dashboard = parseReferralDashboardJson(await response.json());
    if (!dashboard) {
      return null;
    }
    return buildReferrerDashboardFromApi(dashboard, program, appBaseUrl);
  } catch {
    return null;
  }
}
