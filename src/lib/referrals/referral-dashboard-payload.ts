import {
  mapCommissionState,
  mapReferralTransactionsToUi,
  parseCommissionRecords,
} from "@/lib/referrals/referral-transactions-payload";
import type { ReferralMePayload } from "@/lib/referrals/referral-payload";
import type {
  CommissionState,
  RefereeData,
  StatData,
  TransactionData,
} from "@/lib/referrals/types";

export type ReferralDashboardSummary = {
  refereeCount: number;
  currency: string;
  pendingTotal: number;
  earnedTotal: number;
  paidTotal: number;
  clawedBackTotal: number;
  totalEarned: number;
};

export type ReferralDashboardReferee = {
  referralId: string;
  refereeUserId: string;
  refereeName: string;
  refereeEmail: string;
  status: string;
  attributionSource: string;
  signedUpAt: string | null;
  hasPaid: boolean;
  capturedPaymentCount: number;
  firstPaidAt: string | null;
  totalPaidAmount: number;
  paymentCurrency: string | null;
  hasCommission: boolean;
  pendingTotal: number;
  earnedTotal: number;
  paidTotal: number;
  clawedBackTotal: number;
  totalEarned: number;
  commissions: ReturnType<typeof parseCommissionRecords>;
};

export type ReferralDashboardPayload = {
  programId: string;
  termsVersion: string;
  code: string;
  referralUrl: string | null;
  createdAt: string | null;
  summary: ReferralDashboardSummary;
  referees: ReferralDashboardReferee[];
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

function pickBoolean(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return false;
}

function pickIsoDate(record: Record<string, unknown>, ...keys: string[]): string | null {
  const raw = pickString(record, ...keys);
  return raw || null;
}

function parseAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseSummary(row: Record<string, unknown>): ReferralDashboardSummary {
  return {
    refereeCount: pickNumber(row, "refereeCount", "referee_count") ?? 0,
    currency: (pickString(row, "currency") || "USD").toUpperCase(),
    pendingTotal: parseAmount(row.pendingTotal ?? row.pending_total),
    earnedTotal: parseAmount(row.earnedTotal ?? row.earned_total),
    paidTotal: parseAmount(row.paidTotal ?? row.paid_total),
    clawedBackTotal: parseAmount(row.clawedBackTotal ?? row.clawed_back_total),
    totalEarned: parseAmount(row.totalEarned ?? row.total_earned),
  };
}

function parseRefereeRow(row: Record<string, unknown>): ReferralDashboardReferee | null {
  const referralId = pickString(row, "referralId", "referral_id");
  if (!referralId) {
    return null;
  }

  const referee =
    row.referee && typeof row.referee === "object"
      ? (row.referee as Record<string, unknown>)
      : null;

  const payment =
    row.payment && typeof row.payment === "object"
      ? (row.payment as Record<string, unknown>)
      : null;

  const commission =
    row.commission && typeof row.commission === "object"
      ? (row.commission as Record<string, unknown>)
      : null;

  const rawCommissions = Array.isArray(row.commissions) ? row.commissions : [];

  return {
    referralId,
    refereeUserId: pickString(row, "refereeUserId", "referee_user_id"),
    refereeName: referee ? pickString(referee, "name") : "",
    refereeEmail: referee ? pickString(referee, "email") : "",
    status: pickString(row, "status") || "ACTIVE",
    attributionSource: pickString(row, "attributionSource", "attribution_source") || "LINK",
    signedUpAt: pickIsoDate(row, "signedUpAt", "signed_up_at"),
    hasPaid: payment ? pickBoolean(payment, "hasPaid", "has_paid") : false,
    capturedPaymentCount: payment
      ? (pickNumber(payment, "capturedPaymentCount", "captured_payment_count") ?? 0)
      : 0,
    firstPaidAt: payment
      ? pickIsoDate(payment, "firstPaidAt", "first_paid_at")
      : null,
    totalPaidAmount: payment
      ? parseAmount(payment.totalPaidAmount ?? payment.total_paid_amount)
      : 0,
    paymentCurrency: payment
      ? pickNullableString(payment, "currency")
      : null,
    hasCommission: commission
      ? pickBoolean(commission, "hasCommission", "has_commission")
      : false,
    pendingTotal: commission
      ? parseAmount(commission.pendingTotal ?? commission.pending_total)
      : 0,
    earnedTotal: commission
      ? parseAmount(commission.earnedTotal ?? commission.earned_total)
      : 0,
    paidTotal: commission
      ? parseAmount(commission.paidTotal ?? commission.paid_total)
      : 0,
    clawedBackTotal: commission
      ? parseAmount(commission.clawedBackTotal ?? commission.clawed_back_total)
      : 0,
    totalEarned: commission
      ? parseAmount(commission.totalEarned ?? commission.total_earned)
      : 0,
    commissions: parseCommissionRecords(rawCommissions),
  };
}

export function parseReferralDashboardJson(json: unknown): ReferralDashboardPayload | null {
  if (!json || typeof json !== "object") {
    return null;
  }

  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const programId = pickString(data, "programId", "program_id");
  if (!programId) {
    return null;
  }

  const summaryRow =
    data.summary && typeof data.summary === "object"
      ? (data.summary as Record<string, unknown>)
      : {};

  const referees: ReferralDashboardReferee[] = [];
  const rawReferees = data.referees;
  if (Array.isArray(rawReferees)) {
    for (const entry of rawReferees) {
      if (!entry || typeof entry !== "object") {
        continue;
      }
      const parsed = parseRefereeRow(entry as Record<string, unknown>);
      if (parsed) {
        referees.push(parsed);
      }
    }
  }

  const meta =
    root.meta && typeof root.meta === "object"
      ? (root.meta as Record<string, unknown>)
      : null;

  let code = pickString(data, "code", "referralCode").toUpperCase();
  const referralUrl = pickNullableString(data, "referralUrl", "referral_url");
  if (!code && referralUrl) {
    try {
      code =
        new URL(referralUrl).searchParams.get("ref")?.trim().toUpperCase() ?? "";
    } catch {
      code = "";
    }
  }

  return {
    programId,
    termsVersion: pickString(data, "termsVersion", "terms_version") || "v1",
    code,
    referralUrl,
    createdAt: pickIsoDate(data, "createdAt", "created_at"),
    summary: parseSummary(summaryRow),
    referees,
    nextCursor: meta
      ? pickNullableString(meta, "nextCursor", "next_cursor")
      : null,
  };
}

export function dashboardToMePayload(
  dashboard: ReferralDashboardPayload,
): ReferralMePayload {
  return {
    programId: dashboard.programId,
    termsVersion: dashboard.termsVersion,
    code: dashboard.code,
    referralUrl: dashboard.referralUrl,
    createdAt: dashboard.createdAt ?? undefined,
    programTerms: {
      programId: dashboard.programId,
      version: dashboard.termsVersion,
      title: "Referral program terms",
      summary: "",
      items: [],
      helpEmail: "",
    },
  };
}

function formatMoney(value: number, currency: string): string {
  const code = currency.toUpperCase() || "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

function formatAttributionSource(source: string): string {
  switch (source.trim().toUpperCase()) {
    case "LINK":
      return "Referral link";
    case "CODE":
      return "Referral code";
    case "BOTH":
      return "Link and code";
    default:
      return source.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function refereeCommissionState(referee: ReferralDashboardReferee): CommissionState {
  if (referee.clawedBackTotal > 0 && referee.pendingTotal === 0 && referee.earnedTotal === 0) {
    return referee.paidTotal > 0 ? "clawedBack" : "clawedBack";
  }
  if (referee.paidTotal > 0 && referee.pendingTotal === 0 && referee.earnedTotal === 0) {
    return "paid";
  }
  if (referee.earnedTotal > 0 && referee.pendingTotal === 0) {
    return "earned";
  }
  if (referee.pendingTotal > 0) {
    return "pending";
  }
  if (!referee.hasCommission) {
    return "pending";
  }
  return "pending";
}

function refereeCommissionAmount(referee: ReferralDashboardReferee): number {
  return referee.pendingTotal + referee.earnedTotal + referee.paidTotal;
}

function refereeNextEvent(referee: ReferralDashboardReferee): string {
  const pending = referee.commissions.find(
    (c) => mapCommissionState(c) === "pending" && c.payableAt,
  );
  if (pending?.payableAt) {
    return `Payable ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(pending.payableAt))}`;
  }
  if (referee.hasPaid && referee.firstPaidAt) {
    return `First paid ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(referee.firstPaidAt))}`;
  }
  return "—";
}

export function mapRefereesToUi(referees: ReferralDashboardReferee[]): RefereeData[] {
  return referees.map((referee) => ({
    id: referee.referralId,
    name: referee.refereeName || referee.refereeEmail || "Referee",
    company: referee.refereeEmail || "—",
    source: formatAttributionSource(referee.attributionSource),
    joinedAt: referee.signedUpAt ?? new Date().toISOString(),
    referralStatus: referee.status.replaceAll("_", " "),
    commissionState: refereeCommissionState(referee),
    plan: referee.hasPaid ? "Paid customer" : "Signed up",
    netRevenue: referee.totalPaidAmount,
    commission: refereeCommissionAmount(referee),
    nextEvent: refereeNextEvent(referee),
    transactions: mapReferralTransactionsToUi(referee.commissions).sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    ),
  }));
}

export function buildStatsFromSummary(
  summary: ReferralDashboardSummary,
  referees: ReferralDashboardReferee[],
): StatData[] {
  const paidCount = referees.filter((referee) => referee.hasPaid).length;
  const currency = summary.currency;

  const refereeCount = summary.refereeCount;

  return [
    {
      id: "clicks",
      label: "Link clicks",
      value: "—",
      change: "Tracking coming soon",
      helper: "Visits from your shared referral link",
      statusTone: "unavailable",
    },
    {
      id: "signups",
      label: "Referrals",
      value: String(refereeCount),
      change:
        refereeCount === 0
          ? "No referrals yet"
          : refereeCount === 1
            ? "1 active referral"
            : `${refereeCount} active referrals`,
      helper: "Accounts that signed up with your link or code",
      statusTone: refereeCount > 0 ? "positive" : "muted",
    },
    {
      id: "paidConversions",
      label: "Conversions",
      value: String(paidCount),
      change:
        paidCount === 0
          ? "No paid referrals yet"
          : paidCount === 1
            ? "1 paid referral"
            : `${paidCount} paid referrals`,
      helper: "Referrals with at least one qualifying payment",
      statusTone: paidCount > 0 ? "positive" : "muted",
    },
    {
      id: "totalEarned",
      label: "Earnings",
      value: formatMoney(summary.totalEarned, currency),
      change:
        summary.pendingTotal > 0
          ? `${formatMoney(summary.pendingTotal, currency)} on hold`
          : summary.totalEarned > 0
            ? "Earned to date"
            : "No earnings yet",
      helper: "Commissions earned, net of clawbacks",
      statusTone:
        summary.pendingTotal > 0
          ? "neutral"
          : summary.totalEarned > 0
            ? "positive"
            : "muted",
    },
  ];
}

export function flattenCommissionTransactions(
  referees: ReferralDashboardReferee[],
): TransactionData[] {
  const records = referees.flatMap((referee) => referee.commissions);
  return mapReferralTransactionsToUi(records).sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}
