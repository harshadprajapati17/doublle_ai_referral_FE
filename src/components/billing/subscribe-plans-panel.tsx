"use client";

import { useCallback, useEffect, useState } from "react";

import { createBillingSubscriptionClient } from "@/lib/billing/create-subscription";
import {
  getCheckoutPlans,
  isPaymentsEnabled,
  type CheckoutPlan,
} from "@/lib/billing/payments-config";
import { pollUntilActiveSubscription } from "@/lib/billing/poll-subscription";
import { openRazorpaySubscriptionCheckout } from "@/lib/billing/razorpay";

type SubscribePlansPanelProps = {
  onSubscriptionActivated: () => void | Promise<void>;
};

type PaymentReceipt = {
  paymentId?: string;
  subscriptionId?: string;
  planLabel: string;
  amount: number;
  currency: string;
};

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

export function SubscribePlansPanel({ onSubscriptionActivated }: SubscribePlansPanelProps) {
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
            setError("Payment failed. Please try again or use a different method.");
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
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-950">No active subscription</p>
        <p className="mt-2 text-sm text-slate-600">
          Payments are not configured. Set{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_AUTH_API_BASE_URL
          </code>{" "}
          to enable checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <p className="text-base font-semibold text-slate-950">No active subscription</p>
        <p className="mt-2 text-sm text-slate-600">
          Choose a plan to activate your workspace with secure Razorpay checkout.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      {receipt ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {activating ? (
            <p>Activating your {receipt.planLabel} plan…</p>
          ) : (
            <p>
              Payment authorized for {receipt.planLabel} (
              {formatPlanPrice(receipt.amount, receipt.currency)}).
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const pending = checkoutPlanKey === plan.key;

          return (
            <article
              key={plan.key}
              className={`flex flex-col rounded-[24px] border p-5 ${
                plan.highlighted
                  ? "border-sky-300 bg-sky-50/50 ring-1 ring-sky-200"
                  : "border-slate-200 bg-slate-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950">{plan.label}</h4>
                  <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                </div>
                {plan.badge ? (
                  <span className="shrink-0 rounded-full bg-sky-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <span aria-hidden="true">⭐ </span>
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
                {formatPlanPrice(plan.monthlyRate, plan.currency)}
                <span className="ml-1 text-sm font-medium text-slate-500">/ mo</span>
              </p>

              {plan.months > 1 ? (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Pay today:</span>{" "}
                  {formatPlanPrice(plan.amount, plan.currency)}
                  <span className="text-slate-500">
                    {" "}
                    · {plan.months} months via Razorpay
                  </span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Pay today:</span>{" "}
                  {formatPlanPrice(plan.amount, plan.currency)} via Razorpay
                </p>
              )}

              <button
                type="button"
                disabled={!sdkReady || pending || activating}
                onClick={() => void startCheckout(plan)}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.highlighted
                    ? "bg-slate-950 text-white hover:bg-slate-800"
                    : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                {!sdkReady
                  ? "Loading payments…"
                  : pending
                    ? "Opening checkout…"
                    : `Pay ${formatPlanPrice(plan.amount, plan.currency)}`}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
