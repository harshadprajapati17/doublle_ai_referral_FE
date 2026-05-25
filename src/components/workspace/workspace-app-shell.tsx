"use client";

import type { ReactNode } from "react";

import { WorkspaceLayoutShell } from "@/components/workspace/workspace-layout-shell";
import { WorkspaceRouteFrame } from "@/components/workspace/workspace-route-frame";
import type { SessionUser } from "@/lib/referrals/types";

export type WorkspaceNavId = "billing" | "referral";

type WorkspaceAppShellProps = {
  activeNav: WorkspaceNavId;
  user: SessionUser;
  /** Full-bleed top band; use {@link WorkspaceModuleHeader} for consistent typography. */
  moduleHeader?: ReactNode;
  children: ReactNode;
};

/** Standalone workspace chrome (sidebar + main). Prefer the `(workspace)` route layout when possible. */
export function WorkspaceAppShell({
  activeNav,
  user,
  moduleHeader,
  children,
}: WorkspaceAppShellProps) {
  return (
    <WorkspaceLayoutShell activeNav={activeNav} user={user}>
      <WorkspaceRouteFrame moduleHeader={moduleHeader}>{children}</WorkspaceRouteFrame>
    </WorkspaceLayoutShell>
  );
}
