import type { Metadata } from "next";
import { Suspense } from "react";

import { ReferralDashboard } from "@/app/(workspace)/referal/referral-dashboard";
import { WorkspaceMainLoading } from "@/components/workspace/workspace-main-loading";
import { isAuthApiConfigured } from "@/lib/auth/api-base";

export const metadata: Metadata = {
  title: "Referrer Dashboard",
  description:
    "In-app referral dashboard with share tools, conversion stats, referee tracking, and commission history.",
};

export default function ReferralPage() {
  return (
    <Suspense fallback={<WorkspaceMainLoading label="Loading referral dashboard…" />}>
      <ReferralDashboard apiConfigured={isAuthApiConfigured()} />
    </Suspense>
  );
}
