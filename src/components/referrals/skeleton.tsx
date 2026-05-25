function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

/** Main-pane skeleton while referral route segment loads (sidebar stays mounted). */
export function ReferralMainLoading() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="h-11 w-3/4" />
              <SkeletonBlock className="h-6 w-full" />
              <div className="grid gap-3 sm:grid-cols-3">
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-10 w-32" />
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock className="h-11 w-full" />
                <SkeletonBlock className="h-11 w-full" />
                <SkeletonBlock className="h-11 w-full" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="mt-4 h-9 w-24" />
              <SkeletonBlock className="mt-3 h-4 w-full" />
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <SkeletonBlock className="h-8 w-36" />
            <SkeletonBlock className="mt-3 h-5 w-2/3" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-28 w-full" />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <SkeletonBlock className="h-8 w-40" />
            <SkeletonBlock className="mt-3 h-5 w-3/4" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** @deprecated Use {@link ReferralMainLoading} inside the workspace layout. */
export function DashboardLoading() {
  return <ReferralMainLoading />;
}
