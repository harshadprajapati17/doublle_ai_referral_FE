import type { StatData } from "@/lib/referrals/types";

interface StatsStripProps {
  stats: StatData[];
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.id}
          className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
        >
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-3xl font-semibold tracking-tight text-slate-950">
              {stat.value}
            </p>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {stat.change}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{stat.helper}</p>
        </article>
      ))}
    </section>
  );
}
