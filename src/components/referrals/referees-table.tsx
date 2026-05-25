"use client";

import { useState } from "react";

import { RefereeCommissionSheet } from "@/components/referrals/referee-commission-sheet";
import { StateBadge } from "@/components/referrals/state-badge";
import { WorkspaceEmptyState } from "@/components/workspace/workspace-empty-state";
import { workspaceFluidContentClass } from "@/components/workspace/workspace-content-inset";
import { formatCurrency, formatDate } from "@/lib/referrals/format";
import type { RefereeData } from "@/lib/referrals/types";

interface RefereesTableProps {
  referees: RefereeData[];
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="8" cy="3" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="8" cy="13" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

type RowActionsProps = {
  referee: RefereeData;
  onViewCommissions: (referee: RefereeData) => void;
};

function RowActions({ referee, onViewCommissions }: RowActionsProps) {
  const hasCommissions = referee.transactions.length > 0;

  return (
    <div className="flex justify-end">
      <button
        type="button"
        aria-label={`View commission details for ${referee.name}`}
        disabled={!hasCommissions}
        onClick={() => onViewCommissions(referee)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-ws-border bg-ws-card text-ws-secondary transition hover:bg-ws-page hover:text-ws-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MoreIcon />
      </button>
    </div>
  );
}

export function RefereesTable({ referees }: RefereesTableProps) {
  const [sheetReferee, setSheetReferee] = useState<RefereeData | null>(null);

  return (
    <>
      <section className="flex w-full flex-col border-b border-[#e4e6eb] bg-white">
        <div className="workspace-toolbar-band w-full">
          <div className={`${workspaceFluidContentClass} py-4`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ws-primary">
                Referees
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ws-secondary">
                Teams that signed up with your link or code. Open a row menu for commission
                details.
              </p>
            </div>
            <p className="text-xs text-ws-secondary">
              <span className="workspace-accent-text font-semibold tabular-nums">
                {referees.length}
              </span>
              {" "}
              active referral{referees.length === 1 ? "" : "s"}
            </p>
          </div>
          </div>
        </div>

        <div className={`${workspaceFluidContentClass} min-h-0 flex-1 py-5`}>
          {referees.length === 0 ? (
            <WorkspaceEmptyState
              icon={<UsersIcon />}
              title="No referees yet"
              description="Share your link or code to start tracking clicks, signups, and commissions here."
            />
          ) : (
            <>
              <div className="grid gap-3 xl:hidden">
                {referees.map((referee) => (
                  <article
                    key={referee.id}
                    className="rounded-[10px] border border-ws-border bg-ws-page px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-ws-primary">{referee.name}</h3>
                        <p className="mt-1 text-sm text-ws-secondary">
                          {referee.company} · {referee.plan}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StateBadge state={referee.commissionState} />
                        <RowActions
                          referee={referee}
                          onViewCommissions={setSheetReferee}
                        />
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-ws-muted">Source</dt>
                        <dd className="mt-1 font-medium text-ws-primary">{referee.source}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ws-muted">Joined</dt>
                        <dd className="mt-1 font-medium text-ws-primary tabular-nums">
                          {formatDate(referee.joinedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ws-muted">Referral</dt>
                        <dd className="mt-1 font-medium text-ws-primary">
                          {referee.referralStatus}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ws-muted">Revenue</dt>
                        <dd className="mt-1 font-medium text-ws-primary tabular-nums">
                          {formatCurrency(referee.netRevenue)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ws-muted">Earned</dt>
                        <dd
                          className={`mt-1 font-semibold tabular-nums ${
                            referee.commission >= 0 ? "text-ws-primary" : "text-red-800"
                          }`}
                        >
                          {formatCurrency(referee.commission)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ws-muted">Next</dt>
                        <dd className="mt-1 font-medium text-ws-secondary">
                          {referee.nextEvent}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>

              <div className="hidden max-h-[min(32rem,60vh)] overflow-auto xl:block">
                <table className="w-full min-w-[58rem] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-ws-raised">
                    <tr className="text-xs font-medium text-ws-muted">
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Referee
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Source
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Joined
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Referral
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Payout
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        Revenue
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                        Earned
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Next
                      </th>
                      <th className="w-12 px-4 py-3 text-right font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ws-border">
                    {referees.map((referee) => (
                      <tr key={referee.id} className="bg-ws-card">
                        <td className="px-4 py-3.5 align-middle">
                          <p className="font-semibold text-ws-primary">{referee.name}</p>
                          <p className="mt-0.5 text-xs text-ws-secondary">
                            {referee.company} · {referee.plan}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle text-ws-secondary">
                          {referee.source}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle tabular-nums text-ws-secondary">
                          {formatDate(referee.joinedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle text-ws-secondary">
                          {referee.referralStatus}
                        </td>
                        <td className="px-4 py-3.5 align-middle">
                          <StateBadge state={referee.commissionState} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 align-middle text-right font-medium tabular-nums text-ws-primary">
                          {formatCurrency(referee.netRevenue)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3.5 align-middle text-right font-semibold tabular-nums ${
                            referee.commission >= 0 ? "text-ws-primary" : "text-red-800"
                          }`}
                        >
                          {formatCurrency(referee.commission)}
                        </td>
                        <td className="px-4 py-3.5 align-middle text-ws-secondary">
                          {referee.nextEvent}
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <RowActions
                            referee={referee}
                            onViewCommissions={setSheetReferee}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      <RefereeCommissionSheet
        referee={sheetReferee}
        open={sheetReferee !== null}
        onClose={() => setSheetReferee(null)}
      />
    </>
  );
}
