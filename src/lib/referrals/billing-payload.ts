export type BillingSubscription = {
  id: string;
  planName: string;
  status: string;
  billingInterval: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  amountCents: number | null;
  currency: string | null;
  cancelAtPeriodEnd: boolean;
};

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

  const billingInterval =
    pickString(row, "billingInterval", "billing_interval", "interval") ||
    (plan ? pickString(plan, "interval", "billingInterval", "billing_interval") : "") ||
    null;

  return {
    id,
    planName: planName || "Subscription",
    status,
    billingInterval,
    currentPeriodStart: pickIsoDate(
      row,
      "currentPeriodStart",
      "current_period_start",
      "periodStart",
      "period_start",
    ),
    currentPeriodEnd: pickIsoDate(
      row,
      "currentPeriodEnd",
      "current_period_end",
      "periodEnd",
      "period_end",
    ),
    amountCents: pickNumber(
      row,
      "amountCents",
      "amount_cents",
      "unitAmountCents",
      "unit_amount_cents",
    ),
    currency: pickString(row, "currency") || null,
    cancelAtPeriodEnd: pickBoolean(
      row,
      "cancelAtPeriodEnd",
      "cancel_at_period_end",
      "cancelAtEnd",
    ),
  };
}

function collectSubscriptionRecords(json: unknown): Record<string, unknown>[] {
  if (!json || typeof json !== "object") {
    return [];
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const candidates: unknown[] = [];

  if (Array.isArray(data)) {
    candidates.push(...data);
  } else {
    if (data.subscription && typeof data.subscription === "object") {
      candidates.push(data.subscription);
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

export function parseBillingSubscriptionsMeJson(json: unknown): BillingSubscription[] {
  const rows = collectSubscriptionRecords(json);
  const subscriptions: BillingSubscription[] = [];

  for (const row of rows) {
    const parsed = subscriptionFromRecord(row);
    if (parsed) {
      subscriptions.push(parsed);
    }
  }

  return subscriptions;
}
