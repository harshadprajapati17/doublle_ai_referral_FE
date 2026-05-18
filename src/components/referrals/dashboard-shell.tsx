"use client";

import { HeroCard } from "@/components/referrals/hero-card";
import { WorkspaceAppShell } from "@/components/workspace/workspace-app-shell";
import { ProgramTermsModal } from "@/components/referrals/program-terms-modal";
import { ProgramTermsPanel } from "@/components/referrals/program-terms-panel";
import { RefereesTable } from "@/components/referrals/referees-table";
import { StatsStrip } from "@/components/referrals/stats-strip";
import type {
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
  SessionUser,
} from "@/lib/referrals/types";

interface DashboardShellProps {
  data: ReferrerDashboardData;
  user: SessionUser;
  termsError?: ReferralTermsAcceptQueryError;
  onAcceptTerms: () => void | Promise<void>;
  acceptTermsPending?: boolean;
}

function TermsGatePreview({
  data,
  user,
  termsError,
  onAcceptTerms,
  acceptTermsPending,
}: DashboardShellProps) {
  return (
    <section
      id="overview"
      className="relative w-full rounded-2xl border border-slate-200 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
    >
      <div
        aria-hidden="true"
        className="grid w-full gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-10"
      >
        <div className="space-y-6 blur-[3px]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              {data.hero.programName}
            </span>
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Welcome, {user.name}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Accept the active referral program terms to generate your personal
                link, short code, and live stats.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Reward
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.hero.rewardSummary}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Duration
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.hero.rewardDuration}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Payout
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {data.hero.payoutType}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] p-5 shadow-[0_12px_32px_rgba(14,165,233,0.06)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Stats card
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Your referral stats start here
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.stats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">{stat.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 blur-[3px] sm:p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Personal link</p>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="h-5 w-full rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Referral code</p>
              <div className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <div className="h-7 w-28 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Share in one click</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-11 rounded-full border border-slate-200 bg-slate-50"
                  />
                ))}
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
      <section id="overview" className="scroll-mt-6">
        <HeroCard hero={data.hero} />
      </section>

      <section className="scroll-mt-6">
        <StatsStrip stats={data.stats} />
      </section>

      <ProgramTermsPanel terms={data.programTerms} />
    </>
  );
}

export function DashboardShell({
  data,
  user,
  termsError,
  onAcceptTerms,
  acceptTermsPending,
}: DashboardShellProps) {
  const hasAcceptedTerms = Boolean(data.termsAcceptance);
  const hasReferralActivity = data.referees.length > 0;
  const showTermsGate = !hasAcceptedTerms;

  return (
    <WorkspaceAppShell activeNav="referral" user={user}>
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
          Referral
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Refer & earn
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Manage your personal referral link, conversions, and commission activity.
        </p>
      </header>

      <div className="space-y-6">
        {showTermsGate ? (
          <TermsGatePreview
                data={data}
                user={user}
                termsError={termsError}
                onAcceptTerms={onAcceptTerms}
                acceptTermsPending={acceptTermsPending}
              />
            ) : !hasReferralActivity ? (
              <InitialReferralState data={data} />
            ) : (
              <>
                <section id="overview" className="scroll-mt-6">
                  <HeroCard hero={data.hero} />
                </section>

                <section className="scroll-mt-6">
                  <StatsStrip stats={data.stats} />
                </section>

                <section id="referees" className="scroll-mt-6">
                  <RefereesTable referees={data.referees} />
                </section>

                <ProgramTermsPanel terms={data.programTerms} />
              </>
        )}
      </div>
    </WorkspaceAppShell>
  );
}
