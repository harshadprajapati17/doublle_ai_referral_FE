import {
  formatRefereeBenefitLabel,
  parseRefereeBenefit,
  type RefereeBenefit,
} from "@/lib/referrals/validate-referral-code";

export type BillingAccountCredits = {
  total: number | null;
  used: number | null;
  remaining: number | null;
};

export type BillingSubscription = {
  id: string;
  planName: string;
  status: string;
  frequency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  amount: number | null;
  currency: string | null;
  cancelAtPeriodEnd: boolean;
  creditsUsed: number | null;
  creditsTotal: number | null;
  creditsRemaining: number | null;
};

export type BillingRefereeBenefit = {
  code: string;
  status: string;
  referralStatus: string | null;
  programId: string | null;
  referralId: string | null;
  applied: boolean;
  benefit: RefereeBenefit | null;
  benefitLabel: string | null;
  appliedAt: string | null;
};

export type BillingSubscriptionsMePayload = {
  subscriptions: BillingSubscription[];
  accountCredits: BillingAccountCredits | null;
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
  if (!benefit) {
    return false;
  }
  if (benefit.applied) {
    return true;
  }
  return benefit.status.trim().toUpperCase() === "APPLIED";
}

/** Show promo when API returned a referral code and a recognizable benefit. */
export function hasRefereeBenefitPromo(
  benefit: BillingRefereeBenefit | null,
): benefit is BillingRefereeBenefit {
  if (!benefit?.code.trim()) {
    return false;
  }
  if (benefit.benefitLabel) {
    return true;
  }
  return benefit.benefit !== null && Boolean(benefit.benefit.type.trim());
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
    nextChargeAt: pickIsoDate(
      row,
      "nextChargeAt",
      "next_charge_at",
      "nextBillingAt",
      "next_billing_at",
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
    creditsUsed: pickNumber(
      row,
      "creditsUsed",
      "credits_used",
      "creditUsed",
      "credit_used",
      "usedCredits",
      "used_credits",
    ),
    creditsTotal: pickNumber(
      row,
      "creditsTotal",
      "credits_total",
      "creditTotal",
      "credit_total",
      "totalCredits",
      "total_credits",
    ),
    creditsRemaining: pickNumber(
      row,
      "creditsRemaining",
      "credits_remaining",
      "creditRemaining",
      "credit_remaining",
      "remainingCredits",
      "remaining_credits",
    ),
  };
}

function parseAccountCreditsFromRow(row: Record<string, unknown>): BillingAccountCredits | null {
  const nested =
    row.credits && typeof row.credits === "object"
      ? (row.credits as Record<string, unknown>)
      : row.accountCredits && typeof row.accountCredits === "object"
        ? (row.accountCredits as Record<string, unknown>)
        : row.account_credits && typeof row.account_credits === "object"
          ? (row.account_credits as Record<string, unknown>)
          : row;

  const total = pickNumber(
    nested,
    "total",
    "totalCredits",
    "total_credits",
    "balance",
    "creditBalance",
    "credit_balance",
  );
  const used = pickNumber(nested, "used", "usedCredits", "used_credits", "consumed");
  const remaining = pickNumber(
    nested,
    "remaining",
    "remainingCredits",
    "remaining_credits",
    "available",
  );

  if (total === null && used === null && remaining === null) {
    return null;
  }

  return { total, used, remaining };
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
    referralStatus:
      pickString(row, "referralStatus", "referral_status") || null,
    programId: pickString(row, "programId", "program_id") || null,
    referralId: pickString(row, "referralId", "referral_id") || null,
    applied: pickBoolean(row, "applied"),
    benefit: nestedBenefit,
    benefitLabel: formatRefereeBenefitLabel(nestedBenefit),
    appliedAt: pickIsoDate(row, "appliedAt", "applied_at"),
  };
}

/** Credit units from referee benefit (CREDIT type value field). */
export function refereeBenefitCreditAmount(
  benefit: BillingRefereeBenefit | null,
): number {
  if (!benefit?.benefit) {
    return 0;
  }
  if (benefit.benefit.type.trim().toUpperCase() !== "CREDIT") {
    return 0;
  }
  const amount = Number(benefit.benefit.value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
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
    return { subscriptions: [], accountCredits: null, refereeBenefit: null };
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

  const accountCredits = parseAccountCreditsFromRow(data);

  return { subscriptions, accountCredits, refereeBenefit };
}
