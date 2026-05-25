import type { Metadata } from "next";

import { AdminReferralsTable } from "@/components/referrals/admin-referrals-table";
import { WorkspaceModuleHeader } from "@/components/workspace/workspace-module-header";
import { workspaceFluidContentClass } from "@/components/workspace/workspace-content-inset";
import { getAdminReferralRows } from "@/lib/referrals/get-admin-referrals";

export const metadata: Metadata = {
  title: "Admin Referrals",
  description: "Internal admin route for reviewing referral records from the backend.",
};

export default async function AdminPage() {
  const referrals = await getAdminReferralRows();

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header className="workspace-header-band w-full shrink-0">
        <div className={`py-3.5 sm:py-4 ${workspaceFluidContentClass}`}>
          <WorkspaceModuleHeader
            title="Referral operations"
            description="Review referral activity across referrers when the admin API is connected."
          />
        </div>
      </header>

      <div className="min-h-0 w-full flex-1 overflow-y-auto pb-8">
        <AdminReferralsTable referrals={referrals} />
      </div>
    </main>
  );
}
