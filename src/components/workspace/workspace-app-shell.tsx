"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { clearClientAuthSession } from "@/lib/referrals/auth-token";
import type { SessionUser } from "@/lib/referrals/types";

export type WorkspaceNavId = "dashboard" | "referral";

type WorkspaceAppShellProps = {
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
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "Workspace & billing",
  },
  {
    id: "referral",
    href: "/referal",
    label: "Referral",
    description: "Refer & earn",
  },
];

export function WorkspaceAppShell({
  activeNav,
  user,
  children,
}: WorkspaceAppShellProps) {
  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
      <div className="flex h-full flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-800 bg-[linear-gradient(180deg,_#0f172a_0%,_#111f38_55%,_#14253f_100%)] px-4 py-5 text-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:px-6 lg:flex lg:h-full lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90">
              Doublle
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Workspace
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Manage your subscription and referral program from one place.
            </p>
          </div>

          <nav className="mt-8" aria-label="Workspace">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
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
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        active
                          ? "border-sky-300/25 bg-sky-400/10"
                          : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">
                          {item.description}
                        </p>
                      </div>
                      <span className={active ? "text-sky-200" : "text-slate-500"}>
                        /
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 lg:mt-auto">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Signed in as
              </p>
              <p className="mt-3 text-base font-semibold text-white">{user.name}</p>
              <p className="mt-1 text-sm text-slate-300">{user.email}</p>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                onClick={() => {
                  clearClientAuthSession();
                  window.location.href = "/login?returnTo=/dashboard";
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl pb-2">{children}</div>
        </div>
      </div>
    </main>
  );
}