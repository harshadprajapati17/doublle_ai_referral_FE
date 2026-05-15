import "server-only";

import type {
  MockSignupSubmissionRecord,
  MockUserRecord,
  ProgramTermsData,
  ReferrerDashboardRecord,
  StatData,
} from "@/lib/referrals/types";

const STANDARD_PROGRAM_TERMS = {
  programId: "standard-program",
  version: "2026.05",
  title: "Standard Program terms",
  summary:
    "The MVP program pays Doublle account credit for eligible referred revenue and includes attribution, hold, and clawback safeguards.",
  items: [
    "You earn 5% of referred net revenue for up to 12 months.",
    "Attribution uses a 30-day first-party cookie, but manual code entry at signup wins.",
    "Each referee can belong to one referrer only and self-referrals are blocked.",
    "Commissions move from Pending to Earned after a 30-day hold, then apply as account credit.",
    "Refunds, chargebacks, and disputes can reverse pending or paid commissions.",
  ],
  helpEmail: "support@doublle.ai",
} satisfies ProgramTermsData;

const INITIAL_STATS: StatData[] = [
  {
    id: "clicks",
    label: "Clicks",
    value: "0",
    change: "No traffic yet",
    helper: "Tracked across link shares and direct visits",
  },
  {
    id: "signups",
    label: "Signups",
    value: "0",
    change: "No signups yet",
    helper: "Accounts created with your link or code",
  },
  {
    id: "paidConversions",
    label: "Paid conversions",
    value: "0",
    change: "No conversions yet",
    helper: "Referees with at least one qualifying invoice",
  },
  {
    id: "totalEarned",
    label: "Total earned",
    value: "$0.00",
    change: "Nothing pending",
    helper: "Earned commissions net of clawbacks",
  },
];

const MOCK_DASHBOARDS_SEED: ReferrerDashboardRecord[] = [
  {
    id: "dashboard_harshad",
    userId: "user_harshad",
    hero: {
      programName: "Standard Program",
      title: "Share your personal referral link",
      description:
        "Invite new teams to Doublle and earn recurring account credit when they become paying customers.",
      shareUrl: "https://app.doublle.ai/signup?ref=HARSH25",
      code: "HARSH25",
      rewardSummary: "5% of referred net revenue",
      rewardDuration: "12 months",
      cookieWindowDays: 30,
      payoutType: "Doublle account credit",
      note: "Manual code entry at signup overrides any active referral cookie.",
      termsHref: "#program-terms",
    },
    stats: INITIAL_STATS.map((s) => ({ ...s })),
    referees: [],
    transactions: [],
    programTerms: { ...STANDARD_PROGRAM_TERMS },
  },
  {
    id: "dashboard_taylor",
    userId: "user_taylor",
    hero: {
      programName: "Standard Program",
      title: "Share your personal referral link",
      description:
        "Invite new teams to Doublle and earn recurring account credit when they become paying customers.",
      shareUrl: "https://app.doublle.ai/signup?ref=TAYLOR25",
      code: "TAYLOR25",
      rewardSummary: "5% of referred net revenue",
      rewardDuration: "12 months",
      cookieWindowDays: 30,
      payoutType: "Doublle account credit",
      note: "Manual code entry at signup overrides any active referral cookie.",
      termsHref: "#program-terms",
    },
    stats: INITIAL_STATS.map((s) => ({ ...s })),
    referees: [],
    transactions: [],
    programTerms: { ...STANDARD_PROGRAM_TERMS },
  },
];

const MOCK_USERS_SEED: MockUserRecord[] = [
  {
    id: "user_harshad",
    name: "Harshad Rao",
    email: "harshad@doublle.ai",
    password: "doublle123",
    role: "referrer",
  },
  {
    id: "user_taylor",
    name: "Taylor Brooks",
    email: "new.referrer@doublle.ai",
    password: "doublle123",
    role: "referrer",
  },
];

let signupSubmissions: MockSignupSubmissionRecord[] = [];

export function listMockUsers(): MockUserRecord[] {
  return MOCK_USERS_SEED;
}

export function findMockUserByEmailAndPassword(
  email: string,
  password: string,
): MockUserRecord | undefined {
  return MOCK_USERS_SEED.find(
    (u) => u.email === email && u.password === password,
  );
}

export function findMockUserById(userId: string): MockUserRecord | undefined {
  return MOCK_USERS_SEED.find((u) => u.id === userId);
}

export function listMockDashboards(): ReferrerDashboardRecord[] {
  return MOCK_DASHBOARDS_SEED;
}

export function findMockDashboardsByUserId(
  userId: string,
): ReferrerDashboardRecord[] {
  return MOCK_DASHBOARDS_SEED.filter((d) => d.userId === userId);
}

export function findMockDashboardByReferralCode(
  code: string,
): ReferrerDashboardRecord | undefined {
  const normalized = code.trim().toUpperCase();
  return MOCK_DASHBOARDS_SEED.find((d) => d.hero.code === normalized);
}

export function listMockSignupSubmissionsByReferralCode(
  referralCode: string,
): MockSignupSubmissionRecord[] {
  const normalized = referralCode.trim().toUpperCase();
  return signupSubmissions.filter((s) => s.referralCode === normalized);
}

export function listMockSignupSubmissions(): MockSignupSubmissionRecord[] {
  return signupSubmissions;
}

export function addMockSignupSubmission(
  record: MockSignupSubmissionRecord,
): MockSignupSubmissionRecord {
  signupSubmissions = [...signupSubmissions, record];
  return record;
}
