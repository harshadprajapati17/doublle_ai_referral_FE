import { NextResponse } from "next/server";

import { createMockTermsAcceptance } from "@/lib/referrals/mock-terms";

function getSafeReturnPath(value: FormDataEntryValue | null) {
  const returnTo = typeof value === "string" ? value : "";

  return returnTo.startsWith("/") ? returnTo : "/referal";
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "local-dev"
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "").trim();
  const programId = String(formData.get("programId") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  const destination = new URL(getSafeReturnPath(formData.get("returnTo")), request.url);

  if (!userId || !programId || !version) {
    return NextResponse.redirect(destination, 303);
  }

  try {
    await createMockTermsAcceptance({
      userId,
      programId,
      version,
      ipAddress: getRequestIp(request),
    });
  } catch {
    destination.searchParams.set("termsError", "server-unavailable");
  }

  return NextResponse.redirect(destination, 303);
}
