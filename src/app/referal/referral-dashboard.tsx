"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DashboardShell } from "@/components/referrals/dashboard-shell";
import { MockServerState } from "@/components/referrals/mock-server-state";
import { buildReferrerDashboardData } from "@/lib/referrals/build-referrer-dashboard";
import { getClientAuthBearer } from "@/lib/referrals/auth-token";
import {
  acceptReferralTermsClient,
  fetchAuthMeClient,
  getPublicAuthApiBase,
  loadReferralEnrollmentClient,
} from "@/lib/referrals/referral-api-client";
import type {
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
  SessionUser,
} from "@/lib/referrals/types";

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

export function ReferralDashboard() {
  const searchParams = useSearchParams();
  const urlTermsError = parseTermsError(searchParams.get("termsError"));
  const [data, setData] = useState<ReferrerDashboardData | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [termsError, setTermsError] = useState<ReferralTermsAcceptQueryError | undefined>(
    urlTermsError,
  );
  const [acceptPending, setAcceptPending] = useState(false);

  const reloadDashboard = useCallback(async () => {
    const enrollment = await loadReferralEnrollmentClient();
    if (!enrollment) {
      setData(null);
      return false;
    }
    const appBaseUrl =
      typeof window !== "undefined" ? window.location.origin : undefined;
    setData(buildReferrerDashboardData(enrollment, appBaseUrl));
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getPublicAuthApiBase()) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      if (!getClientAuthBearer()) {
        window.location.replace("/login?returnTo=/referal");
        return;
      }

      setLoading(true);
      setLoadError(false);

      const [authUser, ok] = await Promise.all([
        fetchAuthMeClient(),
        reloadDashboard(),
      ]);

      if (cancelled) {
        return;
      }

      setUser(
        authUser ?? {
          id: "referrer",
          name: "Referrer",
          email: "",
        },
      );

      if (!ok) {
        setLoadError(true);
      }

      setLoading(false);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [reloadDashboard]);

  const onAcceptTerms = useCallback(async () => {
    setTermsError(undefined);
    setAcceptPending(true);
    try {
      const { ok, status } = await acceptReferralTermsClient();
      if (!ok) {
        setTermsError(
          status >= 400 && status < 500 ? "terms-rejected" : "terms-unavailable",
        );
        return;
      }
      const refreshed = await reloadDashboard();
      if (!refreshed) {
        setTermsError("terms-unavailable");
      }
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

  if (loadError || !data || !user) {
    return (
      <MockServerState
        title="Referral dashboard unavailable"
        description="We could not reach the referral API. Check NEXT_PUBLIC_AUTH_API_BASE_URL, ensure the auth service is running, and sign in again. Open DevTools → Network to inspect calls to /api/v1/referral/program and /api/v1/referral/me."
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
