import { NextResponse } from "next/server";

import { getDashboardByReferralCode } from "@/lib/referrals/get-referrer-dashboard";
import { createMockSignupSubmission } from "@/lib/referrals/mock-signup";
import { ACTIVE_REFERRAL_COOKIE, REFERRAL_SESSION_MAX_AGE } from "@/lib/referrals/mock-session";
import { getMockPlanById } from "@/lib/referrals/mock-plans";

export async function POST(request: Request) {
  const formData = await request.formData();
  const workEmail = String(formData.get("workEmail") ?? "").trim().toLowerCase();
  const referralCode = String(formData.get("referralCode") ?? "").trim().toUpperCase();
  const planId = String(formData.get("planId") ?? "").trim();

  const redirectUrl = new URL("/signup", request.url);

  if (referralCode) {
    redirectUrl.searchParams.set("ref", referralCode);
  }

  if (planId) {
    redirectUrl.searchParams.set("plan", planId);
  }

  if (!workEmail || !referralCode || !planId) {
    redirectUrl.searchParams.set("error", "missing-fields");
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    const dashboard = await getDashboardByReferralCode(referralCode);
    const plan = getMockPlanById(planId);

    if (!dashboard || !plan) {
      redirectUrl.searchParams.set("error", "invalid-referral");
      return NextResponse.redirect(redirectUrl, 303);
    }

    await createMockSignupSubmission({
      referrerUserId: dashboard.userId,
      workEmail,
      referralCode,
      planId: plan.id,
      source: "local-signup-form",
    });
  } catch {
    redirectUrl.searchParams.set("error", "server-unavailable");
    return NextResponse.redirect(redirectUrl, 303);
  }

  redirectUrl.searchParams.set("status", "success");
  redirectUrl.searchParams.set("email", workEmail);

  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set({
    name: ACTIVE_REFERRAL_COOKIE,
    value: referralCode,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: REFERRAL_SESSION_MAX_AGE,
  });

  return response;
}
