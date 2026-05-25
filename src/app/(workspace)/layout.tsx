"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { WorkspaceLayoutShell } from "@/components/workspace/workspace-layout-shell";
import type { WorkspaceNavId } from "@/components/workspace/workspace-app-shell";
import { getClientSessionUser } from "@/lib/referrals/auth-token";
import { fetchSessionUserClient } from "@/lib/referrals/referral-api-client";
import type { SessionUser } from "@/lib/referrals/types";
import {
  WORKSPACE_FALLBACK_USER,
} from "@/lib/workspace/workspace-session";

function activeNavFromPath(pathname: string): WorkspaceNavId {
  return pathname.startsWith("/billing") ? "billing" : "referral";
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeNav = activeNavFromPath(pathname);
  const [user, setUser] = useState<SessionUser>(
    () => getClientSessionUser() ?? WORKSPACE_FALLBACK_USER,
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      const sessionUser =
        (await fetchSessionUserClient()) ?? getClientSessionUser();
      if (!cancelled && sessionUser) {
        setUser(sessionUser);
      }
    }

    void hydrateUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WorkspaceLayoutShell activeNav={activeNav} user={user}>
      {children}
    </WorkspaceLayoutShell>
  );
}
