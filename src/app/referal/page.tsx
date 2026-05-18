import type { Metadata } from "next";
import { Suspense } from "react";

import { ReferralDashboard } from "@/app/referal/referral-dashboard";
import { isAuthApiConfigured } from "@/lib/auth/api-base";

export const metadata: Metadata = {
  title: "Referrer Dashboard",
  description:
    "In-app referral dashboard with share tools, conversion stats, referee tracking, and commission history.",
};

export default function ReferralPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
          <p className="text-sm font-medium text-slate-600">Loading referral dashboard…</p>
        </main>
      }
    >
      <ReferralDashboard apiConfigured={isAuthApiConfigured()} />
    </Suspense>
  );
}
