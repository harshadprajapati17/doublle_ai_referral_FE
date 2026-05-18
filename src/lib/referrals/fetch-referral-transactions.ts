import "server-only";

import {
  mapReferralTransactionsToUi,
  parseReferralTransactionsJson,
} from "@/lib/referrals/referral-transactions-payload";
import { getAuthApiBase, referralApiHeaders } from "@/lib/referrals/auth-api";
import type { TransactionData } from "@/lib/referrals/types";

export type ReferralTransactionsFetchResult = {
  transactions: TransactionData[];
  status: number;
};

/** GET {AUTH_API_BASE_URL}/api/v1/referral/me/transactions */
export async function fetchReferralTransactions(): Promise<ReferralTransactionsFetchResult> {
  const base = getAuthApiBase();
  const headers = await referralApiHeaders();
  if (!base || !headers) {
    return { transactions: [], status: 0 };
  }

  const url = `${base}/api/v1/referral/me/transactions`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[fetchReferralTransactions] fetch threw", { url, error });
    return { transactions: [], status: 0 };
  }

  if (!response.ok) {
    console.error(
      "[fetchReferralTransactions] non-OK",
      response.status,
      await response.text(),
    );
    return { transactions: [], status: response.status };
  }

  try {
    const payload = parseReferralTransactionsJson(await response.json());
    return {
      transactions: mapReferralTransactionsToUi(payload.transactions),
      status: response.status,
    };
  } catch {
    return { transactions: [], status: response.status };
  }
}
