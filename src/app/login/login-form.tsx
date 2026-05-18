"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
  extractAccessTokenFromLoginBody,
  extractExpiresInSecondsFromLoginBody,
  persistClientAuthSession,
} from "@/lib/referrals/auth-token";
import {
  AUTH_SIGNIN_REFERRAL_PATH,
  buildSigninReferralRequestBody,
} from "@/lib/referrals/referral-auth-client";
import { getPublicAuthApiBase } from "@/lib/referrals/referral-api-client";
import type { LoginQueryError } from "@/lib/referrals/types";

type LoginFormProps = {
  returnTo: string;
  initialError?: LoginQueryError;
};

const errorMessages: Record<LoginQueryError, string> = {
  "invalid-credentials": "Email or password is incorrect. Try again.",
  "missing-credentials": "Enter both email and password to continue.",
  "server-unavailable":
    "Sign-in is temporarily unavailable. Check that the auth API is running and try again.",
  "session-expired": "Your session expired. Sign in again to continue.",
  "auth-misconfigured":
    "Sign-in is not configured: set NEXT_PUBLIC_AUTH_API_BASE_URL in the environment.",
};

export function LoginForm({ returnTo, initialError }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<LoginQueryError | undefined>(initialError);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "").trim();

    if (!email || !password) {
      setError("missing-credentials");
      return;
    }

    const apiBase = getPublicAuthApiBase();
    if (!apiBase) {
      setError("auth-misconfigured");
      return;
    }

    const url = `${apiBase}${AUTH_SIGNIN_REFERRAL_PATH}`;

    setPending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildSigninReferralRequestBody({ email, password })),
      });

      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        setError(
          res.status >= 400 && res.status < 500
            ? "invalid-credentials"
            : "server-unavailable",
        );
        return;
      }

      const token = extractAccessTokenFromLoginBody(json);
      if (!token) {
        setError("invalid-credentials");
        return;
      }

      const maxAge = extractExpiresInSecondsFromLoginBody(json) ?? 60 * 60 * 24;
      persistClientAuthSession(token, maxAge);
      await fetch("/api/auth/session", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, maxAge }),
      });
      window.location.assign(returnTo);
    } catch {
      setError("server-unavailable");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessages[error]}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
            placeholder="name@company.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
            placeholder="Your password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-semibold text-sky-700 underline-offset-2 hover:underline"
          >
            Sign up
          </a>
        </p>
      </form>
    </>
  );
}
