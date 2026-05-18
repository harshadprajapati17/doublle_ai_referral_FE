/** Auth / referral API origin — shared by server fetches and browser clients. */
export function resolveAuthApiBaseUrl(): string | null {
  const base =
    process.env.AUTH_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim();
  return base ? base.replace(/\/$/, "") : null;
}

export function isAuthApiConfigured(): boolean {
  return resolveAuthApiBaseUrl() !== null;
}
