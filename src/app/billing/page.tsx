import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkspaceDashboard } from "@/app/dashboard/workspace-dashboard";

export const metadata: Metadata = {
  title: "Billing",
  description: "Your Doublle subscription and billing.",
};

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
          <p className="text-sm font-medium text-slate-600">Loading billing…</p>
        </main>
      }
    >
      <WorkspaceDashboard />
    </Suspense>
  );
}
