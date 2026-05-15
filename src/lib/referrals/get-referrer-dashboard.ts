import "server-only";

import { formatCurrency } from "@/lib/referrals/format";
import {
  fetchReferralMe,
  isReferralApiConfigured,
} from "@/lib/referrals/fetch-referral-me";
import {
  findMockDashboardByReferralCode,
  findMockDashboardsByUserId,
  findMockUserByEmailAndPassword,
  findMockUserById,
  listMockSignupSubmissionsByReferralCode,
} from "@/lib/referrals/mock-store";
import type {
  MockSignupSubmissionRecord,
  MockUserRecord,
  RefereeData,
  ReferrerDashboardData,
  ReferrerDashboardRecord,
  SessionUser,
  StatData,
  TransactionData,
} from "@/lib/referrals/types";

function toSessionUser(user: MockUserRecord): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function withLocalShareUrl(
  data: ReferrerDashboardData,
  appBaseUrl?: string,
): ReferrerDashboardData {
  if (!appBaseUrl) {
    return data;
  }

  let ref = "";
  try {
    ref =
      new URL(data.hero.shareUrl).searchParams.get("ref")?.trim() ??
      data.hero.code?.trim() ??
      "";
  } catch {
    ref = data.hero.code?.trim() ?? "";
  }

  const localSignupUrl = new URL("/signup", appBaseUrl);
  if (ref) {
    localSignupUrl.searchParams.set("ref", ref);
  }

  return {
    ...data,
    hero: {
      ...data.hero,
      shareUrl: localSignupUrl.toString(),
      code: ref || data.hero.code,
    },
  };
}

