import {
  buildStatsFromSummary,
  dashboardToMePayload,
  flattenCommissionTransactions,
  mapRefereesToUi,
  type ReferralDashboardPayload,
} from "@/lib/referrals/referral-dashboard-payload";
import {
  mergeMeWithProgram,
  type ReferralMePayload,
  type ReferralProgramPayload,
  type ReferralTermsAcceptPayload,
} from "@/lib/referrals/referral-payload";
import {
  buildReferralSignupUrl,
  resolveReferralCode,
} from "@/lib/referrals/referral-share-url";
import type {
  HeroData,
  ReferrerDashboardData,
  StatData,
  TransactionData,
} from "@/lib/referrals/types";

function buildHeroData(me: ReferralMePayload, appBaseUrl?: string): HeroData {
  const code = resolveReferralCode(me.code, me.referralUrl);
  const shareUrl =
    appBaseUrl && code
      ? buildReferralSignupUrl(appBaseUrl, code)
      : me.referralUrl?.trim() || "";

  return {
    programName: me.programName?.trim() || "Referral program",
    title: me.heroTitle?.trim() || "Share your referral link",
    description:
      me.heroDescription?.trim() ||
      "Invite others with your referral link and track activity here.",
    shareUrl,
    code,
    rewardSummary: me.rewardSummary?.trim() || "See program terms",
    rewardDuration: me.rewardDuration?.trim() || "—",
    payoutType: me.payoutType?.trim() || "—",
    cookieWindowDays: me.cookieWindowDays ?? 30,
    note: "Manual code entry at signup overrides any active referral cookie.",
    termsHref: "#program-terms",
  };
}

export function buildReferrerDashboardData(
  me: ReferralMePayload,
  appBaseUrl?: string,
  transactions: TransactionData[] = [],
): ReferrerDashboardData {
  const code = resolveReferralCode(me.code, me.referralUrl);
  const hasEnrollment = Boolean(code);

  const stats: StatData[] = [
    {
      id: "clicks",
      label: "Link clicks",
      value: "—",
      change: "Tracking coming soon",
      helper: "Visits from your shared referral link",
      statusTone: "unavailable",
    },
    {
      id: "signups",
      label: "Referrals",
      value: "0",
      change: "No referrals yet",
      helper: "Accounts that signed up with your link or code",
      statusTone: "muted",
    },
    {
      id: "paidConversions",
      label: "Conversions",
      value: "0",
      change: "No paid referrals yet",
      helper: "Referrals with at least one qualifying payment",
      statusTone: "muted",
    },
    {
      id: "totalEarned",
      label: "Earnings",
      value: "$0.00",
      change: "No earnings yet",
      helper: "Commissions earned, net of clawbacks",
      statusTone: "muted",
    },
  ];

  return {
    hero: buildHeroData(me, appBaseUrl),
    stats,
    referees: [],
    transactions,
    programTerms: me.programTerms,
    termsAcceptance: hasEnrollment
      ? {
          programId: me.programId,
          version: me.termsVersion,
          acceptedAt: me.createdAt?.trim() || new Date().toISOString(),
          ipAddress: "referral-api",
        }
      : null,
  };
}

export function buildReferrerDashboardFromApi(
  dashboard: ReferralDashboardPayload,
  program: ReferralProgramPayload,
  appBaseUrl?: string,
): ReferrerDashboardData {
  const me = mergeMeWithProgram(dashboardToMePayload(dashboard), program);
  const base = buildReferrerDashboardData(
    me,
    appBaseUrl,
    flattenCommissionTransactions(dashboard.referees),
  );

  return {
    ...base,
    stats: buildStatsFromSummary(dashboard.summary, dashboard.referees),
    referees: mapRefereesToUi(dashboard.referees),
    transactions: flattenCommissionTransactions(dashboard.referees),
  };
}

/** Apply terms/accept response before dashboard reload (code-only enrollment). */
export function buildReferrerDashboardAfterTermsAccept(
  current: ReferrerDashboardData,
  accept: ReferralTermsAcceptPayload,
  appBaseUrl?: string,
): ReferrerDashboardData {
  const me: ReferralMePayload = {
    programId: accept.programId,
    termsVersion: accept.termsVersion,
    code: accept.code,
    referralUrl: null,
    createdAt: accept.createdAt ?? accept.acceptedAt,
    programName: current.hero.programName,
    heroTitle: current.hero.title,
    heroDescription: current.hero.description,
    rewardSummary: current.hero.rewardSummary,
    rewardDuration: current.hero.rewardDuration,
    payoutType: current.hero.payoutType,
    cookieWindowDays: current.hero.cookieWindowDays,
    programTerms: current.programTerms,
  };

  const built = buildReferrerDashboardData(me, appBaseUrl, current.transactions);
  return {
    ...built,
    stats: current.stats,
    referees: current.referees,
  };
}
