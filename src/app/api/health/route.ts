import { NextResponse } from "next/server";

import { resolveAuthApiBaseUrl } from "@/lib/auth/api-base";

/** Vercel cron → GET {AUTH_API_BASE_URL}/health */
export async function GET() {
  const base = resolveAuthApiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { ok: false, error: "AUTH_API_BASE_URL not configured" },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(`${base}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return NextResponse.json(
      { ok: upstream.ok, status: upstream.status },
      { status: upstream.ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Upstream unreachable" }, { status: 503 });
  }
}
