"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

import type { WorkspaceNavId } from "@/components/workspace/workspace-app-shell";
import { logoutClient } from "@/lib/auth/logout";
import type { SessionUser } from "@/lib/referrals/types";

type WorkspaceLayoutShellProps = {
  activeNav: WorkspaceNavId;
  user: SessionUser;
  children: ReactNode;
};

const navItems: {
  id: WorkspaceNavId;
  href: string;
  label: string;
  description: string;
}[] = [
  {
    id: "referral",
    href: "/referal",
    label: "Referral",
    description: "Refer & earn",
  },
  {
    id: "billing",
    href: "/billing",
    label: "Billing",
    description: "Plans & subscription",
  },
];

export function WorkspaceLayoutShell({
  activeNav,
  user,
  children,
}: WorkspaceLayoutShellProps) {
  const [logoutPending, setLogoutPending] = useState(false);

  async function handleLogout() {
    if (logoutPending) {
      return;
    }
    setLogoutPending(true);
    await logoutClient();
  }

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col lg:h-dvh lg:overflow-hidden lg:flex-row">
      <aside className="workspace-sidebar flex w-full shrink-0 flex-col px-5 py-8 lg:h-full lg:w-[260px] lg:max-w-[260px] lg:overflow-hidden lg:border-r lg:border-white/10">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b95a8]">
            Doublle
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#e8ecf4]">
            Workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#8b95a8]">
            Manage your subscription and referral program from one place.
          </p>
        </div>

        <nav className="mt-8 shrink-0" aria-label="Workspace">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b95a8]">
            Navigation
          </p>
          <ul className="mt-3 space-y-2">
            {navItems.map((item) => {
              const active = item.id === activeNav;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-white/10 bg-[#151d2e]"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#e8ecf4]">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#8b95a8]">
                      {item.description}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-8 shrink-0 lg:mt-auto lg:pt-6">
          <div className="rounded-2xl border border-white/10 bg-[#151d2e] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b95a8]">
              Signed in as
            </p>
            <p className="mt-3 text-base font-semibold text-[#e8ecf4]">{user.name}</p>
            <p className="mt-1 truncate text-sm text-[#8b95a8]">{user.email}</p>
            <button
              type="button"
              disabled={logoutPending}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleLogout()}
            >
              {logoutPending ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace-main flex min-h-0 min-w-0 w-full flex-1 flex-col lg:h-full lg:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
