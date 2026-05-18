"use client";

import { useState } from "react";

import { RefereeCommissionSheet } from "@/components/referrals/referee-commission-sheet";
import { StateBadge } from "@/components/referrals/state-badge";
import { formatCurrency, formatDate } from "@/lib/referrals/format";
import type { RefereeData } from "@/lib/referrals/types";

interface RefereesTableProps {
  referees: RefereeData[];
}

function EmptyTableState() {
  return (
    <div className="flex min-h-[210px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">No referees yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Share your link or code to start tracking clicks, signups, and commissions
          here.
        </p>
      </div>
    </div>
  );
}

function MoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
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
      <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Referees
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Track who signed up with your referral link or code. Use the menu at
              the end of each row to view commission details.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm whitespace-nowrap text-slate-600">
            {referees.length} active referral{referees.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 flex-1">
          {referees.length === 0 ? (
            <EmptyTableState />
          ) : (
            <>
              <div className="grid gap-4 xl:hidden">
                {referees.map((referee) => (
                  <article
                    key={referee.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-950">
                          {referee.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
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

                    <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-slate-500">Source</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {referee.source}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Joined</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatDate(referee.joinedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Referral</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {referee.referralStatus}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Revenue</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatCurrency(referee.netRevenue)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Earned</dt>
                        <dd
                          className={`mt-1 font-semibold ${
                            referee.commission >= 0 ? "text-slate-950" : "text-rose-700"
                          }`}
                        >
                          {formatCurrency(referee.commission)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Next</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {referee.nextEvent}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>

              <div className="-mx-1 hidden overflow-x-auto px-1 xl:block">
                <table className="w-full min-w-[58rem] table-fixed border-separate border-spacing-y-3">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[12%]" />
                    <col className="w-[11%]" />
                    <col className="w-[9%]" />
                    <col className="w-[11%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[11%]" />
                    <col className="w-[3rem]" />
                  </colgroup>
                  <thead>
                    <tr className="text-xs font-medium text-slate-500">
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Referee
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Source
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Joined
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Referral
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Payout
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-right align-bottom">
                        Revenue
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-right align-bottom">
                        Earned
                      </th>
                      <th className="whitespace-nowrap px-4 pb-3 text-left align-bottom">
                        Next
                      </th>
                      <th className="w-12 px-4 pb-3 text-right align-bottom">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {referees.map((referee) => (
                      <tr key={referee.id} className="overflow-hidden rounded-2xl bg-slate-50">
                        <td className="rounded-l-2xl px-4 py-4 align-middle">
                          <div>
                            <p className="font-semibold text-slate-950">{referee.name}</p>
                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {referee.company} · {referee.plan}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-middle text-left text-sm font-medium text-slate-700">
                          {referee.source}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-middle text-left text-sm text-slate-700">
                          {formatDate(referee.joinedAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-middle text-left text-sm font-medium text-slate-700">
                          {referee.referralStatus}
                        </td>
                        <td className="px-4 py-4 align-middle text-left">
                          <StateBadge state={referee.commissionState} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-middle text-right text-sm font-medium text-slate-900 tabular-nums">
                          {formatCurrency(referee.netRevenue)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-4 align-middle text-right text-sm font-semibold tabular-nums ${
                            referee.commission >= 0 ? "text-slate-950" : "text-rose-700"
                          }`}
                        >
                          {formatCurrency(referee.commission)}
                        </td>
                        <td className="px-4 py-4 align-middle text-left text-sm leading-5 text-slate-700">
                          {referee.nextEvent}
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 align-middle text-right">
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
