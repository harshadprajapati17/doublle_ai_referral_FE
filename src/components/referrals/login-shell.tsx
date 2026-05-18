import { LoginForm } from "@/app/login/login-form";
import type { LoginQueryError } from "@/lib/referrals/types";

interface LoginShellProps {
  error?: LoginQueryError;
  returnTo?: string;
}

export function LoginShell({ error, returnTo = "/referal" }: LoginShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Refer & Earn
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Sign in to your referral dashboard
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Use your Doublle account email and password. After sign-in you will be
            taken to your referral link, stats, and commission history.
          </p>

          <LoginForm returnTo={returnTo} initialError={error} />
        </section>
      </div>
    </main>
  );
}
