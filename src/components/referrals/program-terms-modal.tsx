import type {
  ProgramTermsData,
  ReferralTermsAcceptFormAction,
  ReferralTermsAcceptQueryError,
} from "@/lib/referrals/types";

interface ProgramTermsModalProps {
  terms: ProgramTermsData;
  error?: ReferralTermsAcceptQueryError;
  termsAcceptAction: ReferralTermsAcceptFormAction;
}

export function ProgramTermsModal({
  terms,
  error,
  termsAcceptAction,
}: ProgramTermsModalProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col bg-slate-950/45 p-4 sm:p-6">
      <div className="flex h-full items-start justify-center overflow-y-auto sm:items-center">
        <section className="my-auto w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Program terms
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Accept the referral terms to unlock your link and code
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Your first visit is gated until you accept the active referral program
              terms. Acceptance is logged with the current version, timestamp, and
              IP address.
            </p>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold text-slate-950">{terms.title}</p>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Version {terms.version}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{terms.summary}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {terms.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error === "server-unavailable"
                  ? "We could not reach the referral API to accept terms. Check the server log, then try again."
                  : error === "terms-misconfigured"
                    ? "Referral API is not configured: set AUTH_API_BASE_URL and REFERRAL_API_BEARER_TOKEN (or REFERRAL_TERMS_DEMO_BEARER_TOKEN) on the server."
                    : error === "terms-rejected"
                      ? "The referral API rejected this terms acceptance. Check that your bearer token is valid."
                      : "The referral API is not reachable. Ensure the service at AUTH_API_BASE_URL is running, then try again."}
              </div>
            ) : null}

            <form action={termsAcceptAction} className="mt-6">
              <input type="hidden" name="returnTo" value="/referal" />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Accept terms and continue
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
