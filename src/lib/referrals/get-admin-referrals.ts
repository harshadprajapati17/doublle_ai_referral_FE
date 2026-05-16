import "server-only";

import type { AdminReferralRow } from "@/lib/referrals/types";

/**
 * Admin referral rows will be loaded from backend APIs when operators need this view.
 * Returns an empty list until an admin endpoint exists.
 */
export async function getAdminReferralRows(): Promise<AdminReferralRow[]> {
  return [];
}
