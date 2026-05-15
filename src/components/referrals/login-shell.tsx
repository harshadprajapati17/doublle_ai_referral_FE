interface LoginShellProps {
  error?: "invalid-credentials" | "missing-credentials" | "server-unavailable" | "session-expired";
}

const credentialSets = [
  {
    label: "Returning referrer",
    email: "harshad@doublle.ai",
    password: "doublle123",
  },
  {
    label: "First visit",
    email: "new.referrer@doublle.ai",
    password: "doublle123",
  },
];

const errorMessages: Record<NonNullable<LoginShellProps["error"]>, string> = {
  "invalid-credentials": "Those dummy credentials did not match any local mock user.",
  "missing-credentials": "Enter both email and password to continue.",
  "server-unavailable":
    "Sign-in failed unexpectedly. Refresh the page and try again, or restart the dev server if you were editing mock data.",
  "session-expired": "Your mock session is no longer valid. Sign in again.",
};

export function LoginShell({ error }: LoginShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Refer & Earn
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Mock login for the in-app referral dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This screen uses demo credentials and in-app mock data bundled with the
              Next.js server. No separate mock API process is required.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {credentialSets.map((credential) => (
                <article
                  key={credential.email}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {credential.label}
                  </p>
                  <dl className="mt-3 space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Email</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {credential.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Password</dt>
                      <dd className="mt-1 font-medium text-slate-900">
                        {credential.password}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Sign in with dummy credentials
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use one of the seeded mock users to load a returning-referrer view or
              the first-visit terms gate for a new referrer.
            </p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessages[error]}
              </div>
            ) : null}

            <form action="/api/mock-auth/login" method="post" className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={credentialSets[0].email}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  defaultValue={credentialSets[0].password}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Enter referral dashboard
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-sky-100 bg-sky-50 px-5 py-5 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">Local setup</p>
              <p className="mt-2">
                Run `npm run dev` and open this route. Signup submissions are kept in
                server memory until you restart the dev server. Terms acceptance and
                your referral link come from the referral API when AUTH_API_BASE_URL
                and a bearer token are set.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
