import type { Metadata } from "next";

import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";
import { MockServerState } from "@/components/referrals/mock-server-state";
import { getAdminReferralRows } from "@/lib/referrals/get-admin-referrals";

export const metadata: Metadata = {
  title: "Admin Referrals",
  description:
    "Internal admin route for reviewing referral records from the local mock dataset.",
};

export default async function AdminPage() {
  let referrals = null;
  let hasMockApiError = false;

  try {
    referrals = await getAdminReferralRows();
  } catch {
    hasMockApiError = true;
  }

  if (hasMockApiError || !referrals) {
    return (
      <MockServerState
        title="Admin referral data is unavailable"
        description="We could not load referral records for the internal admin route. Demo data is served from the same in-app mock store as the referral dashboard."
      />
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Internal admin
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Referral operations
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            This route reads the same in-app mock referral store as the referral
            dashboard and signup flow, giving you a single referral list table for
            operator review.
          </p>
        </header>

        <AdminReferralsTable referrals={referrals} />
      </div>
    </main>
  );
}
