import { cookies } from "next/headers";
import Link from "next/link";

import { readAuthCookieName, REFERRAL_HOME } from "@/lib/auth/cookie";
import { parseAuthTokenCookieValue } from "@/lib/referrals/auth-token";

export default async function NotFound() {
  const token = parseAuthTokenCookieValue(
    (await cookies()).get(readAuthCookieName())?.value,
  );
  const signedIn = token !== null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">Page not found</h1>
      <p className="max-w-md text-slate-600">
        {signedIn
          ? "That page does not exist. Head back to your referral dashboard."
          : "That page does not exist."}
      </p>
      {signedIn ? (
        <Link
          href={REFERRAL_HOME}
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to referral dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Sign in
        </Link>
      )}
    </main>
  );
}
