import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkspaceDashboard } from "@/app/dashboard/workspace-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Doublle workspace dashboard and subscription.",
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
          <p className="text-sm font-medium text-slate-600">Loading workspace…</p>
        </main>
      }
    >
      <WorkspaceDashboard />
    </Suspense>
  );
}
