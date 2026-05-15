import type { Metadata } from "next";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import { DashboardShell } from "@/components/referrals/dashboard-shell";
import { LoginShell } from "@/components/referrals/login-shell";
import { MockServerState } from "@/components/referrals/mock-server-state";
import { acceptReferralTermsAction } from "@/app/referal/actions";
import {
  getMockUserById,
  getReferrerDashboardData,
} from "@/lib/referrals/get-referrer-dashboard";
import { REFERRAL_SESSION_COOKIE } from "@/lib/referrals/mock-session";
import type {
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
  SessionUser,
} from "@/lib/referrals/types";

export const metadata: Metadata = {
  title: "Referrer Dashboard",
  description:
    "In-app referral dashboard with share tools, conversion stats, referee tracking, and commission history.",
};

interface ReferralPageProps {
  searchParams: Promise<{
    error?: string | string[];
    termsError?: string | string[];
  }>;
}

export default async function ReferralPage({
  searchParams,
}: ReferralPageProps) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const termsErrorParam = Array.isArray(params.termsError)
    ? params.termsError[0]
    : params.termsError;
  const sessionCookie = (await cookies()).get(REFERRAL_SESSION_COOKIE)?.value;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const appBaseUrl = host ? `${protocol}://${host}` : undefined;

  if (!sessionCookie) {
    return (
      <LoginShell
        error={
          errorParam === "invalid-credentials" ||
          errorParam === "missing-credentials" ||
          errorParam === "server-unavailable" ||
          errorParam === "session-expired"
            ? errorParam
            : undefined
        }
      />
    );
  }

  let user: SessionUser | null = null;
  let data: ReferrerDashboardData | null = null;
  let hasMockApiError = false;

  try {
    [user, data] = await Promise.all([
      getMockUserById(sessionCookie),
      getReferrerDashboardData(sessionCookie, appBaseUrl),
    ]);
  } catch {
    hasMockApiError = true;
  }

  if (hasMockApiError) {
    return (
      <MockServerState
        title="Referral data is unavailable"
        description="We could not load the signed-in referral dashboard. This is unexpected because demo users and dashboards are bundled with the app."
      />
    );
  }

  if (!user || !data) {
    return <LoginShell error="session-expired" />;
  }

  const termsError: ReferralTermsAcceptQueryError | undefined =
    termsErrorParam === "server-unavailable" ||
    termsErrorParam === "terms-misconfigured" ||
    termsErrorParam === "terms-unavailable" ||
    termsErrorParam === "terms-rejected"
      ? termsErrorParam
      : undefined;

  return (
    <DashboardShell
      data={data}
      user={user}
      termsError={termsError}
      termsAcceptAction={acceptReferralTermsAction}
    />
  );
}
