import { ProgramTermsDocument } from "@/components/referrals/program-terms-document";
import type {
  ProgramTermsData,
  ReferralTermsAcceptQueryError,
} from "@/lib/referrals/types";

interface ProgramTermsModalProps {
  terms: ProgramTermsData;
  error?: ReferralTermsAcceptQueryError;
  onAcceptTerms: () => void | Promise<void>;
  acceptPending?: boolean;
}

export function ProgramTermsModal({
  terms,
  error,
  onAcceptTerms,
  acceptPending = false,
}: ProgramTermsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-ws-primary/40 p-3 sm:p-6">
      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto sm:items-center">
        <section
          role="dialog"
          aria-labelledby="program-terms-title"
          aria-describedby="program-terms-acceptance"
          className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-ws-border bg-ws-card shadow-[0_24px_64px_rgba(15,23,42,0.12)]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-6 py-7 sm:px-10 sm:py-9">
              <ProgramTermsDocument terms={terms} />
            </div>

            <div
              id="program-terms-acceptance"
              className="border-t border-ws-border bg-ws-page px-6 py-4 sm:px-10 sm:py-5"
            >
              <p className="text-xs leading-6 text-ws-secondary">
                By selecting &ldquo;I accept,&rdquo; you confirm that you have read and agree
                to these program terms. Your acceptance is recorded with version{" "}
                {terms.version}, the date and time of acceptance, and your IP address.
                Your referral link and code are activated only after acceptance.
              </p>
            </div>

            {error ? (
              <div className="border-t border-ws-border px-6 py-4 sm:px-10">
                <div className="rounded-[10px] border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error === "server-unavailable"
                    ? "We could not reach the referral API to accept terms. Check the server log, then try again."
                    : error === "terms-misconfigured"
                      ? "Referral API is not configured: set NEXT_PUBLIC_AUTH_API_BASE_URL."
                      : error === "terms-rejected"
                        ? "Sign in again, then accept terms. Your session may have expired."
                        : "The referral API is not reachable. Check DevTools → Network, then try again."}
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-ws-border bg-ws-card px-6 py-4 sm:px-10 sm:py-5">
            <button
              type="button"
              disabled={acceptPending}
              onClick={() => void onAcceptTerms()}
              className="inline-flex w-full items-center justify-center rounded-[10px] bg-ws-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ws-primary/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {acceptPending ? "Accepting…" : "I accept these program terms"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
