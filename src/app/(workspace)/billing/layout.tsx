import type { ReactNode } from "react";

import { WorkspaceModuleHeader } from "@/components/workspace/workspace-module-header";
import { WorkspaceRouteFrame } from "@/components/workspace/workspace-route-frame";

export default function BillingSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WorkspaceRouteFrame
      moduleHeader={
        <WorkspaceModuleHeader
          title="Billing"
          description="Manage your subscription, plan details, and referral benefits applied to your account."
        />
      }
    >
      {children}
    </WorkspaceRouteFrame>
  );
}
