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
    <section
      aria-label="Referral performance"
      className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="flex min-w-0 flex-col rounded-2xl border border-slate-200/90 bg-white px-5 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6"
        >
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {stat.label}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            <p className="text-[1.75rem] font-semibold leading-none tracking-tight text-slate-950 tabular-nums sm:text-3xl">
              {stat.value}
            </p>
            <p
              className={`text-sm font-medium leading-snug ${statusToneClass[stat.statusTone]}`}
            >
              {stat.change}
            </p>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs leading-relaxed text-slate-500">{stat.helper}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
