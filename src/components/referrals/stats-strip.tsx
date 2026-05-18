import type { StatData, StatStatusTone } from "@/lib/referrals/types";

interface StatsStripProps {
  stats: StatData[];
}

const statusToneClass: Record<StatStatusTone, string> = {
  positive: "text-emerald-700",
  neutral: "text-sky-700",
  muted: "text-slate-500",
  unavailable: "text-slate-400",
};

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <section aria-labelledby="referral-performance-heading">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="referral-performance-heading"
            className="text-lg font-semibold tracking-tight text-slate-950"
          >
            Your performance
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Live counts update as referrals click, sign up, and convert.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className="flex min-w-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-950/[0.02] sm:p-6"
          >
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight text-slate-950 tabular-nums sm:text-3xl">
              {stat.value}
            </p>
            <p
              className={`mt-3 text-sm font-medium leading-snug ${statusToneClass[stat.statusTone]}`}
            >
              {stat.change}
            </p>
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
              {stat.helper}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
