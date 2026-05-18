import type { CommissionState, TransactionData } from "@/lib/referrals/types";

export type ReferralTransactionRecord = {
  id: string;
  referralId: string;
  refereeUserId: string;
  state: string;
  commissionAmount: number;
  grossAmount: number | null;
  netAmount: number | null;
  rewardPct: string | null;
  currency: string | null;
  sourcePaymentId: string | null;
  sourceInvoiceId: string | null;
  reversesCommissionId: string | null;
  accruedAt: string | null;
  payableAt: string | null;
  paidAt: string | null;
  clawbackReason: string | null;
  createdAt: string | null;
};

export type ReferralTransactionsPayload = {
  transactions: ReferralTransactionRecord[];
  nextCursor: string | null;
};

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNullableString(
  record: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null) {
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || null;
    }
  }
  return null;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return null;
}

function pickIsoDate(record: Record<string, unknown>, ...keys: string[]): string | null {
  const raw = pickString(record, ...keys);
  return raw || null;
}

export function commissionRecordFromRow(
  row: Record<string, unknown>,
): ReferralTransactionRecord | null {
  const id = pickString(row, "id");
  if (!id) {
    return null;
  }

  const commissionAmount = pickNumber(row, "commissionAmount", "commission_amount");
  if (commissionAmount === null) {
    return null;
  }

  return {
    id,
    referralId: pickString(row, "referralId", "referral_id"),
    refereeUserId: pickString(row, "refereeUserId", "referee_user_id"),
    state: pickString(row, "state") || "PENDING",
    commissionAmount,
    grossAmount: pickNumber(row, "grossAmount", "gross_amount"),
    netAmount: pickNumber(row, "netAmount", "net_amount"),
    rewardPct: pickNullableString(row, "rewardPct", "reward_pct"),
    currency: pickNullableString(row, "currency"),
    sourcePaymentId: pickNullableString(row, "sourcePaymentId", "source_payment_id"),
    sourceInvoiceId: pickNullableString(row, "sourceInvoiceId", "source_invoice_id"),
    reversesCommissionId: pickNullableString(
      row,
      "reversesCommissionId",
      "reverses_commission_id",
    ),
    accruedAt: pickIsoDate(row, "accruedAt", "accrued_at"),
    payableAt: pickIsoDate(row, "payableAt", "payable_at"),
    paidAt: pickIsoDate(row, "paidAt", "paid_at"),
    clawbackReason: pickNullableString(row, "clawbackReason", "clawback_reason"),
    createdAt: pickIsoDate(row, "createdAt", "created_at"),
  };
}

export function parseReferralTransactionsJson(json: unknown): ReferralTransactionsPayload {
  if (!json || typeof json !== "object") {
    return { transactions: [], nextCursor: null };
  }

  const root = json as Record<string, unknown>;
  const data = root.data;
  const meta =
    root.meta && typeof root.meta === "object"
      ? (root.meta as Record<string, unknown>)
      : null;

  const rows: unknown[] = Array.isArray(data) ? data : [];
  const transactions: ReferralTransactionRecord[] = [];

  for (const entry of rows) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const parsed = commissionRecordFromRow(entry as Record<string, unknown>);
    if (parsed) {
      transactions.push(parsed);
    }
  }

  const nextCursor = meta
    ? pickNullableString(meta, "nextCursor", "next_cursor")
    : null;

  return { transactions, nextCursor };
}

export function mapCommissionState(record: ReferralTransactionRecord): CommissionState {
  if (record.clawbackReason || record.reversesCommissionId) {
    return "clawedBack";
  }

  switch (record.state.trim().toUpperCase()) {
    case "EARNED":
      return "earned";
    case "APPLIED":
    case "PAID":
      return "paid";
    case "CLAWED_BACK":
    case "CLAWEDBACK":
      return "clawedBack";
    case "PENDING":
    default:
      return "pending";
  }
}

function formatMoneyAmount(amount: number, currency: string | null): string {
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code}`;
  }
}

function buildTransactionDetail(record: ReferralTransactionRecord): string {
  const parts: string[] = [];

  if (record.netAmount !== null) {
    parts.push(`Net ${formatMoneyAmount(record.netAmount, record.currency)}`);
  } else if (record.grossAmount !== null) {
    parts.push(`Gross ${formatMoneyAmount(record.grossAmount, record.currency)}`);
  }

  if (record.rewardPct) {
    parts.push(`${record.rewardPct}% reward`);
  }

  if (record.sourceInvoiceId) {
    parts.push(`Invoice ${record.sourceInvoiceId}`);
  }

  if (record.payableAt && mapCommissionState(record) === "pending") {
    parts.push(`Payable ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(record.payableAt))}`);
  }

  if (record.paidAt) {
    parts.push(`Paid ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(record.paidAt))}`);
  }

  if (record.clawbackReason) {
    parts.push(record.clawbackReason);
  }

  return parts.length > 0 ? parts.join(" · ") : "Referral commission event";
}

function buildTransactionTitle(record: ReferralTransactionRecord): string {
  if (record.rewardPct) {
    return `Commission (${record.rewardPct}%)`;
  }
  return "Referral commission";
}

export function mapReferralTransactionToUi(record: ReferralTransactionRecord): TransactionData {
  const isClawback = Boolean(record.clawbackReason || record.reversesCommissionId);
  const amount = isClawback ? -Math.abs(record.commissionAmount) : record.commissionAmount;

  return {
    id: record.id,
    title: buildTransactionTitle(record),
    detail: buildTransactionDetail(record),
    occurredAt: record.accruedAt ?? record.createdAt ?? new Date().toISOString(),
    amount,
    state: mapCommissionState(record),
    currency: record.currency,
    grossAmount: record.grossAmount,
    netAmount: record.netAmount,
    rewardPct: record.rewardPct,
    payableAt: record.payableAt,
    paidAt: record.paidAt,
    sourceInvoiceId: record.sourceInvoiceId,
  };
}

export function mapReferralTransactionsToUi(
  records: ReferralTransactionRecord[],
): TransactionData[] {
  return records.map(mapReferralTransactionToUi);
}

export function parseCommissionRecords(rows: unknown[]): ReferralTransactionRecord[] {
  const records: ReferralTransactionRecord[] = [];
  for (const entry of rows) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const parsed = commissionRecordFromRow(entry as Record<string, unknown>);
    if (parsed) {
      records.push(parsed);
    }
  }
  return records;
}
