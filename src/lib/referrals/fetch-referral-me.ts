import "server-only";

function bearerFromEnv(): string | null {
  const raw =
    process.env.REFERRAL_API_BEARER_TOKEN?.trim() ??
    process.env.REFERRAL_TERMS_DEMO_BEARER_TOKEN?.trim();
  if (!raw) {
    return null;
  }
  const token = raw.replace(/^Bearer\s+/i, "").trim();
  return token || null;
}

export function getReferralApiAuth(): { base: string; bearer: string } | null {
  const base = process.env.AUTH_API_BASE_URL?.trim();
  const bearer = bearerFromEnv();
  if (!base || !bearer) {
    return null;
  }
  return { base, bearer };
}

/** True when GET /referral/me (and terms POST) can be called with env auth. */
export function isReferralApiConfigured(): boolean {
  return getReferralApiAuth() !== null;
}

export type ReferralMePayload = {
  programId: string;
  termsVersion: string;
  code: string;
  referralUrl: string;
  createdAt?: string;
};

/**
 * GET {AUTH_API_BASE_URL}/api/v1/referral/me
 * When `data.programId` and `data.referralUrl` are present, the referrer has accepted
 * terms and has an active referral link in the upstream API.
 */
export async function fetchReferralMe(): Promise<ReferralMePayload | null> {
  const auth = getReferralApiAuth();
  if (!auth) {
    return null;
  }

  const url = `${auth.base.replace(/\/$/, "")}/api/v1/referral/me`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        authorization: `Bearer ${auth.bearer}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchReferralMe] fetch threw", { url, error });
    return null;
  }

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = (await response.text()).slice(0, 500);
    } catch {
      /* ignore */
    }
    console.error("[fetchReferralMe] non-OK", {
      url,
      status: response.status,
      bodyPreview,
    });
    return null;
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }

  if (!json || typeof json !== "object") {
    return null;
  }

  const data = (json as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    return null;
  }

  const row = data as Record<string, unknown>;
  const programId = typeof row.programId === "string" ? row.programId.trim() : "";
  const referralUrl =
    typeof row.referralUrl === "string" ? row.referralUrl.trim() : "";

  if (!programId || !referralUrl) {
    return null;
  }

  let code = typeof row.code === "string" ? row.code.trim() : "";
  if (!code) {
    try {
      code = new URL(referralUrl).searchParams.get("ref")?.trim() ?? "";
    } catch {
      /* ignore */
    }
  }

  const termsVersion =
    typeof row.termsVersion === "string" ? row.termsVersion.trim() : "v1";
  const createdAt =
    typeof row.createdAt === "string" ? row.createdAt.trim() : undefined;

  return {
    programId,
    termsVersion,
    code,
    referralUrl,
    createdAt,
  };
}
