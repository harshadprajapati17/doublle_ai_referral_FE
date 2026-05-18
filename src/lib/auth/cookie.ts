import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "doublle_access_token";

/** Normalizes a raw auth cookie value (Bearer prefix, URI encoding). */
export function parseAuthTokenCookieValue(raw: string | undefined): string | null {
  if (!raw?.trim()) {
    return null;
  }
  let token = raw.replace(/^Bearer\s+/i, "").trim();
  try {
    token = decodeURIComponent(token);
  } catch {
    /* use raw token if cookie was not URI-encoded */
  }
  return token || null;
}

export const REFERRAL_HOME = "/referal";

/** Paths that do not require a session cookie. */
export const PUBLIC_PATHS = ["/login", "/signup"] as const;

/** App routes (anything else while signed in → 404). */
export const APP_PATHS = ["/referal", "/billing", "/dashboard", "/admin"] as const;

export function readAuthCookieName(): string {
  return process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME?.trim() || AUTH_COOKIE_NAME;
}

export function hasAuthCookie(request: NextRequest): boolean {
  const raw = request.cookies.get(readAuthCookieName())?.value;
  return parseAuthTokenCookieValue(raw) !== null;
}

export function isPublicPath(pathname: string): boolean {
  return (PUBLIC_PATHS as readonly string[]).includes(pathname);
}

export function isAppPath(pathname: string): boolean {
  return (APP_PATHS as readonly string[]).includes(pathname);
}
