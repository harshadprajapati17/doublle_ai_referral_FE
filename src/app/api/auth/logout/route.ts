import { NextResponse } from "next/server";

import { getAuthTokenCookieName } from "@/lib/referrals/auth-api";

function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: getAuthTokenCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/** Clears session cookie (for `fetch` from the Log out button). */
export async function POST() {
  return clearAuthCookie(NextResponse.json({ ok: true }));
}

/** Clears session cookie and redirects (direct navigation). */
export async function GET(request: Request) {
  return clearAuthCookie(
    NextResponse.redirect(new URL("/login", request.url), 303),
  );
}
