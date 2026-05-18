import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";

/** Upstream paths that do not require a session cookie. */
const PUBLIC_UPSTREAM_PATHS = new Set(["referral/code/validate"]);

function isPublicUpstreamPath(path: string): boolean {
  return PUBLIC_UPSTREAM_PATHS.has(path);
}

/** Forwards `/api/v1/*` to `AUTH_API_BASE_URL`, attaching the session from cookies. */
export async function proxyToAuthApi(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const base = getAuthApiBase();
  if (!base) {
    return NextResponse.json(
      { error: { message: "Auth API not configured." } },
      { status: 503 },
    );
  }

  const upstreamPath = pathSegments.join("/");
  const url = new URL(`${base}/api/v1/${upstreamPath}`);
  url.search = request.nextUrl.search;

  const needsAuth = !isPublicUpstreamPath(upstreamPath);
  const authHeaders = needsAuth ? await referralApiHeaders() : null;

  if (needsAuth && !authHeaders) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Missing or invalid session cookie.",
        },
      },
      { status: 401 },
    );
  }

  const headers: Record<string, string> = {
    accept: "application/json",
    ...(authHeaders ?? {}),
  };

  const contentType = request.headers.get("content-type");
  if (contentType && request.method !== "GET" && request.method !== "HEAD") {
    headers["content-type"] = contentType;
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[proxyToAuthApi] upstream fetch threw", {
      url: url.toString(),
      error,
    });
    return NextResponse.json(
      { error: { message: "Upstream auth API unreachable." } },
      { status: 502 },
    );
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
