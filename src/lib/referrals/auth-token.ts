/** Shared auth token helpers (safe for client and server). */

import {
  parseAuthTokenCookieValue,
  readAuthCookieName,
} from "@/lib/auth/cookie";
import type { SessionUser } from "@/lib/referrals/types";

export { parseAuthTokenCookieValue };

/** Cookie name for the app auth token (`doublle_access_token` by default). */
export function getAuthTokenCookieName(): string {
  return readAuthCookieName();
}

export function extractExpiresInSecondsFromLoginBody(
  json: unknown,
): number | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const value = data.expiresInSeconds ?? data.expires_in_seconds;
  return typeof value === "number" && value > 0 ? value : null;
}

export function extractAccessTokenFromLoginBody(json: unknown): string | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const session =
    data.session && typeof data.session === "object"
      ? (data.session as Record<string, unknown>)
      : null;

  const candidates = [
    data.accessToken,
    data.access_token,
    data.token,
    session?.accessToken,
    session?.access_token,
    session?.token,
    root.accessToken,
    root.access_token,
    root.token,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return null;
}

/** Reads `{ error: { message } }` or top-level `message` from API error bodies. */
export function extractApiErrorMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const error =
    root.error && typeof root.error === "object"
      ? (root.error as Record<string, unknown>)
      : null;
  const message =
    (typeof error?.message === "string" && error.message.trim()) ||
    (typeof root.message === "string" && root.message.trim());

  return message || null;
}

/** Mirror API token onto the Next app origin so server components can call referral APIs. */
export function setAppAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 12) {
  if (typeof document === "undefined") {
    return;
  }
  const name = getAuthTokenCookieName();
  document.cookie = `${name}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

/** Persist token in the app cookie (read by middleware and API clients). */
export function persistClientAuthSession(
  token: string,
  maxAgeSeconds = 60 * 60 * 12,
) {
  const normalized = token.replace(/^Bearer\s+/i, "").trim();
  if (!normalized) {
    return;
  }
  setAppAuthCookie(normalized, maxAgeSeconds);
}

export function clearClientAuthSession() {
  if (typeof document !== "undefined") {
    const name = getAuthTokenCookieName();
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  }
}

function readBearerFromDocumentCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const name = getAuthTokenCookieName();
  const prefix = `${name}=`;

  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) {
      continue;
    }
    const raw = trimmed.slice(prefix.length);
    if (!raw) {
      return null;
    }
    try {
      const value = decodeURIComponent(raw).replace(/^Bearer\s+/i, "").trim();
      return value || null;
    } catch {
      const value = raw.replace(/^Bearer\s+/i, "").trim();
      return value || null;
    }
  }

  return null;
}

/** Best-effort user display fields from a JWT access token (no network call). */
export function getSessionUserFromAccessToken(token: string): SessionUser | null {
  const normalized = token.replace(/^Bearer\s+/i, "").trim();
  const parts = normalized.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;

    const email =
      typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const id =
      typeof payload.sub === "string"
        ? payload.sub.trim()
        : typeof payload.userId === "string"
          ? payload.userId.trim()
          : typeof payload.id === "string"
            ? payload.id.trim()
            : email || "user";

    const name =
      typeof payload.name === "string" && payload.name.trim()
        ? payload.name.trim()
        : email
          ? (email.split("@")[0] ?? "there")
          : "there";

    return { id, name, email };
  } catch {
    return null;
  }
}

export function getClientSessionUser(): SessionUser | null {
  const bearer = getClientAuthBearer();
  if (!bearer) {
    return null;
  }
  return getSessionUserFromAccessToken(bearer);
}

/** Bearer for browser API calls — reads `doublle_access_token` cookie only. */
export function getClientAuthBearer(): string | null {
  return readBearerFromDocumentCookie();
}
