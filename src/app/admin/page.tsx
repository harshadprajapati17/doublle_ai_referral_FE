import type { Metadata } from "next";

import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";
import { getAdminReferralRows } from "@/lib/referrals/get-admin-referrals";

export const metadata: Metadata = {
  title: "Admin Referrals",
  description: "Internal admin route for reviewing referral records from the backend.",
};

export default async function AdminPage() {
  const referrals = await getAdminReferralRows();

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
            Connect this view to your admin referral API when you need operator tooling.
            Until then this table stays empty by design.
          </p>
        </header>

        <AdminReferralsTable referrals={referrals} />
      </div>
    </main>
  );
}
