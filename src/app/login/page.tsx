import type { Metadata } from "next";

import { LoginShell } from "@/components/referrals/login-shell";
import { REFERRAL_HOME } from "@/lib/auth/cookie";
import type { LoginQueryError } from "@/lib/referrals/types";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access the Doublle referral dashboard.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    returnTo?: string | string[];
  }>;
}

function parseLoginError(value: string | undefined): LoginQueryError | undefined {
  if (
    value === "invalid-credentials" ||
    value === "missing-credentials" ||
    value === "server-unavailable" ||
    value === "session-expired" ||
    value === "auth-misconfigured"
  ) {
    return value;
  }
  return undefined;
}

function safeReturnTo(value: string | undefined): string {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return REFERRAL_HOME;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const returnToParam = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;

  const returnTo = safeReturnTo(returnToParam);

  return <LoginShell error={parseLoginError(errorParam)} returnTo={returnTo} />;
}
