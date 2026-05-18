import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SignupForm } from "@/app/signup/signup-form";
import { validateReferralCode } from "@/lib/referrals/fetch-validate-referral-code";
import { ACTIVE_REFERRAL_COOKIE } from "@/lib/referrals/referral-cookies";
import { initialSignupReferralSource } from "@/lib/referrals/signup-attribution";

export const metadata: Metadata = {
  title: "Signup",
  description: "Create your Doublle workspace.",
};

interface SignupPageProps {
  searchParams: Promise<{
    ref?: string | string[];
    message?: string | string[];
    email?: string | string[];
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const referralCode = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const errorMessage = (
    Array.isArray(params.message) ? params.message[0] : params.message
  )?.trim();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const activeReferralCookie = (await cookies()).get(
    ACTIVE_REFERRAL_COOKIE,
  )?.value;

  const referralFromQuery = referralCode?.trim().toUpperCase() ?? "";
  const referralCodeDefault =
    referralFromQuery || activeReferralCookie?.trim().toUpperCase() || "";

  const referralValidation = referralFromQuery
    ? await validateReferralCode(referralFromQuery)
    : null;

  const validatedReferralCode =
    referralValidation?.kind === "valid"
      ? referralValidation.code
      : referralCodeDefault;

  const initialReferralSource = initialSignupReferralSource({
    fromQuery: Boolean(referralFromQuery),
    cookieCode: activeReferralCookie ?? "",
    prefilledCode: validatedReferralCode,
  });

  const referralBanner =
    referralValidation?.kind === "valid"
        ? {
            tone: "success" as const,
            message: referralValidation.benefitLabel
              ? `Referral active — you'll receive ${referralValidation.benefitLabel} when you sign up.`
              : "Referral active — your invite will be applied when you sign up.",
          }
        : referralValidation?.kind === "invalid"
          ? {
              tone: "error" as const,
              message:
                "That referral code is not valid. Check the link from your referrer or enter a different code.",
            }
          : referralValidation?.kind === "error"
            ? {
                tone: "warning" as const,
                message:
                  "We could not verify this referral code right now. You can still sign up and try again.",
              }
            : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
              Sign up
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Create your Doublle workspace
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Set your account credentials to continue. Add a referral code if
              you have one — it will be applied at signup.
            </p>
          </div>
        </header>

        <section>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="space-y-5">
              {referralBanner ? (
                <div
                  className={
                    referralBanner.tone === "success"
                      ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900"
                      : referralBanner.tone === "warning"
                        ? "rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
                        : "rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
                  }
                >
                  {referralBanner.message}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <SignupForm
                initialEmail={email ?? ""}
                initialReferralCode={validatedReferralCode}
                initialReferralSource={initialReferralSource}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
