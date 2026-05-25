import { formatBillingPrice } from "@/lib/billing/billing-display";
import {
  isAppliedRefereeBenefit,
  refereeBenefitCreditAmount,
  type BillingAccountCredits,
  type BillingRefereeBenefit,
  type BillingSubscription,
} from "@/lib/referrals/billing-payload";

/** Account credits granted from plan payment (credits are units, not currency). */
const PLAN_PAYMENT_TO_ACCOUNT_CREDIT_RATIO = 2;

export const ACCOUNT_CREDIT_UNIT_LABEL = "credits";

export type PlanPaymentContext = {
  paymentAmount: number;
  currency: string;
};

export type AccountCreditUsageInput = {
  used?: number | null;
  total?: number | null;
};

export type AccountCreditUsageView = {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  usedPercent: number;
  totalFormatted: string;
  usedFormatted: string;
  remainingFormatted: string;
  unitLabel: string;
};

export type AccountCreditBalanceView = {
  planCredits: number;
  benefitCredits: number;
  totalCredits: number;
  planCreditsFormatted: string;
  benefitCreditsFormatted: string;
  totalCreditsFormatted: string;
  unitLabel: string;
  usage: AccountCreditUsageView;
  refereeBenefit: BillingRefereeBenefit | null;
  showBenefitBreakdown: boolean;
  benefitApplied: boolean;
  benefitPending: boolean;
};

export function formatAccountCreditAmount(amount: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(amount);
}

export function computeAccountCreditFromPlanPayment(paymentAmount: number): number {
  return paymentAmount * PLAN_PAYMENT_TO_ACCOUNT_CREDIT_RATIO;
}

export function buildAccountCreditUsage(
  totalCredits: number,
  usage?: AccountCreditUsageInput | null,
): AccountCreditUsageView {
  const total = Math.max(0, totalCredits);
  const usedRaw = usage?.used ?? 0;
  const usedCredits = Math.max(0, Math.min(total, Number.isFinite(usedRaw) ? usedRaw : 0));
  const remainingCredits = Math.max(0, total - usedCredits);
  const usedPercent = total > 0 ? Math.min(100, Math.round((usedCredits / total) * 100)) : 0;

  return {
    totalCredits: total,
    usedCredits,
    remainingCredits,
    usedPercent,
    totalFormatted: formatAccountCreditAmount(total),
    usedFormatted: formatAccountCreditAmount(usedCredits),
    remainingFormatted: formatAccountCreditAmount(remainingCredits),
    unitLabel: ACCOUNT_CREDIT_UNIT_LABEL,
  };
}

export function buildAccountCreditBalanceView(
  planPayment: PlanPaymentContext,
  refereeBenefit: BillingRefereeBenefit | null,
  subscription: BillingSubscription | null,
  accountCredits: BillingAccountCredits | null,
): AccountCreditBalanceView {
  const planCredits = computeAccountCreditFromPlanPayment(planPayment.paymentAmount);
  const benefitCredits = refereeBenefitCreditAmount(refereeBenefit);
  const computedTotal = planCredits + benefitCredits;

  const apiTotal =
    subscription?.creditsTotal ?? accountCredits?.total ?? null;
  const totalCredits =
    apiTotal !== null && apiTotal >= computedTotal ? apiTotal : computedTotal;

  const usageInput = resolveCreditUsageInput(
    subscription,
    accountCredits,
    totalCredits,
  );
  const usage = buildAccountCreditUsage(totalCredits, usageInput);

  const benefitApplied = isAppliedRefereeBenefit(refereeBenefit);
  const benefitPending =
    Boolean(refereeBenefit) &&
    benefitCredits > 0 &&
    !benefitApplied &&
    refereeBenefit!.status.trim().toUpperCase() === "PENDING";

  return {
    planCredits,
    benefitCredits,
    totalCredits,
    planCreditsFormatted: formatAccountCreditAmount(planCredits),
    benefitCreditsFormatted: formatAccountCreditAmount(benefitCredits),
    totalCreditsFormatted: formatAccountCreditAmount(totalCredits),
    unitLabel: ACCOUNT_CREDIT_UNIT_LABEL,
    usage,
    refereeBenefit,
    showBenefitBreakdown: benefitCredits > 0,
    benefitApplied,
    benefitPending,
  };
}

export function resolveCreditUsageInput(
  subscription: BillingSubscription | null,
  accountCredits: BillingAccountCredits | null,
  computedTotal: number,
): AccountCreditUsageInput {
  if (!subscription && !accountCredits) {
    return { used: 0, total: computedTotal };
  }

  const used =
    subscription?.creditsUsed ?? accountCredits?.used ?? null;
  const total =
    subscription?.creditsTotal ?? accountCredits?.total ?? null;
  const remaining =
    subscription?.creditsRemaining ?? accountCredits?.remaining ?? null;

  if (total !== null && used !== null) {
    return { total, used };
  }
  if (total !== null && remaining !== null) {
    return { total, used: Math.max(0, total - remaining) };
  }
  if (used !== null && remaining !== null) {
    return { used, total: used + remaining };
  }
  if (used !== null) {
    return { used, total: computedTotal };
  }
  if (total !== null) {
    return { total, used: 0 };
  }
  if (remaining !== null) {
    return { used: 0, total: remaining };
  }

  return { used: 0, total: computedTotal };
}

export function planPaymentContextFromAmount(
  amount: number | null,
  currency: string | null,
): PlanPaymentContext | null {
  if (amount === null || !currency?.trim()) {
    return null;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return { paymentAmount: amount, currency };
}
