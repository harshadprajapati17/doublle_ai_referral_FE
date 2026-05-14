import "server-only";

import { calculateReferralCommission, getMockPlanById } from "@/lib/referrals/mock-plans";
import { fetchMockApi } from "@/lib/referrals/mock-api";
import type { MockSignupSubmissionRecord } from "@/lib/referrals/types";

function deriveCompanyName(workEmail: string) {
  const domain = workEmail.split("@")[1] ?? "company.com";
  const companyRoot = domain.split(".")[0] ?? "company";

  return companyRoot
    .split(/[-_]+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

export async function createMockSignupSubmission(input: {
  referrerUserId: string;
  workEmail: string;
  referralCode: string;
  planId: string;
  source?: string;
}): Promise<MockSignupSubmissionRecord> {
  const plan = getMockPlanById(input.planId);

  if (!plan) {
    throw new Error(`Unknown mock plan: ${input.planId}`);
  }

  return fetchMockApi<MockSignupSubmissionRecord>("/signupSubmissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      referrerUserId: input.referrerUserId,
      workEmail: input.workEmail,
      companyName: deriveCompanyName(input.workEmail),
      referralCode: input.referralCode,
      planId: plan.id,
      planName: plan.name,
      monthlyRevenue: plan.monthlyRevenue,
      labelMonthlyRevenue: plan.labelMonthlyRevenue,
      commissionAmount: calculateReferralCommission(plan.monthlyRevenue),
      source: input.source ?? "local-signup",
      status: "paid",
      createdAt: new Date().toISOString(),
    }),
  });
}

export async function getRecentMockSignupSubmissions(
  referralCode?: string,
): Promise<MockSignupSubmissionRecord[]> {
  const query = referralCode
    ? `/signupSubmissions?referralCode=${encodeURIComponent(referralCode)}`
    : "/signupSubmissions";

  const submissions = await fetchMockApi<MockSignupSubmissionRecord[]>(query);

  return submissions
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5);
}
