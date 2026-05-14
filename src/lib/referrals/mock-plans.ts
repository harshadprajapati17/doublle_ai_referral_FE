import type { MockPricingPlan } from "@/lib/referrals/types";

export const MOCK_PRICING_PLANS: MockPricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    description: "Pay as you go",
    monthlyRevenue: 2000,
    labelMonthlyRevenue: 2000,
    savingsLabel: "No discount",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    description: "Save 2% vs monthly",
    monthlyRevenue: 1960,
    labelMonthlyRevenue: 1960,
    savingsLabel: "Save 2%",
  },
  {
    id: "half-yearly",
    name: "Half-yearly",
    description: "Save 5% vs monthly",
    monthlyRevenue: 1900,
    labelMonthlyRevenue: 1900,
    savingsLabel: "Save 5%",
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Save 10% vs monthly",
    monthlyRevenue: 1800,
    labelMonthlyRevenue: 1800,
    savingsLabel: "Save 10%",
    badge: "Most Popular",
  },
];

export const REFERRAL_REWARD_RATE = 0.05;

export function getMockPlanById(planId: string) {
  return MOCK_PRICING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function calculateReferralCommission(monthlyRevenue: number) {
  return Number((monthlyRevenue * REFERRAL_REWARD_RATE).toFixed(2));
}
