import type { ReferralMePayload } from "@/lib/referrals/referral-payload";
import type {
  HeroData,
  ReferrerDashboardData,
  StatData,
} from "@/lib/referrals/types";

function withLocalShareUrl(
  hero: HeroData,
  apiReferralUrl: string | null | undefined,
  appBaseUrl?: string,
): HeroData {
  if (!appBaseUrl) {
    return hero;
  }

  let ref = hero.code.trim();
  if (!ref && apiReferralUrl) {
    try {
      ref = new URL(apiReferralUrl).searchParams.get("ref")?.trim() ?? "";
    } catch {
      ref = "";
    }
  }

  const localSignupUrl = new URL("/signup", appBaseUrl);
  if (ref) {
    localSignupUrl.searchParams.set("ref", ref);
  }

  return {
    ...hero,
    shareUrl: localSignupUrl.toString(),
    code: ref || hero.code,
  };
}

export function buildReferrerDashboardData(
  me: ReferralMePayload,
  appBaseUrl?: string,
): ReferrerDashboardData {
  const hasActiveLink = Boolean(me.referralUrl?.trim());

  const heroBase: HeroData = {
    programName: me.programName?.trim() || "Referral program",
    title: me.heroTitle?.trim() || "Share your referral link",
    description:
      me.heroDescription?.trim() ||
      "Invite others with your referral link and track activity here.",
    shareUrl: me.referralUrl?.trim() || "",
    code: me.code.trim(),
    rewardSummary: me.rewardSummary?.trim() || "See program terms",
    rewardDuration: me.rewardDuration?.trim() || "—",
    payoutType: me.payoutType?.trim() || "—",
    cookieWindowDays: me.cookieWindowDays ?? 30,
    note: "Manual code entry at signup overrides any active referral cookie.",
    termsHref: "#program-terms",
  };

  let hero = heroBase;
  if (appBaseUrl) {
    if (me.referralUrl?.trim()) {
      hero = withLocalShareUrl(heroBase, me.referralUrl, appBaseUrl);
    } else {
      const local = new URL("/signup", appBaseUrl);
      if (me.code.trim()) {
        local.searchParams.set("ref", me.code.trim());
      }
      hero = { ...heroBase, shareUrl: local.toString() };
    }
  }

  const stats: StatData[] = [
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
      change: "Nothing pending yet",
      helper: "Earned commissions net of clawbacks",
    },
  ];

  return {
    hero,
    stats,
    referees: [],
    transactions: [],
    programTerms: me.programTerms,
    termsAcceptance: hasActiveLink
      ? {
          programId: me.programId,
          version: me.termsVersion,
          acceptedAt: me.createdAt?.trim() || new Date().toISOString(),
          ipAddress: "referral-api",
        }
      : null,
  };
}
