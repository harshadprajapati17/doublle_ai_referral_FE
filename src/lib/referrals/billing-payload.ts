import {
  formatRefereeBenefitLabel,
  parseRefereeBenefit,
  type RefereeBenefit,
} from "@/lib/referrals/validate-referral-code";

export type BillingSubscription = {
  id: string;
  planName: string;
  status: string;
  frequency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  amount: number | null;
  currency: string | null;
  cancelAtPeriodEnd: boolean;
};

export type BillingRefereeBenefit = {
  code: string;
  status: string;
  benefit: RefereeBenefit | null;
  benefitLabel: string | null;
  appliedAt: string | null;
};

export type BillingSubscriptionsMePayload = {
  subscriptions: BillingSubscription[];
  refereeBenefit: BillingRefereeBenefit | null;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status.trim().toLowerCase());
}

export function filterActiveSubscriptions(
  subscriptions: BillingSubscription[],
): BillingSubscription[] {
  return subscriptions.filter((subscription) =>
    isActiveSubscriptionStatus(subscription.status),
  );
}

export function isAppliedRefereeBenefit(
  benefit: BillingRefereeBenefit | null,
): benefit is BillingRefereeBenefit {
  return benefit !== null && benefit.status.trim().toUpperCase() === "APPLIED";
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return null;
}

function pickBoolean(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return false;
}

function pickIsoDate(record: Record<string, unknown>, ...keys: string[]): string | null {
  const raw = pickString(record, ...keys);
  return raw || null;
}

function resolveAmount(row: Record<string, unknown>): number | null {
  const amount = pickNumber(row, "amount");
  if (amount !== null) {
    return amount;
  }

  const amountCents = pickNumber(
    row,
    "amountCents",
    "amount_cents",
    "unitAmountCents",
    "unit_amount_cents",
  );
  if (amountCents !== null) {
    return amountCents / 100;
  }

  return null;
}

function subscriptionFromRecord(row: Record<string, unknown>): BillingSubscription | null {
  const id = pickString(row, "id", "subscriptionId", "subscription_id");
  if (!id) {
    return null;
  }

  const plan =
    row.plan && typeof row.plan === "object"
      ? (row.plan as Record<string, unknown>)
      : null;

  const planName =
    pickString(row, "planName", "plan_name", "name", "productName", "product_name") ||
    (plan ? pickString(plan, "name", "displayName", "display_name") : "");

  const status = pickString(row, "status", "subscriptionStatus", "subscription_status") || "unknown";

  const frequency =
    pickString(row, "frequency", "billingInterval", "billing_interval", "interval") ||
    (plan ? pickString(plan, "frequency", "interval", "billingInterval", "billing_interval") : "") ||
    null;

  return {
    id,
    planName: planName || "Subscription",
    status,
    frequency,
    currentPeriodStart: pickIsoDate(
      row,
      "currentStart",
      "current_start",
      "currentPeriodStart",
      "current_period_start",
      "periodStart",
      "period_start",
    ),
    currentPeriodEnd: pickIsoDate(
      row,
      "currentEnd",
      "current_end",
      "currentPeriodEnd",
      "current_period_end",
      "periodEnd",
      "period_end",
    ),
    amount: resolveAmount(row),
    currency: pickString(row, "currency") || null,
    cancelAtPeriodEnd: pickBoolean(
      row,
      "cancelAtCycleEnd",
      "cancel_at_cycle_end",
      "cancelAtPeriodEnd",
      "cancel_at_period_end",
      "cancelAtEnd",
    ),
  };
}

function parseRefereeBenefitFromMe(row: Record<string, unknown>): BillingRefereeBenefit | null {
  const status = pickString(row, "status");
  const code = pickString(row, "code");
  if (!status || !code) {
    return null;
  }

  const nestedBenefit =
    row.benefit && typeof row.benefit === "object"
      ? parseRefereeBenefit(row.benefit)
      : parseRefereeBenefit(row);

  return {
    code,
    status,
    benefit: nestedBenefit,
    benefitLabel: formatRefereeBenefitLabel(nestedBenefit),
    appliedAt: pickIsoDate(row, "appliedAt", "applied_at"),
  };
}

function extractDataEnvelope(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  return data;
}

function collectSubscriptionRecords(data: Record<string, unknown>): Record<string, unknown>[] {
  const candidates: unknown[] = [];

  if (Array.isArray(data)) {
    candidates.push(...data);
  } else {
    if (data.subscription && typeof data.subscription === "object") {
      candidates.push(data.subscription);
    }
    if (data.activeSubscription && typeof data.activeSubscription === "object") {
      candidates.push(data.activeSubscription);
    }
    if (data.currentSubscription && typeof data.currentSubscription === "object") {
      candidates.push(data.currentSubscription);
    }
    if (data.subscriptions) {
      candidates.push(data.subscriptions);
    }
    if (data.items) {
      candidates.push(data.items);
    }
    if (data.results) {
      candidates.push(data.results);
    }
    candidates.push(data);
  }

  const rows: Record<string, unknown>[] = [];
  for (const item of candidates) {
    if (Array.isArray(item)) {
      for (const entry of item) {
        if (entry && typeof entry === "object") {
          rows.push(entry as Record<string, unknown>);
        }
      }
    } else if (item && typeof item === "object") {
      rows.push(item as Record<string, unknown>);
    }
  }

  return rows;
}

export function parseBillingSubscriptionsMeJson(json: unknown): BillingSubscriptionsMePayload {
  const data = extractDataEnvelope(json);
  if (!data) {
    return { subscriptions: [], refereeBenefit: null };
  }

  const rows = collectSubscriptionRecords(data);
  const subscriptions: BillingSubscription[] = [];

  for (const row of rows) {
    const parsed = subscriptionFromRecord(row);
    if (parsed) {
      subscriptions.push(parsed);
    }
  }

  const refereeRow = data.refereeBenefit ?? data.referee_benefit;
  const refereeBenefit =
    refereeRow && typeof refereeRow === "object"
      ? parseRefereeBenefitFromMe(refereeRow as Record<string, unknown>)
      : null;

  return { subscriptions, refereeBenefit };
}
