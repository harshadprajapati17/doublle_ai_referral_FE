"use client";

import { useEffect, useState } from "react";

import { SubscribePlansPanel } from "@/components/billing/subscribe-plans-panel";
import { SubscriptionOverviewCard } from "@/components/billing/subscription-overview-card";
import {
  workspaceFluidContentClass,
  workspaceModuleContentTopPaddingClass,
} from "@/components/workspace/workspace-content-inset";
import { WorkspaceMainLoading } from "@/components/workspace/workspace-main-loading";
import type {
  BillingAccountCredits,
  BillingRefereeBenefit,
  BillingSubscription,
} from "@/lib/referrals/billing-payload";
import {
  fetchBillingSubscriptionsMeClient,
  fetchSessionUserClient,
  isAuthApiConfigured,
} from "@/lib/referrals/referral-api-client";

export function WorkspaceDashboard() {
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    BillingSubscription[]
  >([]);
  const [accountCredits, setAccountCredits] =
    useState<BillingAccountCredits | null>(null);
  const [refereeBenefit, setRefereeBenefit] =
    useState<BillingRefereeBenefit | null>(null);
  const [billingStatus, setBillingStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBilling = async () => {
    const billing = await fetchBillingSubscriptionsMeClient();
    setActiveSubscriptions(billing.activeSubscriptions);
    setAccountCredits(billing.accountCredits);
    setRefereeBenefit(billing.refereeBenefit);
    setBillingStatus(billing.status);
  };

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!isAuthApiConfigured()) {
        setBillingStatus(0);
        setLoading(false);
        return;
      }

      const billing = await fetchBillingSubscriptionsMeClient();
      if (cancelled) {
        return;
      }

      await fetchSessionUserClient();
      setActiveSubscriptions(billing.activeSubscriptions);
      setAccountCredits(billing.accountCredits);
      setRefereeBenefit(billing.refereeBenefit);
      setBillingStatus(billing.status);
      setLoading(false);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <WorkspaceMainLoading label="Loading billing…" />;
  }

  const billingUnavailable =
    billingStatus !== null && billingStatus > 0 && billingStatus !== 200;

  const fluidPageClass = `${workspaceFluidContentClass} ${workspaceModuleContentTopPaddingClass} pb-8`;

  return (
    <div className="w-full bg-ws-page">
      {billingUnavailable ? (
        <section className="w-full border-b border-ws-border">
          <div className={fluidPageClass}>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-6 py-4 text-sm text-amber-800 sm:px-8">
              We could not load your subscription (HTTP {billingStatus}). Confirm the
              billing API is running and you are signed in.
            </div>
          </div>
        </section>
      ) : activeSubscriptions.length === 0 ? (
        <section className="w-full">
          <div className={fluidPageClass}>
            <SubscribePlansPanel onSubscriptionActivated={refreshBilling} />
          </div>
        </section>
      ) : (
        <section className="w-full">
          <div className={fluidPageClass}>
            <div className="w-full space-y-6">
              {activeSubscriptions.map((subscription) => (
                <SubscriptionOverviewCard
                  key={subscription.id}
                  subscription={subscription}
                  accountCredits={accountCredits}
                  refereeBenefit={refereeBenefit}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
