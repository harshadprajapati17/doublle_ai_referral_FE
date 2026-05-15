import { HeroCard } from "@/components/referrals/hero-card";
import { ProgramTermsModal } from "@/components/referrals/program-terms-modal";
import { ProgramTermsPanel } from "@/components/referrals/program-terms-panel";
import { RefereesTable } from "@/components/referrals/referees-table";
import { StatsStrip } from "@/components/referrals/stats-strip";
import { TransactionsPanel } from "@/components/referrals/transactions-panel";
import type {
  ReferralTermsAcceptFormAction,
  ReferralTermsAcceptQueryError,
  ReferrerDashboardData,
  SessionUser,
} from "@/lib/referrals/types";

interface DashboardShellProps {
  data: ReferrerDashboardData;
  user: SessionUser;
  termsError?: ReferralTermsAcceptQueryError;
  termsAcceptAction: ReferralTermsAcceptFormAction;
}

function TermsGatePreview({
  data,
  user,
  termsError,
  termsAcceptAction,
}: DashboardShellProps) {
  return (
    <section
      id="overview"
      className="relative flex min-h-[32rem] w-full flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <div
        aria-hidden="true"
        className="grid min-h-full w-full gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-10"
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

          <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] p-5 shadow-[0_18px_50px_rgba(14,165,233,0.08)] sm:p-6">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-5 blur-[3px] sm:p-6">
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
        termsAcceptAction={termsAcceptAction}
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
  termsAcceptAction,
}: DashboardShellProps) {
  const hasAcceptedTerms = Boolean(data.termsAcceptance);
  const hasReferralActivity =
    data.referees.length > 0 || data.transactions.length > 0;
  const showTermsGate = !hasAcceptedTerms;

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,_#f4f7fb_0%,_#eef3f8_100%)]">
      <div className="flex h-full flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-800 bg-[linear-gradient(180deg,_#0f172a_0%,_#111f38_55%,_#14253f_100%)] px-4 py-5 text-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:px-6 lg:flex lg:h-full lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/90">
              Refer & Earn
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Referral dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Manage your personal referral link, conversions, and commission
              activity in one place.
            </p>
          </div>

          <nav className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Navigation
            </p>
            <a
              href="#overview"
              className="mt-3 flex items-center justify-between rounded-2xl border border-sky-300/25 bg-sky-400/10 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">Referral</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Dashboard overview
                </p>
              </div>
              <span className="text-sky-200">/</span>
            </a>
          </nav>

          <div className="mt-6 lg:mt-auto">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Signed in as
              </p>
              <p className="mt-3 text-base font-semibold text-white">{user.name}</p>
              <p className="mt-1 text-sm text-slate-300">{user.email}</p>
              <form action="/api/mock-auth/logout" method="post" className="mt-4">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/12 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div
          className={`min-h-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8 ${
            showTermsGate ? "flex flex-col overflow-hidden" : "overflow-y-auto"
          }`}
        >
          <div
            className={`mx-auto w-full max-w-6xl pb-2 ${
              showTermsGate ? "flex min-h-full flex-1 flex-col" : "space-y-6"
            }`}
          >
            {showTermsGate ? (
              <TermsGatePreview
                data={data}
                user={user}
                termsError={termsError}
                termsAcceptAction={termsAcceptAction}
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

                <section className="space-y-6">
                  <div id="referees" className="scroll-mt-6">
                    <RefereesTable referees={data.referees} />
                  </div>
                  <div id="transactions" className="scroll-mt-6">
                    <TransactionsPanel
                      transactions={data.transactions}
                      programTerms={data.programTerms}
                    />
                  </div>
                </section>

                <ProgramTermsPanel terms={data.programTerms} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
