import { NextResponse } from "next/server";

import { getMockUserByCredentials } from "@/lib/referrals/get-referrer-dashboard";
import {
  REFERRAL_SESSION_COOKIE,
  REFERRAL_SESSION_MAX_AGE,
} from "@/lib/referrals/mock-session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/referal?error=missing-credentials", request.url),
      303,
    );
  }

  try {
    const user = await getMockUserByCredentials({ email, password });

    if (!user) {
      return NextResponse.redirect(
        new URL("/referal?error=invalid-credentials", request.url),
        303,
      );
    }

    const response = NextResponse.redirect(new URL("/referal", request.url), 303);
    response.cookies.set({
      name: REFERRAL_SESSION_COOKIE,
      value: user.id,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: REFERRAL_SESSION_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/referal?error=server-unavailable", request.url),
      303,
    );
  }
}
