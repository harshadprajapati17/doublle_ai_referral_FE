"use client";

import { HeroCard } from "@/components/referrals/hero-card";
import { ProgramTermsModal } from "@/components/referrals/program-terms-modal";
import { ProgramTermsModalHost } from "@/components/referrals/program-terms-modal-host";
import { RefereesTable } from "@/components/referrals/referees-table";
import { StatsStrip } from "@/components/referrals/stats-strip";
import {
  workspaceFluidContentClass,
  workspaceHeroGridClass,
} from "@/components/workspace/workspace-content-inset";
import type {
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
} from "@/lib/referrals/types";

interface DashboardShellProps {
  data: ReferrerDashboardData;
  termsError?: ReferralTermsAcceptQueryError;
  onAcceptTerms: () => void | Promise<void>;
  acceptTermsPending?: boolean;
}

function TermsGatePreview({
  data,
  termsError,
  onAcceptTerms,
  acceptTermsPending,
}: Omit<DashboardShellProps, "user">) {
  return (
    <section id="overview" className="relative w-full border-b border-ws-border bg-ws-page">
      <div
        aria-hidden="true"
        className={`${workspaceFluidContentClass} py-6 blur-[3px] sm:py-8`}
      >
        <div className="referral-hero-container">
          <div className={workspaceHeroGridClass}>
            <div className="flex flex-col gap-8 px-6 py-6 sm:px-8 sm:py-8">
              <span className="inline-flex rounded-md border border-ws-border bg-ws-page px-2 py-0.5 text-xs font-medium text-ws-secondary">
                {data.hero.programName}
              </span>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-ws-primary">
                  Your referral program
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-ws-secondary">
                  Accept the active referral program terms to generate your personal link, short
                  code, and live stats.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-ws-border">
                <div className="border-b border-ws-border bg-brand-soft/25 px-5 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                    Program terms
                  </p>
                </div>
                <div className="grid gap-2 p-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ws-border">
                  {[
                    { label: "Reward", value: data.hero.rewardSummary },
                    { label: "Duration", value: data.hero.rewardDuration },
                    { label: "Payout", value: data.hero.payoutType },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-3.5 py-3 sm:px-4">
                      <p className="text-xs font-medium text-ws-muted">{item.label}</p>
                      <p className="mt-1.5 text-sm font-semibold text-ws-primary">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-ws-border bg-ws-page/50 p-4">
                <p className="text-xs font-medium text-ws-muted">Performance preview</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {data.stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="rounded-lg border border-ws-border bg-white px-3.5 py-3"
                    >
                      <p className="text-xs text-ws-muted">{stat.label}</p>
                      <p className="mt-1.5 text-xl font-semibold tabular-nums text-ws-primary">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="referral-hero-action border-t border-ws-border px-6 py-6 sm:px-7 sm:py-8 lg:border-t-0 lg:border-l">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-ws-secondary">Referral link</p>
                  <div className="h-10 rounded-lg border border-ws-border bg-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-ws-secondary">Referral code</p>
                  <div className="h-9 w-28 rounded-lg border border-ws-border bg-white" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 rounded-lg border border-ws-border bg-white"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProgramTermsModal
        terms={data.programTerms}
        error={termsError}
        onAcceptTerms={onAcceptTerms}
        acceptPending={acceptTermsPending}
      />
    </section>
  );
}

function InitialReferralState({ data }: Pick<DashboardShellProps, "data">) {
  return (
    <>
      <HeroCard hero={data.hero} />
      <StatsStrip stats={data.stats} />
    </>
  );
}

export function DashboardShell({
  data,
  termsError,
  onAcceptTerms,
  acceptTermsPending,
}: DashboardShellProps) {
  const hasAcceptedTerms = Boolean(data.termsAcceptance);
  const hasReferralActivity = data.referees.length > 0;
  const showTermsGate = !hasAcceptedTerms;

  return (
    <>
      {showTermsGate ? (
        <TermsGatePreview
          data={data}
          termsError={termsError}
          onAcceptTerms={onAcceptTerms}
          acceptTermsPending={acceptTermsPending}
        />
      ) : !hasReferralActivity ? (
        <InitialReferralState data={data} />
      ) : (
        <>
          <HeroCard hero={data.hero} />
          <StatsStrip stats={data.stats} />
          <RefereesTable referees={data.referees} />
        </>
      )}
      <ProgramTermsModalHost terms={data.programTerms} />
    </>
  );
}
