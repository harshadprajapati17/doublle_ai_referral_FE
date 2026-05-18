import { NextResponse } from "next/server";

import {
  getAuthBearerFromCookies,
  getAuthTokenCookieName,
} from "@/lib/referrals/auth-api";
import { getSessionUserFromAccessToken } from "@/lib/referrals/auth-token";

export async function GET() {
  const token = await getAuthBearerFromCookies();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = getSessionUserFromAccessToken(token);
  return NextResponse.json({
    authenticated: true,
    user: user ?? { id: "user", name: "there", email: "" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON body." } }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const token =
    typeof record?.token === "string"
      ? record.token.replace(/^Bearer\s+/i, "").trim()
      : "";
  const maxAge =
    typeof record?.maxAge === "number" && record.maxAge > 0
      ? Math.floor(record.maxAge)
      : 60 * 60 * 24;

  if (!token) {
    return NextResponse.json({ error: { message: "Missing token." } }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getAuthTokenCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
