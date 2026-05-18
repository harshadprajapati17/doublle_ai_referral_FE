import { StateBadge } from "@/components/referrals/state-badge";
import { formatCurrency, formatDate } from "@/lib/referrals/format";
import type { AdminReferralRow } from "@/lib/referrals/types";

interface AdminReferralsTableProps {
  referrals: AdminReferralRow[];
}

function EmptyTableState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">No referral records yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Wire this table to your admin referral API to list referees and payouts
          across referrers.
        </p>
      </div>
    </div>
  );
}

export function AdminReferralsTable({ referrals }: AdminReferralsTableProps) {
  const uniqueReferrers = new Set(referrals.map((referral) => referral.referrerId)).size;
  const pendingCommission = referrals.reduce(
    (sum, referral) =>
      referral.commissionState === "pending" ? sum + referral.commission : sum,
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Admin referrals
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Referral list table
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review referral activity across the mock dataset, including seeded
              referee rows and new local signup submissions.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm whitespace-nowrap text-slate-600">
            {referrals.length} referral record{referrals.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Total records
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {referrals.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Active referrers
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {uniqueReferrers}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Pending commission
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {formatCurrency(pendingCommission)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {referrals.length === 0 ? (
          <EmptyTableState />
        ) : (
          <>
            <div className="grid gap-4 xl:hidden">
              {referrals.map((referral) => (
                <article
                  key={referral.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {referral.programName}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-950">
                        {referral.refereeName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {referral.refereeCompany} · {referral.plan}
                      </p>
                    </div>
                    <StateBadge state={referral.commissionState} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">Referrer</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referral.referrerName}
                      </dd>
                      <dd className="text-xs text-slate-500">{referral.referrerEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Code</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referral.referralCode}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Source</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referral.source}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Joined</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {formatDate(referral.joinedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referral.referralStatus}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Net revenue</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {formatCurrency(referral.netRevenue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Commission</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatCurrency(referral.commission)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Next event</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {referral.nextEvent}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <th className="pb-2 pr-4">Referrer</th>
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
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="overflow-hidden rounded-2xl bg-slate-50">
                      <td className="rounded-l-2xl px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {referral.referrerName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {referral.referrerEmail}
                          </p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {referral.programName} · {referral.referralCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {referral.refereeName}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {referral.refereeCompany} · {referral.plan}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {referral.source}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatDate(referral.joinedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {referral.referralStatus}
                      </td>
                      <td className="px-4 py-4">
                        <StateBadge state={referral.commissionState} />
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {formatCurrency(referral.netRevenue)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                        {formatCurrency(referral.commission)}
                      </td>
                      <td className="rounded-r-2xl px-4 py-4 text-sm text-slate-700">
                        {referral.nextEvent}
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
