import "server-only";

import { getAuthApiBase } from "@/lib/referrals/auth-api";
import {
  parseReferralCodeValidateJson,
  toValidateReferralCodeResult,
  type ValidateReferralCodeResult,
} from "@/lib/referrals/validate-referral-code";

/** POST `{AUTH_API_BASE_URL}/api/v1/referral/code/validate` — unauthenticated signup check. */
export async function validateReferralCode(
  code: string,
): Promise<ValidateReferralCodeResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { kind: "invalid", code: normalized };
  }

  const base = getAuthApiBase();
  if (!base) {
    return { kind: "error" };
  }

  const url = `${base}/api/v1/referral/code/validate`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({ code: normalized }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[validateReferralCode] fetch threw", { url, error });
    return { kind: "error" };
  }

  if (response.status === 400) {
    return { kind: "invalid", code: normalized };
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = (await response.text()).slice(0, 500);
    } catch {
      /* ignore */
    }
    console.error("[validateReferralCode] non-OK", {
      url,
      status: response.status,
      bodyPreview,
    });
    return { kind: "error" };
  }

  try {
    return toValidateReferralCodeResult(
      normalized,
      parseReferralCodeValidateJson(await response.json()),
    );
  } catch {
    return { kind: "error" };
  }
}
