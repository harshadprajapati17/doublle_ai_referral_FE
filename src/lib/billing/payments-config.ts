export type BillingFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "YEARLY";

export type CheckoutPlan = {
  key: string;
  label: string;
  description: string;
  /** Per-month rate shown in the plan card. */
  monthlyRate: number;
  /** Total charged at Razorpay checkout for the billing period. */
  amount: number;
  currency: string;
  frequency: BillingFrequency;
  months: number;
  highlighted?: boolean;
  badge?: string;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value?.trim()) {
    return fallback;
  }
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isPaymentsEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0") {
    return false;
  }
  return Boolean(process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim());
}

export function getCheckoutPlans(): CheckoutPlan[] {
  const currency =
    process.env.NEXT_PUBLIC_BILLING_DEFAULT_CURRENCY?.trim().toUpperCase() || "USD";
  const monthlyBase = parsePositiveInt(
    process.env.NEXT_PUBLIC_BILLING_MONTHLY_AMOUNT,
    2000,
  );

  const quarterlyMonthly = Math.round(
    monthlyBase * (1 - parsePositiveInt(process.env.NEXT_PUBLIC_BILLING_QUARTERLY_DISCOUNT_PERCENT, 2) / 100),
  );
  const halfYearlyMonthly = Math.round(
    monthlyBase * (1 - parsePositiveInt(process.env.NEXT_PUBLIC_BILLING_HALF_YEARLY_DISCOUNT_PERCENT, 5) / 100),
  );
  const yearlyMonthly = Math.round(
    monthlyBase * (1 - parsePositiveInt(process.env.NEXT_PUBLIC_BILLING_YEARLY_DISCOUNT_PERCENT, 10) / 100),
  );

  return [
    {
      key: "monthly",
      label: "Monthly",
      description: "Pay as you go",
      monthlyRate: monthlyBase,
      amount: monthlyBase,
      currency,
      frequency: "MONTHLY",
      months: 1,
    },
    {
      key: "quarterly",
      label: "Quarterly",
      description: "Save 2% vs monthly",
      monthlyRate: quarterlyMonthly,
      amount: quarterlyMonthly * 3,
      currency,
      frequency: "QUARTERLY",
      months: 3,
    },
    {
      key: "half-yearly",
      label: "Half-yearly",
      description: "Save 5% vs monthly",
      monthlyRate: halfYearlyMonthly,
      amount: halfYearlyMonthly * 6,
      currency,
      frequency: "HALF_YEARLY",
      months: 6,
    },
    {
      key: "yearly",
      label: "Yearly",
      description: "Save 10% vs monthly",
      monthlyRate: yearlyMonthly,
      amount: yearlyMonthly * 12,
      currency,
      frequency: "YEARLY",
      months: 12,
      highlighted: true,
      badge: "Most Popular",
    },
  ];
}
