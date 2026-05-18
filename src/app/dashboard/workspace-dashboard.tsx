"use client";

import { useEffect, useState } from "react";

import { WorkspaceAppShell } from "@/components/workspace/workspace-app-shell";
import { getClientSessionUser } from "@/lib/referrals/auth-token";
import {
  isAppliedRefereeBenefit,
  type BillingRefereeBenefit,
  type BillingSubscription,
} from "@/lib/referrals/billing-payload";
import { SubscribePlansPanel } from "@/components/billing/subscribe-plans-panel";
import {
  fetchBillingSubscriptionsMeClient,
  fetchSessionUserClient,
  isAuthApiConfigured,
} from "@/lib/referrals/referral-api-client";
import type { SessionUser } from "@/lib/referrals/types";

const FALLBACK_USER: SessionUser = {
  id: "user",
  name: "there",
  email: "",
};

function formatAmount(amount: number | null): string {
  if (amount === null) {
    return "—";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCurrencyCode(currency: string | null): string {
  return currency?.trim().toUpperCase() || "—";
}

function formatFrequency(frequency: string | null): string {
  if (!frequency) {
    return "—";
  }
  return frequency
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function statusTone(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "trialing") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (normalized === "past_due" || normalized === "past-due" || normalized === "unpaid") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (normalized === "canceled" || normalized === "cancelled") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function RefereeBenefitBanner({ benefit }: { benefit: BillingRefereeBenefit }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 sm:px-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
        Referral benefit applied
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950">
        {benefit.benefitLabel ?? "Referral credit"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Code <span className="font-mono font-medium text-slate-800">{benefit.code}</span>
        {benefit.appliedAt ? (
          <>
            {" "}
            · applied {formatDate(benefit.appliedAt)}
          </>
        ) : null}
      </p>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  refereeBenefit,
}: {
  subscription: BillingSubscription;
  refereeBenefit: BillingRefereeBenefit | null;
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {subscription.planName}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{subscription.id}</p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone(subscription.status)}`}
        >
          {subscription.status.replaceAll("_", " ")}
        </span>
      </div>

      {isAppliedRefereeBenefit(refereeBenefit) ? (
        <div className="mt-6">
          <RefereeBenefitBanner benefit={refereeBenefit} />
        </div>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Amount
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatAmount(subscription.amount)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Currency
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatCurrencyCode(subscription.currency)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Frequency
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatFrequency(subscription.frequency)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Cancel at period end
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {subscription.cancelAtPeriodEnd ? "Yes" : "No"}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Current period start
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatDate(subscription.currentPeriodStart)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Current period end
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatDate(subscription.currentPeriodEnd)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function WorkspaceDashboard() {
  const [user, setUser] = useState<SessionUser>(FALLBACK_USER);
  const [activeSubscriptions, setActiveSubscriptions] = useState<BillingSubscription[]>([]);
  const [refereeBenefit, setRefereeBenefit] = useState<BillingRefereeBenefit | null>(null);
  const [billingStatus, setBillingStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBilling = async () => {
    const billing = await fetchBillingSubscriptionsMeClient();
    setActiveSubscriptions(billing.activeSubscriptions);
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

      const sessionUser =
        (await fetchSessionUserClient()) ?? getClientSessionUser() ?? FALLBACK_USER;
      setUser(sessionUser);
      setActiveSubscriptions(billing.activeSubscriptions);
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
        <p className="text-sm font-medium text-slate-600">Loading billing…</p>
      </main>
    );
  }

  const displayName = user.name ?? user.email ?? "there";
  const billingUnavailable =
    billingStatus !== null && billingStatus > 0 && billingStatus !== 200;

  return (
    <WorkspaceAppShell activeNav="billing" user={user}>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          Billing
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Welcome, {displayName}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Manage your subscription and billing details.
        </p>
      </header>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-950">Current subscription</h3>

        {billingUnavailable ? (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
            We could not load your subscription (HTTP {billingStatus}). Confirm the
            billing API is running and you are signed in.
          </div>
        ) : activeSubscriptions.length === 0 ? (
          <SubscribePlansPanel onSubscriptionActivated={refreshBilling} />
        ) : (
          <div className="space-y-4">
            {activeSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                refereeBenefit={refereeBenefit}
              />
            ))}
          </div>
        )}
      </section>
    </WorkspaceAppShell>
  );
}
