"use client";

import { useEffect, useState } from "react";

import { WorkspaceAppShell } from "@/components/workspace/workspace-app-shell";
import { clearClientAuthSession, getClientAuthBearer } from "@/lib/referrals/auth-token";
import type { BillingSubscription } from "@/lib/referrals/billing-payload";
import {
  fetchAuthMeClient,
  fetchBillingSubscriptionsMeClient,
  getPublicAuthApiBase,
} from "@/lib/referrals/referral-api-client";
import type { SessionUser } from "@/lib/referrals/types";

function formatMoney(amountCents: number | null, currency: string | null): string {
  if (amountCents === null) {
    return "—";
  }
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${code}`;
  }
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

function SubscriptionCard({ subscription }: { subscription: BillingSubscription }) {
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

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Amount
          </dt>
          <dd className="mt-2 text-lg font-semibold text-slate-950">
            {formatMoney(subscription.amountCents, subscription.currency)}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Billing interval
          </dt>
          <dd className="mt-2 text-lg font-semibold capitalize text-slate-950">
            {subscription.billingInterval ?? "—"}
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
  const [user, setUser] = useState<SessionUser | null>(null);
  const [subscriptions, setSubscriptions] = useState<BillingSubscription[]>([]);
  const [billingStatus, setBillingStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getPublicAuthApiBase()) {
        window.location.replace("/login?returnTo=/dashboard&error=auth-misconfigured");
        return;
      }

      if (!getClientAuthBearer()) {
        window.location.replace("/login?returnTo=/dashboard");
        return;
      }

      const authUser = await fetchAuthMeClient();
      if (cancelled) {
        return;
      }

      if (!authUser) {
        clearClientAuthSession();
        window.location.replace("/login?returnTo=/dashboard&error=session-expired");
        return;
      }

      const billing = await fetchBillingSubscriptionsMeClient();
      if (cancelled) {
        return;
      }

      setUser(authUser);
      setSubscriptions(billing.subscriptions);
      setBillingStatus(billing.status);
      setLoading(false);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
        <p className="text-sm font-medium text-slate-600">Loading workspace…</p>
      </main>
    );
  }

  const displayName = user.name ?? user.email ?? "there";
  const billingUnavailable =
    billingStatus !== null && billingStatus > 0 && billingStatus !== 200;

  return (
    <WorkspaceAppShell activeNav="dashboard" user={user}>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          Dashboard
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Welcome, {displayName}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Your workspace overview and subscription details from billing.
        </p>
      </header>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-950">Subscription</h3>

        {billingUnavailable ? (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
            We could not load your subscription (HTTP {billingStatus}). Confirm the
            billing API is running and you are signed in.
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-950">No active subscription</p>
            <p className="mt-2 text-sm text-slate-600">
              Your account is ready. Add a plan when billing is connected to this workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        )}
      </section>
    </WorkspaceAppShell>
  );
}
