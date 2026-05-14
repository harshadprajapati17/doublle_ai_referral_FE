import { StateBadge } from "@/components/referrals/state-badge";
import { formatCurrency, formatDate } from "@/lib/referrals/format";
import type { RefereeData } from "@/lib/referrals/types";

interface RefereesTableProps {
  referees: RefereeData[];
}

function EmptyTableState() {
  return (
    <div className="flex h-full min-h-[210px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
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

export function RefereesTable({ referees }: RefereesTableProps) {
  return (
    <section className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Referees
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Track who signed up with your referral link or code and where each
            commission sits in the lifecycle.
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
            <div className="grid gap-4 lg:hidden">
              {referees.map((referee) => (
                <article
                  key={referee.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
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
                    <StateBadge state={referee.commissionState} />
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
                      <dt className="text-slate-500">Referral status</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referee.referralStatus}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Net revenue</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {formatCurrency(referee.netRevenue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Commission</dt>
                      <dd
                        className={`mt-1 font-semibold ${
                          referee.commission >= 0 ? "text-slate-950" : "text-rose-700"
                        }`}
                      >
                        {formatCurrency(referee.commission)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Next event</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referee.nextEvent}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <th className="pb-2 pr-4">Referee</th>
                    <th className="pb-2 pr-4">Source</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Commission state</th>
                    <th className="pb-2 pr-4">Net revenue</th>
                    <th className="pb-2 pr-4">Commission</th>
                    <th className="pb-2">Next event</th>
                  </tr>
                </thead>
                <tbody>
                  {referees.map((referee) => (
                    <tr key={referee.id} className="overflow-hidden rounded-3xl bg-slate-50">
                      <td className="rounded-l-3xl px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">{referee.name}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {referee.company} · {referee.plan}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {referee.source}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatDate(referee.joinedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {referee.referralStatus}
                      </td>
                      <td className="px-4 py-4">
                        <StateBadge state={referee.commissionState} />
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {formatCurrency(referee.netRevenue)}
                      </td>
                      <td
                        className={`px-4 py-4 text-sm font-semibold ${
                          referee.commission >= 0 ? "text-slate-950" : "text-rose-700"
                        }`}
                      >
                        {formatCurrency(referee.commission)}
                      </td>
                      <td className="rounded-r-3xl px-4 py-4 text-sm text-slate-700">
                        {referee.nextEvent}
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
  );
}
