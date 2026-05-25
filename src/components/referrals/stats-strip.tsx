import {
  workspaceFluidContentClass,
} from "@/components/workspace/workspace-content-inset";
import type { StatData, StatStatusTone } from "@/lib/referrals/types";

interface StatsStripProps {
  stats: StatData[];
}

const statusToneClass: Record<StatStatusTone, string> = {
  positive: "text-emerald-600",
  neutral: "text-ws-secondary",
  muted: "text-ws-muted",
  unavailable: "text-ws-muted",
};

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <section
      aria-labelledby="referral-performance-heading"
      className="w-full bg-ws-page"
    >
      <div className={`${workspaceFluidContentClass} pb-8`}>
        <div className="mb-5">
          <h2
            id="referral-performance-heading"
            className="text-base font-semibold tracking-[-0.01em] text-ws-primary"
          >
            Your performance
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ws-secondary">
            Live counts update as referrals click, sign up, and convert.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const isEarnings = stat.id === "totalEarned";
            return (
              <article
                key={stat.id}
                className={`flex min-w-0 flex-col rounded-xl border px-5 py-4 ${
                  isEarnings
                    ? "border-brand/20 bg-brand-soft/50"
                    : "border-ws-border bg-white"
                }`}
              >
                <p className={`text-[0.6875rem] font-medium uppercase tracking-wider ${isEarnings ? "text-brand" : "text-ws-muted"}`}>
                  {stat.label}
                </p>
                <p className={`mt-2.5 text-2xl font-semibold leading-none tracking-tight tabular-nums ${isEarnings ? "text-brand" : "text-ws-primary"}`}>
                  {stat.value}
                </p>
                <p className={`mt-2.5 text-xs font-medium leading-snug ${statusToneClass[stat.statusTone]}`}>
                  {stat.change}
                </p>
                {stat.helper ? (
                  <p className="mt-2 text-[0.6875rem] leading-relaxed text-ws-muted">{stat.helper}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
