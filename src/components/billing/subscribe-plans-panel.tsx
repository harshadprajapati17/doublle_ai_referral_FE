"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AccountCreditBalance } from "@/components/billing/account-credit-balance";
import { createBillingSubscriptionClient } from "@/lib/billing/create-subscription";
import type { BillingRefereeBenefit } from "@/lib/referrals/billing-payload";
import {
  getCheckoutPlans,
  isPaymentsEnabled,
  type CheckoutPlan,
} from "@/lib/billing/payments-config";
import { pollUntilActiveSubscription } from "@/lib/billing/poll-subscription";
import { openRazorpaySubscriptionCheckout } from "@/lib/billing/razorpay";

type SubscribePlansPanelProps = {
  onSubscriptionActivated: () => void | Promise<void>;
  refereeBenefit?: BillingRefereeBenefit | null;
};

type PaymentReceipt = {
  paymentId?: string;
  subscriptionId?: string;
  planLabel: string;
  amount: number;
  currency: string;
};

const insetClass = "px-6 sm:px-8 lg:px-10";

function formatPlanPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function BillingNotice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-red-200/80 bg-red-50 text-red-800"
      : "border-emerald-200/80 bg-emerald-50 text-emerald-800";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-xs ${styles}`}
    >
      {children}
    </div>
  );
}

function SubscribePlanCard({
  plan,
  pending,
  disabled,
  sdkReady,
  onSelect,
}: {
  plan: CheckoutPlan;
  pending: boolean;
  disabled: boolean;
  sdkReady: boolean;
  onSelect: () => void;
}) {
  const highlighted = Boolean(plan.highlighted);
  const checkoutTotal = formatPlanPrice(plan.amount, plan.currency);
  const monthly = formatPlanPrice(plan.monthlyRate, plan.currency);

  return (
    <article
      className={`flex flex-col rounded-xl border p-3.5 ${
        highlighted
          ? "border-brand/30 bg-brand-soft/40"
          : "border-ws-border bg-ws-page/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-ws-primary">{plan.label}</h4>
        {plan.badge ? (
          <span className="shrink-0 rounded bg-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-0.5 text-xs text-ws-secondary">{plan.description}</p>

      <p className="mt-2 text-xl font-semibold tabular-nums leading-none text-ws-primary">
        {monthly}
        <span className="ml-0.5 text-xs font-medium text-ws-muted">/mo</span>
      </p>

      <p className="mt-1 text-xs text-ws-muted">
        Pay {checkoutTotal}
        {plan.months > 1 ? ` · ${plan.months} mo` : ""}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${
          highlighted
            ? "workspace-btn-accent"
            : "border border-ws-border bg-ws-card text-ws-primary hover:bg-ws-page"
        }`}
      >
        {!sdkReady
          ? "Loading…"
          : pending
            ? "Opening…"
            : `Pay ${checkoutTotal}`}
      </button>
    </article>
  );
}

export function SubscribePlansPanel({
  onSubscriptionActivated,
  refereeBenefit = null,
}: SubscribePlansPanelProps) {
  const paymentsEnabled = isPaymentsEnabled();
  const plans = getCheckoutPlans();

  const [sdkReady, setSdkReady] = useState(false);
  const [checkoutPlanKey, setCheckoutPlanKey] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    if (!paymentsEnabled) {
      return;
    }

    let cancelled = false;
    import("@/lib/billing/razorpay")
      .then(({ loadRazorpayCheckoutScript }) => loadRazorpayCheckoutScript())
      .then(() => {
        if (!cancelled) {
          setSdkReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSdkReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentsEnabled]);

  const startCheckout = useCallback(
    async (plan: CheckoutPlan) => {
      if (!paymentsEnabled) {
        return;
      }

      setError(null);
      setReceipt(null);
      setCheckoutPlanKey(plan.key);

      try {
        if (!sdkReady || !window.Razorpay) {
          throw new Error(
            "Payment SDK failed to load. Please refresh and try again.",
          );
        }

        const created = await createBillingSubscriptionClient({
          amount: plan.amount,
          currency: plan.currency,
          frequency: plan.frequency,
        });

        if (!created.ok || !created.checkout) {
          throw new Error(created.errorMessage ?? "Could not start checkout.");
        }

        await openRazorpaySubscriptionCheckout({
          keyId: created.checkout.keyId,
          subscriptionId: created.checkout.subscriptionId,
          planLabel: plan.label,
          onSuccess: (response) => {
            setCheckoutPlanKey(null);
            setReceipt({
              paymentId: response.razorpay_payment_id,
              subscriptionId: response.razorpay_subscription_id,
              planLabel: plan.label,
              amount: plan.amount,
              currency: plan.currency,
            });
            setActivating(true);
            void (async () => {
              const activated = await pollUntilActiveSubscription();
              setActivating(false);
              if (activated) {
                await onSubscriptionActivated();
              } else {
                setError(
                  "Payment received. Your subscription may take a moment to activate — refresh if it does not appear shortly.",
                );
              }
            })();
          },
          onDismiss: () => {
            setCheckoutPlanKey(null);
          },
          onFailed: () => {
            setError(
              "Payment failed. Please try again or use a different method.",
            );
            setCheckoutPlanKey(null);
          },
        });
        setCheckoutPlanKey(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not open checkout.";
        setError(message);
        setCheckoutPlanKey(null);
      }
    },
    [onSubscriptionActivated, paymentsEnabled, sdkReady],
  );

  if (!paymentsEnabled) {
    return (
      <div className={`billing-overview-container w-full ${insetClass} py-8 text-center`}>
        <p className="text-sm font-semibold text-ws-primary">
          No active subscription
        </p>
        <p className="mt-1.5 text-xs text-ws-secondary">
          Payments are not configured. Set{" "}
          <code className="rounded bg-ws-page px-1 py-0.5 font-mono text-[11px] text-ws-primary">
            NEXT_PUBLIC_AUTH_API_BASE_URL
          </code>{" "}
          to enable checkout.
        </p>
      </div>
    );
  }

  const checkoutDisabled = !sdkReady || activating;

  const previewPlan =
    (checkoutPlanKey ? plans.find((plan) => plan.key === checkoutPlanKey) : null) ??
    plans.find((plan) => plan.highlighted) ??
    plans[0];

  return (
    <div className="billing-overview-container w-full overflow-hidden">
      {previewPlan ? (
        <AccountCreditBalance
          planPayment={{
            paymentAmount: previewPlan.amount,
            currency: previewPlan.currency,
          }}
          refereeBenefit={refereeBenefit}
        />
      ) : null}

      {previewPlan ? (
        <div
          className={`flex w-full items-center justify-between gap-4 border-t border-ws-border bg-ws-page/40 py-3.5 text-sm ${insetClass}`}
        >
          <span className="text-ws-secondary">
            Plan payment · <span className="font-medium text-ws-primary">{previewPlan.label}</span>
          </span>
          <span className="font-semibold tabular-nums text-ws-primary">
            {formatPlanPrice(previewPlan.amount, previewPlan.currency)}
          </span>
        </div>
      ) : null}

      <div className="w-full border-t border-ws-border">
        <div className={`border-b border-ws-border py-4 ${insetClass}`}>
          <h3 className="text-sm font-semibold text-ws-primary">Choose a plan</h3>
          <p className="mt-1 text-xs text-ws-secondary">
            Secure Razorpay checkout. Subscription details appear above after payment.
          </p>
        </div>

        <div className={insetClass + " py-5"}>
        {error ? (
          <div className="mb-3">
            <BillingNotice tone="error">{error}</BillingNotice>
          </div>
        ) : null}

        {receipt ? (
          <div className="mb-3">
            <BillingNotice tone="success">
              {activating ? (
                <p>Activating {receipt.planLabel}…</p>
              ) : (
                <p>
                  Payment authorized — {receipt.planLabel} (
                  {formatPlanPrice(receipt.amount, receipt.currency)}).
                </p>
              )}
            </BillingNotice>
          </div>
        ) : null}

        <div className="grid w-full gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <SubscribePlanCard
              key={plan.key}
              plan={plan}
              sdkReady={sdkReady}
              pending={checkoutPlanKey === plan.key}
              disabled={checkoutDisabled || checkoutPlanKey === plan.key}
              onSelect={() => void startCheckout(plan)}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
