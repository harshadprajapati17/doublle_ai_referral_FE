import "server-only";

import { cookies } from "next/headers";

import { isAuthApiConfigured, resolveAuthApiBaseUrl } from "@/lib/auth/api-base";
import {
  extractAccessTokenFromLoginBody,
  getAuthTokenCookieName,
  parseAuthTokenCookieValue,
} from "@/lib/referrals/auth-token";
export { extractAccessTokenFromLoginBody, getAuthTokenCookieName };

export function getAuthApiBase(): string | null {
  return resolveAuthApiBaseUrl();
}

export function isReferralApiConfigured(): boolean {
  return isAuthApiConfigured();
}

export async function getAuthBearerFromCookies(): Promise<string | null> {
  const store = await cookies();
  return parseAuthTokenCookieValue(store.get(getAuthTokenCookieName())?.value);
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