function parseIntegerMetric(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function parseCurrencyMetric(value: string) {
  const normalized = value.replace(/[^0-9.-]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "new referrer";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatHoldEndDate(value: string) {
  const date = new Date(value);
  date.setDate(date.getDate() + 30);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildDerivedReferees(
  submissions: MockSignupSubmissionRecord[],
): RefereeData[] {
  return submissions.map((submission) => ({
    id: `signup_${submission.id}`,
    name: formatNameFromEmail(submission.workEmail),
    company: submission.companyName,
    source: "Local signup",
    joinedAt: submission.createdAt,
    referralStatus: submission.status === "paid" ? "Paying" : "Signed up",
    commissionState: "pending",
    plan: submission.planName,
    netRevenue: submission.labelMonthlyRevenue ?? submission.monthlyRevenue,
    commission: submission.commissionAmount,
    nextEvent: `30-day hold ends ${formatHoldEndDate(submission.createdAt)}`,
  }));
}

function buildDerivedTransactions(
  submissions: MockSignupSubmissionRecord[],
): TransactionData[] {
  return submissions.map((submission) => ({
    id: `signup_txn_${submission.id}`,
    title: `${submission.companyName} started on ${submission.planName}`,
    detail: `5% of ${formatCurrency(submission.monthlyRevenue)} monthly net revenue created a pending commission.`,
    occurredAt: submission.createdAt,
    amount: submission.commissionAmount,
    state: "pending",
  }));
}

function mergeStats(
  baseStats: StatData[],
  submissions: MockSignupSubmissionRecord[],
): StatData[] {
  const statsById = new Map(baseStats.map((stat) => [stat.id, stat]));
  const signupCount = submissions.length;
  const paidConversionCount = submissions.filter(
    (submission) => submission.status === "paid",
  ).length;
  const pendingCommissionTotal = submissions.reduce(
    (sum, submission) => sum + submission.commissionAmount,
    0,
  );

  const baseClicks = parseIntegerMetric(statsById.get("clicks")?.value ?? "0");
  const baseSignups = parseIntegerMetric(statsById.get("signups")?.value ?? "0");
  const basePaidConversions = parseIntegerMetric(
    statsById.get("paidConversions")?.value ?? "0",
  );
  const baseTotalEarned = parseCurrencyMetric(
    statsById.get("totalEarned")?.value ?? "$0.00",
  );

  return [
    {
      id: "clicks",
      label: "Clicks",
      value: String(baseClicks + signupCount * 3),
      change:
        signupCount > 0
          ? `+${signupCount * 3} simulated from local referrals`
          : statsById.get("clicks")?.change ?? "No traffic yet",
      helper: "Tracked across link shares and direct visits",
    },
    {
      id: "signups",
      label: "Signups",
      value: String(baseSignups + signupCount),
      change:
        signupCount > 0
          ? `+${signupCount} from local mock signup flow`
          : statsById.get("signups")?.change ?? "No signups yet",
      helper: "Accounts created with your link or code",
    },
    {
      id: "paidConversions",
      label: "Paid conversions",
      value: String(basePaidConversions + paidConversionCount),
      change:
        paidConversionCount > 0
          ? `${paidConversionCount} plan-backed conversion${paidConversionCount === 1 ? "" : "s"} added`
          : statsById.get("paidConversions")?.change ?? "No conversions yet",
      helper: "Referees with at least one qualifying invoice",
    },
    {
      id: "totalEarned",
      label: "Total earned",
      value: formatCurrency(baseTotalEarned),
      change:
        pendingCommissionTotal > 0
          ? `${formatCurrency(pendingCommissionTotal)} pending at 5% revenue share`
          : statsById.get("totalEarned")?.change ?? "Nothing pending",
      helper: "Earned commissions net of clawbacks",
    },
  ];
}

function mergeDashboardData(
  dashboard: ReferrerDashboardRecord,
  submissions: MockSignupSubmissionRecord[],
) {
  const sortedSubmissions = [...submissions].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  const derivedReferees = buildDerivedReferees(sortedSubmissions);
  const derivedTransactions = buildDerivedTransactions(sortedSubmissions);

  return {
    hero: dashboard.hero,
    stats: mergeStats(dashboard.stats, sortedSubmissions),
    referees: [...derivedReferees, ...dashboard.referees],
    transactions: [...derivedTransactions, ...dashboard.transactions],
    programTerms: dashboard.programTerms,
    termsAcceptance: null,
  } satisfies ReferrerDashboardData;
}

export async function getReferrerDashboardData(
  userId: string,
  appBaseUrl?: string,
): Promise<ReferrerDashboardData | null> {
  const dashboards = findMockDashboardsByUserId(userId);
  const dashboard = dashboards[0];

  if (!dashboard) {
    return null;
  }

  const submissions = listMockSignupSubmissionsByReferralCode(
    dashboard.hero.code,
  );
  const merged = mergeDashboardData(dashboard, submissions);

  let termsAcceptance: ReferrerDashboardData["termsAcceptance"] = null;
  let hero = merged.hero;

  if (isReferralApiConfigured()) {
    const me = await fetchReferralMe();
    if (me?.programId && me.referralUrl) {
      termsAcceptance = {
        programId: me.programId,
        version: me.termsVersion,
        acceptedAt: me.createdAt ?? new Date().toISOString(),
        ipAddress: "referral-api",
      };
      hero = {
        ...hero,
        code: me.code || hero.code,
        shareUrl: me.referralUrl,
      };
    }
  } else {
    termsAcceptance = {
      programId: dashboard.programTerms.programId,
      version: dashboard.programTerms.version,
      acceptedAt: new Date(0).toISOString(),
      ipAddress: "local-mock",
    };
  }

  return withLocalShareUrl(
    {
      ...merged,
      hero,
      termsAcceptance,
    },
    appBaseUrl,
  );
}

export async function getMockUserByCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<SessionUser | null> {
  const user = findMockUserByEmailAndPassword(email, password);
  return user ? toSessionUser(user) : null;
}

export async function getMockUserById(userId: string): Promise<SessionUser | null> {
  const user = findMockUserById(userId);
  return user ? toSessionUser(user) : null;
}

export async function getDashboardByReferralCode(code: string) {
  return findMockDashboardByReferralCode(code) ?? null;
}
