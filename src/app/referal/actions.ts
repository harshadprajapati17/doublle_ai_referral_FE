"use server";

import { redirect } from "next/navigation";

import {
  getAuthApiBase,
  referralApiHeaders,
} from "@/lib/referrals/auth-api";

function safeReturnTo(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") ? raw : "/referal";
}

/**
 * POST `{AUTH_API_BASE_URL}/api/v1/referral/terms/accept` with the login session cookie.
 * After success, redirect to `/referal`; the next load uses GET /referral/me to
 * detect acceptance. Logs to the server terminal on failure.
 */
export async function acceptReferralTermsAction(formData: FormData) {
  const returnTo = safeReturnTo(formData.get("returnTo"));
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();

  if (!base) {
    redirect(`${returnTo}?termsError=terms-misconfigured`);
  }

  if (!headers) {
    redirect(`${returnTo}?termsError=terms-rejected`);
  }

  const url = `${base}/api/v1/referral/terms/accept`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[acceptReferralTermsAction] upstream fetch threw", {
      url,
      error,
    });
    redirect(`${returnTo}?termsError=terms-unavailable`);
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = (await response.text()).slice(0, 800);
    } catch {
      /* ignore */
    }
    console.error("[acceptReferralTermsAction] upstream non-OK", {
      url,
      status: response.status,
      statusText: response.statusText,
      bodyPreview,
    });
    const termsError =
      response.status >= 400 && response.status < 500
        ? "terms-rejected"
        : "terms-unavailable";
    redirect(`${returnTo}?termsError=${termsError}`);
  }

  redirect(returnTo);
}
