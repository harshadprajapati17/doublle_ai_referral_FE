"use client";

import {
  buildAccountCreditBalanceView,
  type PlanPaymentContext,
} from "@/lib/billing/account-credit";
import type {
  BillingAccountCredits,
  BillingRefereeBenefit,
  BillingSubscription,
} from "@/lib/referrals/billing-payload";

type AccountCreditBalanceProps = {
  planPayment: PlanPaymentContext;
  refereeBenefit?: BillingRefereeBenefit | null;
  subscription?: BillingSubscription | null;
  accountCredits?: BillingAccountCredits | null;
};

export function AccountCreditBalance({
  planPayment,
  refereeBenefit = null,
  subscription = null,
  accountCredits = null,
}: AccountCreditBalanceProps) {
  const balance = buildAccountCreditBalanceView(
    planPayment,
    refereeBenefit,
    subscription,
    accountCredits,
  );
  const { usage } = balance;

  return (
    <section
      className="billing-credit-hero w-full px-6 py-7 sm:px-8 sm:py-9 lg:px-10"
      aria-label="Account credits"
    >
      <div className="billing-credit-glow" aria-hidden />

      <div className="relative flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white/55">
              Account credits
            </p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
                {balance.totalCreditsFormatted}
              </span>
              <span className="text-lg font-medium text-white/70 sm:text-xl">
                {balance.unitLabel}
              </span>
            </p>

            {balance.showBenefitBreakdown ? (
              <div className="mt-4 flex w-full max-w-2xl flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm">
                <span className="text-white/60">
                  Plan{" "}
                  <span className="font-semibold tabular-nums text-white">
                    {balance.planCreditsFormatted}
                  </span>
                </span>
                <span className="text-white/35" aria-hidden>
                  +
                </span>
                <span className="text-white/60">
                  Referral{" "}
                  <span className="font-semibold tabular-nums text-[#6ee7b7]">
                    {balance.benefitCreditsFormatted}
                  </span>
                  {balance.refereeBenefit?.code ? (
                    <span className="ml-1 font-mono text-xs text-white/50">
                      ({balance.refereeBenefit.code})
                    </span>
                  ) : null}
                </span>
                {balance.benefitPending ? (
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-white/70">
                    Benefit processing
                  </span>
                ) : balance.benefitApplied ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-emerald-200">
                    Benefit applied
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex w-full shrink-0 gap-6 sm:w-auto sm:gap-10 sm:pb-1">
            <div className="min-w-[5.5rem] sm:text-right">
              <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/50">
                Used
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white sm:text-2xl">
                {usage.usedFormatted}
              </p>
            </div>
            <div className="min-w-[5.5rem] sm:text-right">
              <p className="text-[0.625rem] font-medium uppercase tracking-wider text-white/50">
                Remaining
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white sm:text-2xl">
                {usage.remainingFormatted}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={usage.usedPercent}
            aria-label={`${usage.usedPercent}% of credits used`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6ee7b7] to-[#93c5fd] transition-[width] duration-500 ease-out"
              style={{ width: `${usage.usedPercent}%` }}
            />
          </div>
          <p className="mt-2.5 w-full text-xs text-white/55 sm:text-sm">
            {usage.usedFormatted} of {usage.totalFormatted} {usage.unitLabel} used this cycle
          </p>
        </div>
      </div>
    </section>
  );
}
