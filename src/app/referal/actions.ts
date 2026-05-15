"use server";

import { redirect } from "next/navigation";

import { getReferralApiAuth } from "@/lib/referrals/fetch-referral-me";

function safeReturnTo(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") ? raw : "/referal";
}

/**
 * POST `{AUTH_API_BASE_URL}/api/v1/referral/terms/accept` with Bearer from env.
 * After success, redirect to `/referal`; the next load uses GET /referral/me to
 * detect acceptance. Logs to the server terminal on failure.
 */
export async function acceptReferralTermsAction(formData: FormData) {
  const returnTo = safeReturnTo(formData.get("returnTo"));
  const auth = getReferralApiAuth();

  if (!auth) {
    redirect(`${returnTo}?termsError=terms-misconfigured`);
  }

  const url = `${auth.base.replace(/\/$/, "")}/api/v1/referral/terms/accept`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${auth.bearer}`,
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
