import { type NextRequest, NextResponse } from "next/server";

import {
  hasAuthCookie,
  isAppPath,
  isPublicPath,
  REFERRAL_HOME,
} from "@/lib/auth/cookie";
import {
  ACTIVE_REFERRAL_COOKIE,
  ACTIVE_REFERRAL_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/referrals/referral-cookies";

function applyReferralCookie(response: NextResponse, ref: string): NextResponse {
  response.cookies.set(ACTIVE_REFERRAL_COOKIE, ref, {
    path: "/",
    maxAge: ACTIVE_REFERRAL_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasAuthCookie(request);

  if (authed) {
    if (isPublicPath(pathname) || pathname === "/") {
      return NextResponse.redirect(new URL(REFERRAL_HOME, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/signup") {
    const ref = request.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
    if (ref) {
      return applyReferralCookie(NextResponse.next(), ref);
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (pathname === "/") {
    const ref = request.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
    if (ref) {
      const signupUrl = request.nextUrl.clone();
      signupUrl.pathname = "/signup";
      signupUrl.searchParams.set("ref", ref);
      return applyReferralCookie(NextResponse.redirect(signupUrl), ref);
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAppPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
