import "server-only";

import { buildReferrerDashboardData } from "@/lib/referrals/build-referrer-dashboard";
import { fetchReferralMe } from "@/lib/referrals/fetch-referral-me";
import {
  hasReferralApiSession,
  isReferralApiConfigured,
} from "@/lib/referrals/auth-api";
import type { ReferrerDashboardData } from "@/lib/referrals/types";

/** Server-side dashboard loader (for later use). Referral page uses client fetch today. */
export async function getReferrerDashboardData(
  userId: string,
  appBaseUrl?: string,
): Promise<ReferrerDashboardData | null> {
  void userId;

  if (!isReferralApiConfigured()) {
    return null;
  }
  if (!(await hasReferralApiSession())) {
    return null;
  }

  const me = await fetchReferralMe();
  if (!me) {
    return null;
  }

  return buildReferrerDashboardData(me, appBaseUrl);
}
