import "server-only";

import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";
import {
  parseReferralProgramJson,
  type ReferralProgramPayload,
} from "@/lib/referrals/referral-payload";

export type { ReferralProgramPayload };

/** GET {AUTH_API_BASE_URL}/api/v1/referral/program — server-side. */
export async function fetchReferralProgram(): Promise<ReferralProgramPayload | null> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return null;
  }

  const url = `${base}/api/v1/referral/program`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { ...headers, accept: "application/json" },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchReferralProgram] fetch threw", { url, error });
    return null;
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = (await response.text()).slice(0, 500);
    } catch {
      /* ignore */
    }
    console.error("[fetchReferralProgram] non-OK", {
      url,
      status: response.status,
      bodyPreview,
    });
    return null;
  }

  try {
    return parseReferralProgramJson(await response.json());
  } catch {
    return null;
  }
}
