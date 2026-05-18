"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
  extractAccessTokenFromLoginBody,
  extractApiErrorMessage,
  extractExpiresInSecondsFromLoginBody,
  persistClientAuthSession,
} from "@/lib/referrals/auth-token";
import {
  AUTH_SIGNUP_REFERRAL_PATH,
  buildSignupReferralRequestBody,
} from "@/lib/referrals/referral-auth-client";
import {
  getPublicAuthApiBase,
  validateReferralCodeClient,
} from "@/lib/referrals/referral-api-client";
import { REFERRAL_HOME } from "@/lib/auth/cookie";
import {
  resolveSignupReferralSource,
  type SignupReferralAttributionSource,
} from "@/lib/referrals/signup-attribution";

const MIN_PASSWORD_LENGTH = 8;
const POST_SIGNUP_DESTINATION = REFERRAL_HOME;

function signupUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/signup?${q.toString()}`;
}

type SignupFormProps = {
  initialEmail: string;
  initialReferralCode: string;
  initialReferralSource: SignupReferralAttributionSource;
};

export function SignupForm({
  initialEmail,
  initialReferralCode,
  initialReferralSource,
}: SignupFormProps) {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const workEmail = String(fd.get("workEmail") ?? "")
      .trim()
      .toLowerCase();
    const name = String(fd.get("name") ?? "").trim();
    const password = String(fd.get("password") ?? "").trim();
    const referralCode = String(fd.get("referralCode") ?? "")
      .trim()
      .toUpperCase();

    const base: Record<string, string> = {};
    if (referralCode) base.ref = referralCode;
    if (workEmail) base.email = workEmail;

    if (!workEmail || !password) {
      window.location.assign(
        signupUrl({
          ...base,
          message: "Enter your email and password to continue.",
        }),
      );
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      window.location.assign(
        signupUrl({
          ...base,
          message: "Use a password with at least 8 characters.",
        }),
      );
      return;
    }

    const apiBase = getPublicAuthApiBase();
    if (!apiBase) {
      window.location.assign(
        signupUrl({
          ...base,
          message:
            "Signup is not configured: set NEXT_PUBLIC_AUTH_API_BASE_URL to your auth API origin.",
        }),
      );
      return;
    }

    const url = `${apiBase}${AUTH_SIGNUP_REFERRAL_PATH}`;

    setPending(true);
    try {
      if (referralCode) {
        const validation = await validateReferralCodeClient(referralCode);
        if (validation.kind === "invalid") {
          window.location.assign(
            signupUrl({
              ...base,
              message: "That referral code is not valid.",
            }),
          );
          return;
        }
      }

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          buildSignupReferralRequestBody({
            email: workEmail,
            password,
            name: name || undefined,
            referral: referralCode
              ? {
                  code: referralCode,
                  source: resolveSignupReferralSource(
                    referralCode,
                    initialReferralCode,
                    initialReferralSource,
                  ),
                }
              : undefined,
          }),
        ),
      });

      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        const message =
          extractApiErrorMessage(json) ?? `Signup failed (${res.status})`;
        window.location.assign(signupUrl({ ...base, message }));
        return;
      }

      const token = extractAccessTokenFromLoginBody(json);
      if (!token) {
        const message =
          extractApiErrorMessage(json) ?? "Signup did not return a session.";
        window.location.assign(signupUrl({ ...base, message }));
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
      window.location.assign(POST_SIGNUP_DESTINATION);
    } catch {
      window.location.assign(
        signupUrl({
          ...base,
          message: "Unable to reach the sign-in service. Try again.",
        }),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="name"
        >
          Name <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="work-email"
        >
          Email
        </label>
        <input
          id="work-email"
          name="workEmail"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail}
          placeholder="name@company.com"
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="referral-code"
        >
          Referral code{" "}
          <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="referral-code"
          name="referralCode"
          type="text"
          autoComplete="off"
          spellCheck={false}
          defaultValue={initialReferralCode}
          placeholder="e.g. HARSH25"
          disabled={pending}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-medium uppercase tracking-wide text-slate-950 shadow-sm outline-none transition placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60"
        />
        <p className="text-sm text-slate-600">
          Add a code if you were invited. When prefilled from your link, what
          you submit overrides the referral cookie.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <a
          href={`/login?returnTo=${encodeURIComponent(REFERRAL_HOME)}`}
          className="font-semibold text-sky-700 underline-offset-2 hover:underline"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
