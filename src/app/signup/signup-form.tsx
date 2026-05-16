"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
  extractAccessTokenFromLoginBody,
  extractExpiresInSecondsFromLoginBody,
  persistClientAuthSession,
} from "@/lib/referrals/auth-token";

const MIN_PASSWORD_LENGTH = 8;
const POST_SIGNUP_DESTINATION = "/dashboard";

function signupUrl(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `/signup?${q.toString()}`;
}

type SignupFormProps = {
  initialEmail: string;
  initialReferralCode: string;
};

export function SignupForm({
  initialEmail,
  initialReferralCode,
}: SignupFormProps) {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const workEmail = String(fd.get("workEmail") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "").trim();
    const referralCode = String(fd.get("referralCode") ?? "").trim().toUpperCase();

    const base: Record<string, string> = {};
    if (referralCode) base.ref = referralCode;
    if (workEmail) base.email = workEmail;

    if (!referralCode) {
      window.location.assign(signupUrl({ ...base, error: "missing-referral" }));
      return;
    }
    if (!workEmail || !password) {
      window.location.assign(signupUrl({ ...base, error: "missing-fields" }));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      window.location.assign(signupUrl({ ...base, error: "weak-password" }));
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim().replace(
      /\/$/,
      "",
    );
    if (!apiBase) {
      window.location.assign(signupUrl({ ...base, error: "auth-misconfigured" }));
      return;
    }

    // Temporary: signup signs the user in via demo auth (no separate register call yet).
    const url = `${apiBase}/api/v1/auth/demo`;

    setPending(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: workEmail, password }),
      });

      if (!res.ok) {
        const err =
          res.status >= 400 && res.status < 500 ? "auth-rejected" : "auth-unavailable";
        window.location.assign(signupUrl({ ...base, error: err }));
        return;
      }

      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      const token = extractAccessTokenFromLoginBody(json);
      if (!token) {
        window.location.assign(signupUrl({ ...base, error: "auth-rejected" }));
        return;
      }

      const maxAge = extractExpiresInSecondsFromLoginBody(json) ?? 60 * 60 * 24;
      persistClientAuthSession(token, maxAge);
      window.location.assign(POST_SIGNUP_DESTINATION);
    } catch {
      window.location.assign(signupUrl({ ...base, error: "auth-unavailable" }));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="work-email">
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
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
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
          Referral code
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
          Prefilled from your invite link when available. You can edit it; what you
          submit overrides the referral cookie.
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
          href="/login?returnTo=/dashboard"
          className="font-semibold text-sky-700 underline-offset-2 hover:underline"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
