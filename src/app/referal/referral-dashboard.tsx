"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DashboardShell } from "@/components/referrals/dashboard-shell";
import { MockServerState } from "@/components/referrals/mock-server-state";
import { getClientSessionUser } from "@/lib/referrals/auth-token";
import { buildReferrerDashboardAfterTermsAccept } from "@/lib/referrals/build-referrer-dashboard";
import {
  acceptReferralTermsClient,
  fetchSessionUserClient,
  loadReferralDashboardClient,
} from "@/lib/referrals/referral-api-client";
import type {
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
  SessionUser,
} from "@/lib/referrals/types";

type LoadIssue =
  | "misconfigured"
  | "no_session"
  | "api_unreachable"
  | "unauthorized";

type ReferralDashboardProps = {
  apiConfigured: boolean;
};

function parseTermsError(param: string | null): ReferralTermsAcceptQueryError | undefined {
  if (
    param === "terms-misconfigured" ||
    param === "terms-unavailable" ||
    param === "terms-rejected" ||
    param === "server-unavailable"
  ) {
    return param;
  }
  return undefined;
}

function issueCopy(issue: LoadIssue): { title: string; description: string } {
  switch (issue) {
    case "misconfigured":
      return {
        title: "Referral API not configured",
        description:
          "Set NEXT_PUBLIC_AUTH_API_BASE_URL to your auth API origin, then restart the dev server.",
      };
    case "no_session":
      return {
        title: "Sign in required",
        description: "Your session cookie is missing. Sign in again to open the referral dashboard.",
      };
    case "unauthorized":
      return {
        title: "Session expired",
        description:
          "The auth API rejected your token (HTTP 401). Sign out, sign in again, then return here.",
      };
    case "api_unreachable":
    default:
      return {
        title: "Referral dashboard unavailable",
        description:
          "We could not load /api/v1/referral/program or /api/v1/referral/me/dashboard. Ensure the auth API is running at your configured base URL and check DevTools → Network for failures (CORS, 404, 500).",
      };
  }
}

export function ReferralDashboard({ apiConfigured }: ReferralDashboardProps) {
  const searchParams = useSearchParams();
  const urlTermsError = parseTermsError(searchParams.get("termsError"));
  const [data, setData] = useState<ReferrerDashboardData | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadIssue, setLoadIssue] = useState<LoadIssue | null>(() =>
    apiConfigured ? null : "misconfigured",
  );
  const [loading, setLoading] = useState(apiConfigured);
  const [termsError, setTermsError] = useState<ReferralTermsAcceptQueryError | undefined>(
    urlTermsError,
  );
  const [acceptPending, setAcceptPending] = useState(false);

  const reloadDashboard = useCallback(
    async (options?: { keepExistingOnFailure?: boolean }): Promise<boolean> => {
      const result = await loadReferralDashboardClient();
      if (result.data) {
        setData(result.data);
        setLoadIssue(null);
        return true;
      }
      if (result.issue) {
        setLoadIssue(result.issue);
      }
      if (!options?.keepExistingOnFailure) {
        setData(null);
      }
      return false;
    },
    [],
  );

  useEffect(() => {
    if (!apiConfigured) {
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      const sessionUser =
        (await fetchSessionUserClient()) ??
        getClientSessionUser() ?? {
          id: "referrer",
          name: "Referrer",
          email: "",
        };

      if (!cancelled) {
        setUser(sessionUser);
      }

      await reloadDashboard();
      if (!cancelled) {
        setLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [apiConfigured, reloadDashboard]);

  const onAcceptTerms = useCallback(async () => {
    setTermsError(undefined);
    setAcceptPending(true);
    try {
      const result = await acceptReferralTermsClient();
      if (!result.ok) {
        setTermsError(
          result.status >= 400 && result.status < 500
            ? "terms-rejected"
            : "terms-unavailable",
        );
        return;
      }

      const appBaseUrl =
        typeof window !== "undefined" ? window.location.origin : undefined;

      setData((current) =>
        current
          ? buildReferrerDashboardAfterTermsAccept(
              current,
              result.accept,
              appBaseUrl,
            )
          : current,
      );

      void reloadDashboard({ keepExistingOnFailure: true });
    } catch {
      setTermsError("terms-unavailable");
    } finally {
      setAcceptPending(false);
    }
  }, [reloadDashboard]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
        <p className="text-sm font-medium text-slate-600">Loading referral dashboard…</p>
      </main>
    );
  }

  if (loadIssue || !data || !user) {
    const copy = issueCopy(loadIssue ?? "api_unreachable");
    return (
      <MockServerState
        title={copy.title}
        description={copy.description}
        signInHref={
          loadIssue === "no_session" || loadIssue === "unauthorized"
            ? "/login?returnTo=/referal"
            : undefined
        }
      />
    );
  }

  return (
    <DashboardShell
      data={data}
      user={user}
      termsError={termsError}
      onAcceptTerms={onAcceptTerms}
      acceptTermsPending={acceptPending}
    />
  );
}
