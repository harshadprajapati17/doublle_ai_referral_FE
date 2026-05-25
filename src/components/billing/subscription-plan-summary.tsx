"use client";

import {
  billingStatusTone,
  formatBillingDate,
  formatBillingPrice,
  formatBillingStatusLabel,
  formatFrequencyLabel,
} from "@/lib/billing/billing-display";
const insetClass = "px-6 sm:px-8 lg:px-10";

type SubscriptionPlanSummaryProps = {
  planName: string;
  amount: number | null;
  currency: string | null;
  frequency: string | null;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  renewalLine: string | null;
  autoRenewLabel: string;
  subscriptionId: string;
};

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={`flex h-full min-w-0 flex-col justify-center ${insetClass} py-4 sm:py-5`}>
      <p className="text-[0.625rem] font-medium uppercase tracking-wider text-ws-muted">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-ws-primary sm:text-[0.9375rem]">
        {value}
      </p>
    </div>
  );
}

export function SubscriptionPlanSummary({
  planName,
  amount,
  currency,
  frequency,
  status,
  cancelAtPeriodEnd,
  currentPeriodStart,
  currentPeriodEnd,
  renewalLine,
  autoRenewLabel,
  subscriptionId,
}: SubscriptionPlanSummaryProps) {
  const price = formatBillingPrice(amount, currency);
  const frequencyLabel = formatFrequencyLabel(frequency);
  const periodRange =
    currentPeriodStart && currentPeriodEnd
      ? `${formatBillingDate(currentPeriodStart)} – ${formatBillingDate(currentPeriodEnd)}`
      : "—";

  const metricCount = renewalLine ? 3 : 2;

  return (
    <section className="w-full bg-ws-card" aria-label="Subscription">
      <div
        className={`flex w-full flex-wrap items-center justify-between gap-3 border-b border-ws-border ${insetClass} py-4 sm:py-5`}
      >
        <h3 className="text-sm font-semibold text-ws-primary sm:text-[0.9375rem]">
          Subscription & billing
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ${billingStatusTone(status)}`}
          >
            {formatBillingStatusLabel(status)}
          </span>
          {cancelAtPeriodEnd ? (
            <span className="inline-flex rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-amber-800">
              Cancels at period end
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid w-full border-b border-ws-border lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div
          className={`flex min-w-0 flex-col justify-center border-b border-ws-border lg:border-b-0 lg:border-r ${insetClass} py-5 sm:py-6`}
        >
          <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ws-muted">
            Current plan
          </p>
          <p className="mt-1.5 text-lg font-semibold text-ws-primary sm:text-xl">
            {planName}
            {frequencyLabel !== "—" ? (
              <span className="font-medium text-ws-secondary"> · {frequencyLabel}</span>
            ) : null}
          </p>
        </div>
        <div className={`flex min-w-0 flex-col justify-center sm:items-end sm:text-right ${insetClass} py-5 sm:py-6`}>
          <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ws-muted">
            Charge
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ws-primary sm:text-3xl">
            {price}
            {frequencyLabel !== "—" ? (
              <span className="ml-1 text-sm font-medium text-ws-muted sm:text-base">
                / {frequencyLabel.toLowerCase()}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div
        className={`grid w-full divide-y divide-ws-border border-b border-ws-border sm:divide-x sm:divide-y-0 ${
          metricCount === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {renewalLine ? <MetricCell label="Next billing" value={renewalLine} /> : null}
        <MetricCell label="Current period" value={periodRange} />
        <MetricCell label="Auto-renew" value={autoRenewLabel} />
      </div>

      <div
        className={`flex w-full flex-col gap-1 bg-ws-page/40 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${insetClass} py-3.5`}
      >
        <p className="text-[0.625rem] font-medium uppercase tracking-wider text-ws-muted">
          Subscription ID
        </p>
        <p className="break-all font-mono text-xs text-ws-secondary sm:text-right">
          {subscriptionId}
        </p>
      </div>
    </section>
  );
}
