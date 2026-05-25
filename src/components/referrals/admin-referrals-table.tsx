import { StateBadge } from "@/components/referrals/state-badge";
import { WorkspaceEmptyState } from "@/components/workspace/workspace-empty-state";
import {
  workspaceFluidContentClass,
  workspaceSectionBandClass,
} from "@/components/workspace/workspace-content-inset";
import { formatCurrency, formatDate } from "@/lib/referrals/format";
import type { AdminReferralRow } from "@/lib/referrals/types";

interface AdminReferralsTableProps {
  referrals: AdminReferralRow[];
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[10px] border border-ws-border bg-ws-card px-4 py-3">
      <p className="text-xs font-medium text-ws-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ws-primary">
        {value}
      </p>
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
    <section className="w-full">
      <div className={workspaceSectionBandClass}>
        <div className={`${workspaceFluidContentClass} py-5 sm:py-6`}>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ws-muted">
            Summary
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <StatChip label="Total records" value={referrals.length} />
            <StatChip label="Active referrers" value={uniqueReferrers} />
            <StatChip label="Pending commission" value={formatCurrency(pendingCommission)} />
          </div>
        </div>
      </div>

      <div className="workspace-toolbar-band w-full">
        <div className={`${workspaceFluidContentClass} py-4`}>
          <p className="text-xs text-ws-secondary">
            <span className="workspace-accent-text font-semibold tabular-nums">
              {referrals.length}
            </span>
            {" "}
            referral record{referrals.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className={`${workspaceFluidContentClass} min-h-0 py-5`}>
        {referrals.length === 0 ? (
          <WorkspaceEmptyState
            title="No referral records yet"
            description="Wire this table to your admin referral API to list referees and payouts across referrers."
          />
        ) : (
          <>
            <div className="grid gap-3 xl:hidden">
              {referrals.map((referral) => (
                <article
                  key={referral.id}
                  className="rounded-[10px] border border-ws-border bg-ws-page px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-ws-muted">{referral.programName}</p>
                      <h3 className="mt-1 text-sm font-semibold text-ws-primary">
                        {referral.refereeName}
                      </h3>
                      <p className="mt-1 text-sm text-ws-secondary">
                        {referral.refereeCompany} · {referral.plan}
                      </p>
                    </div>
                    <StateBadge state={referral.commissionState} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-ws-muted">Referrer</dt>
                      <dd className="mt-1 font-medium text-ws-primary">{referral.referrerName}</dd>
                      <dd className="text-xs text-ws-muted">{referral.referrerEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Code</dt>
                      <dd className="mt-1 font-medium text-ws-primary">{referral.referralCode}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Source</dt>
                      <dd className="mt-1 font-medium text-ws-primary">{referral.source}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Joined</dt>
                      <dd className="mt-1 font-medium tabular-nums text-ws-primary">
                        {formatDate(referral.joinedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Status</dt>
                      <dd className="mt-1 font-medium text-ws-secondary">
                        {referral.referralStatus}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Net revenue</dt>
                      <dd className="mt-1 font-medium tabular-nums text-ws-primary">
                        {formatCurrency(referral.netRevenue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Commission</dt>
                      <dd className="mt-1 font-semibold tabular-nums text-ws-primary">
                        {formatCurrency(referral.commission)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ws-muted">Next event</dt>
                      <dd className="mt-1 font-medium text-ws-secondary">{referral.nextEvent}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="hidden max-h-[min(36rem,65vh)] overflow-auto xl:block">
              <table className="w-full min-w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-ws-raised">
                  <tr className="text-xs font-medium text-ws-muted">
                    <th className="px-4 py-3 font-medium">Referrer</th>
                    <th className="px-4 py-3 font-medium">Referee</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Commission</th>
                    <th className="px-4 py-3 font-medium">Net revenue</th>
                    <th className="px-4 py-3 font-medium">Payout</th>
                    <th className="px-4 py-3 font-medium">Next event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ws-border">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="bg-ws-card">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ws-primary">{referral.referrerName}</p>
                        <p className="mt-0.5 text-xs text-ws-muted">{referral.referrerEmail}</p>
                        <p className="mt-1 text-xs text-ws-muted">
                          {referral.programName} · {referral.referralCode}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ws-primary">{referral.refereeName}</p>
                        <p className="mt-0.5 text-xs text-ws-secondary">
                          {referral.refereeCompany} · {referral.plan}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-ws-secondary">{referral.source}</td>
                      <td className="px-4 py-3.5 tabular-nums text-ws-secondary">
                        {formatDate(referral.joinedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-ws-secondary">{referral.referralStatus}</td>
                      <td className="px-4 py-3.5">
                        <StateBadge state={referral.commissionState} />
                      </td>
                      <td className="px-4 py-3.5 font-medium tabular-nums text-ws-primary">
                        {formatCurrency(referral.netRevenue)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums text-ws-primary">
                        {formatCurrency(referral.commission)}
                      </td>
                      <td className="px-4 py-3.5 text-ws-secondary">{referral.nextEvent}</td>
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
