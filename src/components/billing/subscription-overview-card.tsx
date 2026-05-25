"use client";

import { AccountCreditBalance } from "@/components/billing/account-credit-balance";
import { SubscriptionPlanSummary } from "@/components/billing/subscription-plan-summary";
import {
  daysUntilDate,
  formatBillingDate,
} from "@/lib/billing/billing-display";
import { planPaymentContextFromAmount } from "@/lib/billing/account-credit";
import type {
  BillingAccountCredits,
  BillingRefereeBenefit,
  BillingSubscription,
} from "@/lib/referrals/billing-payload";

export function SubscriptionOverviewCard({
  subscription,
  accountCredits = null,
  refereeBenefit = null,
}: {
  subscription: BillingSubscription;
  accountCredits?: BillingAccountCredits | null;
  refereeBenefit?: BillingRefereeBenefit | null;
}) {
  const renewalAt = subscription.nextChargeAt ?? subscription.currentPeriodEnd;
  const periodEnd = formatBillingDate(renewalAt);
  const daysLeft = daysUntilDate(renewalAt);
  const cancelScheduled = subscription.cancelAtPeriodEnd;
  const planPayment = planPaymentContextFromAmount(
    subscription.amount,
    subscription.currency,
  );

  const renewalLine = cancelScheduled
    ? `Ends ${periodEnd}`
    : daysLeft !== null && periodEnd !== "—"
      ? `${periodEnd} (${daysLeft} day${daysLeft === 1 ? "" : "s"})`
      : periodEnd !== "—"
        ? periodEnd
        : null;

  const autoRenewLabel = cancelScheduled ? "Off at period end" : "On";

  return (
    <div className="billing-overview-container w-full">
      {planPayment ? (
        <AccountCreditBalance
          planPayment={planPayment}
          refereeBenefit={refereeBenefit}
          subscription={subscription}
          accountCredits={accountCredits}
        />
      ) : null}

      <SubscriptionPlanSummary
        planName={subscription.planName}
        amount={subscription.amount}
        currency={subscription.currency}
        frequency={subscription.frequency}
        status={subscription.status}
        cancelAtPeriodEnd={cancelScheduled}
        currentPeriodStart={subscription.currentPeriodStart}
        currentPeriodEnd={subscription.currentPeriodEnd}
        renewalLine={renewalLine}
        autoRenewLabel={autoRenewLabel}
        subscriptionId={subscription.id}
      />
    </div>
  );
}
