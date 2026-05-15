"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { formatCurrency } from "@/lib/referrals/format";
import { MOCK_PRICING_PLANS } from "@/lib/referrals/mock-plans";

const MIN_PASSWORD_LENGTH = 8;

function signupUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/signup?${q.toString()}`;
}

type SignupFormProps = {
  initialEmail: string;
  initialReferralCode: string;
  initialPlanId: string;
};

export function SignupForm({
  initialEmail,
  initialReferralCode,
  initialPlanId,
}: SignupFormProps) {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const workEmail = String(fd.get("workEmail") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "").trim();
    const referralCode = String(fd.get("referralCode") ?? "").trim().toUpperCase();
    const planId = String(fd.get("planId") ?? "").trim();

    const base: Record<string, string> = {};
    if (referralCode) base.ref = referralCode;
    if (planId) base.plan = planId;
    if (workEmail) base.email = workEmail;

    if (!referralCode) {
      window.location.assign(signupUrl({ ...base, error: "missing-referral" }));
      return;
    }
    if (!workEmail || !password || !planId) {
      window.location.assign(signupUrl({ ...base, error: "missing-fields" }));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      window.location.assign(signupUrl({ ...base, error: "weak-password" }));
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim().replace(
      /\/$/,
      "",
    );
    if (!apiBase) {
      window.location.assign(signupUrl({ ...base, error: "auth-misconfigured" }));
      return;
    }

    const url = `${apiBase}/api/v1/auth/demo`;

    setPending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: workEmail }),
      });

      if (!res.ok) {
        const err =
          res.status >= 400 && res.status < 500 ? "auth-rejected" : "auth-unavailable";
        window.location.assign(signupUrl({ ...base, error: err }));
        return;
      }

      window.location.assign(
        signupUrl({
          ...base,
          status: "success",
          email: workEmail,
        }),
      );
    } catch {
      window.location.assign(signupUrl({ ...base, error: "auth-unavailable" }));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="work-email"
        >
          Email
        </label>
        <input
          id="work-email"
          name="workEmail"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder="name@company.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="referral-code"
        >
          Referral code
        </label>
        <input
          id="referral-code"
          name="referralCode"
          type="text"
          autoComplete="off"
          spellCheck={false}
          defaultValue={initialReferralCode}
          placeholder="e.g. HARSH25"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-medium uppercase tracking-wide text-slate-950 shadow-sm outline-none transition placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
        />
        <p className="text-sm text-slate-600">
          Prefilled from your invite link when available. You can edit it;
          what you submit overrides the referral cookie.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Choose your plan</p>
        <div className="grid gap-3 md:grid-cols-4">
          {MOCK_PRICING_PLANS.map((plan) => {
            const isSelected = plan.id === initialPlanId;

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
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
