import { NextResponse } from "next/server";

import { getAuthTokenCookieName } from "@/lib/referrals/auth-api";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

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
