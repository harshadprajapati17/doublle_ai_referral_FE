/** Shared auth token helpers (safe for client and server). */

export function getAuthTokenCookieName(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE_NAME?.trim() ||
    process.env.AUTH_TOKEN_COOKIE_NAME?.trim() ||
    "doublle_access_token"
  );
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

/** Mirror API token onto the Next app origin so server components can call referral APIs. */
export function setAppAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 12) {
  if (typeof document === "undefined") {
    return;
  }
  const name = getAuthTokenCookieName();
  document.cookie = `${name}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

/** Client session: cookie + sessionStorage (used by referral dashboard in the browser). */
export function persistClientAuthSession(
  token: string,
  maxAgeSeconds = 60 * 60 * 12,
) {
  const normalized = token.replace(/^Bearer\s+/i, "").trim();
  if (!normalized) {
    return;
  }
  setAppAuthCookie(normalized, maxAgeSeconds);
  try {
    sessionStorage.setItem(getAuthTokenCookieName(), normalized);
  } catch {
    /* private browsing */
  }
}

export function clearClientAuthSession() {
  if (typeof document !== "undefined") {
    const name = getAuthTokenCookieName();
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  }
  try {
    sessionStorage.removeItem(getAuthTokenCookieName());
  } catch {
    /* ignore */
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

/** Bearer for browser API calls — sessionStorage first, then document cookie. */
export function getClientAuthBearer(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const fromStorage = sessionStorage
      .getItem(getAuthTokenCookieName())
      ?.replace(/^Bearer\s+/i, "")
      .trim();
    if (fromStorage) {
      return fromStorage;
    }
  } catch {
    /* ignore */
  }
  return readBearerFromDocumentCookie();
}
