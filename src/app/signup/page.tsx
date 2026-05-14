import type { Metadata } from "next";
import { cookies } from "next/headers";

import { formatCurrency } from "@/lib/referrals/format";
import {
  calculateReferralCommission,
  getMockPlanById,
  MOCK_PRICING_PLANS,
} from "@/lib/referrals/mock-plans";
import { ACTIVE_REFERRAL_COOKIE } from "@/lib/referrals/mock-session";

export const metadata: Metadata = {
  title: "Signup",
  description:
    "Create your Doublle workspace with an optional referral code applied.",
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
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const planParam = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const activeReferralCookie = (await cookies()).get(ACTIVE_REFERRAL_COOKIE)?.value;
  const selectedPlan = getMockPlanById(planParam ?? "yearly") ?? MOCK_PRICING_PLANS[3];

  const successMessage =
    status === "success" && email && referralCode
      ? `Signup recorded for ${email} on the ${selectedPlan.name} plan with ${formatCurrency(calculateReferralCommission(selectedPlan.monthlyRevenue))} in pending referral credit.`
      : null;

  const errorMessage =
    error === "missing-fields"
      ? "Enter work email, referral code, and choose a plan before continuing."
      : error === "invalid-referral"
        ? "That referral code or plan is not valid. Check the details and try again."
      : error === "server-unavailable"
        ? "Signup is temporarily unavailable right now. Make sure the referral API is running."
        : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Referral signup
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Create your Doublle workspace
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Complete your signup to get started with Doublle. If you arrived from a
              referral link, your code is already applied below.
            </p>
          </div>
        </header>

        <section>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
              <p className="text-sm font-semibold text-sky-800">
                {referralCode ? "Referral applied" : "Add a referral code"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {referralCode
                  ? `Your signup includes referral code ${referralCode}.`
                  : "If you have a referral code, enter it below before continuing."}
              </p>
            </div>

            {successMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <form action="/api/mock-signup" method="post" className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="work-email">
                  Work email
                </label>
                <input
                  id="work-email"
                  name="workEmail"
                  type="email"
                  defaultValue={email ?? ""}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="referral-code">
                  Referral code
                </label>
                <input
                  id="referral-code"
                  name="referralCode"
                  type="text"
                  defaultValue={referralCode ?? ""}
                  placeholder="Enter referral code"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
                <p className="text-sm leading-6 text-slate-600">
                  Manual code entry can override the active cookie during signup.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Choose your plan</p>
                <div className="grid gap-3 md:grid-cols-4">
                  {MOCK_PRICING_PLANS.map((plan) => {
                    const isSelected = plan.id === selectedPlan.id;

                    return (
                      <label
                        key={plan.id}
                        className="group block h-full cursor-pointer rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 transition hover:border-slate-300 hover:bg-white has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50 has-[:checked]:ring-2 has-[:checked]:ring-sky-500/15"
                      >
                        <input
                          type="radio"
                          name="planId"
                          value={plan.id}
                          defaultChecked={isSelected}
                          className="sr-only"
                        />
                        <div className="grid h-full min-h-[160px] grid-rows-[auto_auto_1fr_auto] gap-2.5">
                          <p className="text-xl font-semibold leading-7 text-slate-950">
                            {plan.name}
                          </p>
                          <span
                            aria-hidden={!plan.badge}
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${
                              plan.badge
                                ? "bg-amber-100 text-amber-800 group-has-[:checked]:bg-sky-100 group-has-[:checked]:text-sky-800"
                                : "invisible"
                            }`}
                          >
                            {plan.badge ?? "Most Popular"}
                          </span>
                          <div>
                            <p className="text-xs leading-5 text-slate-600 group-has-[:checked]:text-sky-700">
                              {plan.description}
                            </p>
                          </div>
                          <p className="text-base font-semibold leading-6 text-slate-950">
                            {formatCurrency(plan.labelMonthlyRevenue)}/mo
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue signup
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
