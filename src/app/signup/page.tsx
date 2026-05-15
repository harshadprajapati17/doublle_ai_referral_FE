import type { Metadata } from "next";
import { cookies } from "next/headers";

import { SignupForm } from "@/app/signup/signup-form";
import {
  getMockPlanById,
  MOCK_PRICING_PLANS,
} from "@/lib/referrals/mock-plans";
import { ACTIVE_REFERRAL_COOKIE } from "@/lib/referrals/mock-session";

export const metadata: Metadata = {
  title: "Signup",
  description: "Create your Doublle workspace and choose a plan.",
};

interface SignupPageProps {
  searchParams: Promise<{
    ref?: string | string[];
    status?: string | string[];
    error?: string | string[];
    email?: string | string[];
    plan?: string | string[];
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const referralCode = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const planParam = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const activeReferralCookie = (await cookies()).get(
    ACTIVE_REFERRAL_COOKIE,
  )?.value;
  const selectedPlan =
    getMockPlanById(planParam ?? "yearly") ?? MOCK_PRICING_PLANS[3];

  const referralCodeDefault = referralCode ?? activeReferralCookie ?? "";

  const successMessage =
    status === "success" && email
      ? `You are signed up as ${email} on the ${selectedPlan.name} plan.`
      : null;

  const errorMessage =
    error === "missing-fields"
      ? "Enter your email, password, referral code, and choose a plan before continuing."
      : error === "missing-referral"
        ? "Use the signup link from your referrer so your invite can be applied."
        : error === "weak-password"
          ? "Use a password with at least 8 characters."
          : error === "server-unavailable"
            ? "Signup is temporarily unavailable. Try again in a moment."
            : error === "auth-rejected"
              ? "We could not create an account with that email. Try a different email or check with support."
              : error === "auth-unavailable"
                ? "The sign-in service is not reachable. Ensure the API is running and try again."
                : error === "auth-misconfigured"
                  ? "Signup is not configured: set NEXT_PUBLIC_AUTH_API_BASE_URL to your auth API origin (same URL the browser should call)."
                  : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
              Sign up
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Create your Doublle workspace
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Choose your plan and set your account credentials to continue.
            </p>
          </div>
        </header>

        <section>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="space-y-5">
              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  {successMessage}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <SignupForm
                initialEmail={email ?? ""}
                initialReferralCode={referralCodeDefault}
                initialPlanId={selectedPlan.id}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
