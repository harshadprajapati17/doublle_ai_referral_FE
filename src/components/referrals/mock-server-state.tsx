interface MockServerStateProps {
  title: string;
  description: string;
  signInHref?: string;
}

export function MockServerState({
  title,
  description,
  signInHref = "/login?returnTo=/referal",
}: MockServerStateProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Referral dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
          <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-5 text-left text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-950">What you can try</p>
            <p className="mt-2">
              Refresh the page. If the problem continues, sign out and sign in again
              with your account on the sign-in page.
            </p>
          </div>
          <a
            href={signInHref}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to sign in
          </a>
        </section>
      </div>
    </main>
  );
}
