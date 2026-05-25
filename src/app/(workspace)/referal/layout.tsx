import type { ReactNode } from "react";

import { WorkspaceModuleHeader } from "@/components/workspace/workspace-module-header";
import { WorkspaceRouteFrame } from "@/components/workspace/workspace-route-frame";

export default function ReferralSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WorkspaceRouteFrame
      moduleHeader={
        <WorkspaceModuleHeader
          title="Referral program"
          description="Share your link with teams you trust and earn recurring Doublle credit when they subscribe."
        />
      }
    >
      {children}
    </WorkspaceRouteFrame>
  );
}
