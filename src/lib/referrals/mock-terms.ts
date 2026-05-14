import "server-only";

import { fetchMockApi } from "@/lib/referrals/mock-api";
import type { MockTermsAcceptanceRecord } from "@/lib/referrals/types";

export async function getLatestMockTermsAcceptance(
  userId: string,
): Promise<MockTermsAcceptanceRecord | null> {
  const acceptances = await fetchMockApi<MockTermsAcceptanceRecord[]>(
    `/termsAcceptances?userId=${encodeURIComponent(userId)}`,
  );

  const [latestAcceptance] = [...acceptances].sort((left, right) =>
    right.acceptedAt.localeCompare(left.acceptedAt),
  );

  return latestAcceptance ?? null;
}

export async function createMockTermsAcceptance(input: {
  userId: string;
  programId: string;
  version: string;
  ipAddress: string;
}): Promise<MockTermsAcceptanceRecord> {
  const existingAcceptances = await fetchMockApi<MockTermsAcceptanceRecord[]>(
    `/termsAcceptances?userId=${encodeURIComponent(input.userId)}&programId=${encodeURIComponent(input.programId)}&version=${encodeURIComponent(input.version)}`,
  );

  const existingAcceptance = existingAcceptances[0];

  if (existingAcceptance) {
    return existingAcceptance;
  }

  return fetchMockApi<MockTermsAcceptanceRecord>("/termsAcceptances", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      userId: input.userId,
      programId: input.programId,
      version: input.version,
      acceptedAt: new Date().toISOString(),
      ipAddress: input.ipAddress,
    }),
  });
}
