import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkspaceDashboard } from "@/app/dashboard/workspace-dashboard";
import { WorkspaceMainLoading } from "@/components/workspace/workspace-main-loading";

export const metadata: Metadata = {
  title: "Billing",
  description: "Your Doublle subscription and billing.",
};

export default function BillingPage() {
  return (
    <Suspense fallback={<WorkspaceMainLoading label="Loading billing…" />}>
      <WorkspaceDashboard />
    </Suspense>
  );
}
