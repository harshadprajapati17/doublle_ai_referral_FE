/** Signup URL with `ref` query param — built on the app origin, not the auth API. */
export function buildReferralSignupUrl(appBaseUrl: string, code: string): string {
  const normalized = code.trim().toUpperCase();
  const url = new URL("/signup", appBaseUrl);
  if (normalized) {
    url.searchParams.set("ref", normalized);
  }
  return url.toString();
}

/** Extract referral code from a legacy API `referralUrl` when `code` is omitted. */
export function referralCodeFromUrl(referralUrl: string): string {
  try {
    return new URL(referralUrl).searchParams.get("ref")?.trim().toUpperCase() ?? "";
  } catch {
    return "";
  }
}

export function resolveReferralCode(
  code: string,
  referralUrl?: string | null,
): string {
  const trimmed = code.trim().toUpperCase();
  if (trimmed) {
    return trimmed;
  }
  if (referralUrl?.trim()) {
    return referralCodeFromUrl(referralUrl);
  }
  return "";
}
