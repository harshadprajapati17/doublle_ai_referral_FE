import "server-only";

import { cookies } from "next/headers";

import {
  extractAccessTokenFromLoginBody,
  getAuthTokenCookieName,
} from "@/lib/referrals/auth-token";
export { extractAccessTokenFromLoginBody, getAuthTokenCookieName };

export function getAuthApiBase(): string | null {
  const base = process.env.AUTH_API_BASE_URL?.trim();
  return base ? base.replace(/\/$/, "") : null;
}

export function isReferralApiConfigured(): boolean {
  return getAuthApiBase() !== null;
}

export async function getAuthBearerFromCookies(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(getAuthTokenCookieName())?.value?.trim();
  if (!raw) {
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

export async function hasReferralApiSession(): Promise<boolean> {
  return (await getAuthBearerFromCookies()) !== null;
}

export async function referralApiHeaders(): Promise<Record<string, string> | null> {
  const bearer = await getAuthBearerFromCookies();
  if (!bearer) {
    return null;
  }
  return {
    accept: "*/*",
    authorization: `Bearer ${bearer}`,
  };
}

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
};

function sessionUserFromJson(json: unknown): AuthSessionUser | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const user =
    data.user && typeof data.user === "object"
      ? (data.user as Record<string, unknown>)
      : data;

  const email =
    typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!email) {
    return null;
  }

  const id =
    typeof user.id === "string"
      ? user.id.trim()
      : typeof user.userId === "string"
        ? user.userId.trim()
        : email;

  const name =
    typeof user.name === "string" && user.name.trim()
      ? user.name.trim()
      : email.split("@")[0] ?? "Referrer";

  return { id, name, email };
}

/** GET {AUTH_API_BASE_URL}/api/v1/auth/me — current user from login session cookie. */
export async function fetchAuthMe(): Promise<AuthSessionUser | null> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return null;
  }

  const url = `${base}/api/v1/auth/me`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchAuthMe] fetch threw", { url, error });
    return null;
  }

  if (!response.ok) {
    return null;
  }

  try {
    return sessionUserFromJson(await response.json());
  } catch {
    return null;
  }
}

