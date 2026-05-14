import { NextResponse } from "next/server";

import { REFERRAL_SESSION_COOKIE } from "@/lib/referrals/mock-session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/referal", request.url), 303);

  response.cookies.set({
    name: REFERRAL_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
