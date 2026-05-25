import type { ProgramTermsData } from "@/lib/referrals/types";

export type ReferralMePayload = {
  programId: string;
  termsVersion: string;
  code: string;
  referralUrl: string | null;
  createdAt?: string;
  programName?: string;
  heroTitle?: string;
  heroDescription?: string;
  rewardSummary?: string;
  rewardDuration?: string;
  payoutType?: string;
  cookieWindowDays?: number;
  programTerms: ProgramTermsData;
};

export type ReferralProgramPayload = {
  programId: string;
  termsVersion: string;
  programName: string;
  rewardSummary: string;
  rewardDuration: string;
  payoutType: string;
  cookieWindowDays: number;
  programTerms: ProgramTermsData;
};

function pickString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
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
  return undefined;
}

function unwrapData(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") {
    return null;
  }
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  return data;
}

function attributionLabel(rule: string): string {
  switch (rule) {
    case "FIRST_TOUCH_CODE_OVERRIDE":
      return "A first-party referral cookie applies, but manual code entry at signup overrides it.";
    case "LAST_TOUCH":
      return "The most recent referral touch before signup receives attribution.";
    case "FIRST_TOUCH":
      return "The first referral touch within the cookie window receives attribution.";
    default:
      return rule
        ? `Attribution follows the ${rule.replaceAll("_", " ").toLowerCase()} rule.`
        : "Attribution rules are defined in the active program configuration.";
  }
}

function buildProgramTermsItems(row: Record<string, unknown>): string[] {
  const pct = pickString(row, "referrerRewardPct", "referrer_reward_pct") || "0";
  const months =
    pickNumber(row, "referrerRewardDurationMonths", "referrer_reward_duration_months") ?? 12;
  const holdDays = pickNumber(row, "holdPeriodDays", "hold_period_days") ?? 30;
  const rule = pickString(row, "attributionRule", "attribution_rule");

  const items: string[] = [
    `You earn ${pct}% of referred net revenue for up to ${months} months.`,
    attributionLabel(rule),
    `Commissions move from Pending to Earned after a ${holdDays}-day hold, then apply as Doublle account credit.`,
    "Refunds, chargebacks, and disputes can reverse pending or paid commissions.",
  ];

  const monthlyCap = pickNumber(row, "monthlyCap", "monthly_cap");
  const lifetimeCap = pickNumber(row, "lifetimeCap", "lifetime_cap");
  if (monthlyCap != null) {
    items.push(`Monthly earnings are capped at ${monthlyCap} ${pickString(row, "currency") || "USD"}.`);
  }
  if (lifetimeCap != null) {
    items.push(`Lifetime earnings are capped at ${lifetimeCap} ${pickString(row, "currency") || "USD"}.`);
  }

  const benefit = row.refereeBenefit;
  if (benefit && typeof benefit === "object") {
    const b = benefit as Record<string, unknown>;
    const type = pickString(b, "type");
    if (type && type !== "NONE") {
      const trialDays = pickNumber(b, "trialDays", "trial_days");
      if (trialDays != null) {
        items.push(`Referees may receive a ${trialDays}-day trial extension through this program.`);
      } else {
        items.push("Referees may receive a program benefit when they sign up through your link.");
      }
    }
  }

  return items;
}

export function parseReferralProgramJson(json: unknown): ReferralProgramPayload | null {
  const row = unwrapData(json);
  if (!row) {
    return null;
  }

  const programId = pickString(row, "id", "programId", "program_id");
  if (!programId) {
    return null;
  }

  const version =
    pickString(row, "termsVersion", "terms_version") ||
    (() => {
      const current = pickNumber(row, "currentVersion", "current_version");
      return current != null ? String(current) : "v1";
    })();

  const name = pickString(row, "name", "programName") || "Referral program";
  const pct = pickString(row, "referrerRewardPct", "referrer_reward_pct") || "0";
  const months =
    pickNumber(row, "referrerRewardDurationMonths", "referrer_reward_duration_months") ?? 12;
  const cookieDays = pickNumber(row, "cookieDays", "cookie_days") ?? 30;

  const programTerms: ProgramTermsData = {
    programId,
    version,
    title: `${name} terms`,
    summary: `Active program: ${name}. Rewards are paid as Doublle account credit on eligible referred net revenue.`,
    items: buildProgramTermsItems(row),
    helpEmail: pickString(row, "helpEmail", "supportEmail"),
  };

  return {
    programId,
    termsVersion: version,
    programName: name,
    rewardSummary: `${pct}% of referred net revenue`,
    rewardDuration: `${months} months`,
    payoutType: "Doublle account credit",
    cookieWindowDays: cookieDays,
    programTerms,
  };
}

function parseProgramTermsPayload(
  data: Record<string, unknown>,
  programId: string,
  termsVersion: string,
): ProgramTermsData {
  const nested = data.programTerms;
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    const id = pickString(o, "programId") || programId;
    const version = pickString(o, "version") || termsVersion;
    const title = pickString(o, "title") || "Referral program terms";
    const summary = pickString(o, "summary");
    const helpEmail = pickString(o, "helpEmail");
    let items: string[] = [];
    const rawItems = o.items;
    if (Array.isArray(rawItems)) {
      items = rawItems.filter((x): x is string => typeof x === "string" && Boolean(x.trim()));
    }
    return { programId: id, version, title, summary, items, helpEmail };
  }

  const title = pickString(data, "termsTitle", "programTermsTitle") || "Referral program terms";
  const summary = pickString(data, "termsSummary", "programTermsSummary");
  let items: string[] = [];
  const rawItems = data.termsItems ?? data.programTermsItems;
  if (Array.isArray(rawItems)) {
    items = rawItems.filter((x): x is string => typeof x === "string" && Boolean(x.trim()));
  }

  return {
    programId,
    version: termsVersion,
    title,
    summary,
    items,
    helpEmail: pickString(data, "supportEmail", "helpEmail"),
  };
}

function parseMeRow(row: Record<string, unknown>): ReferralMePayload | null {
  const programId = pickString(row, "programId", "program_id", "id");
  if (!programId) {
    return null;
  }

  const termsVersion = pickString(row, "termsVersion", "terms_version") || "v1";
  const referralUrl = pickString(row, "referralUrl", "referral_url");

  let code = pickString(row, "code", "referralCode").toUpperCase();
  if (!code && referralUrl) {
    try {
      code =
        new URL(referralUrl).searchParams.get("ref")?.trim().toUpperCase() ?? "";
    } catch {
      /* ignore */
    }
  }

  return {
    programId,
    termsVersion,
    code,
    referralUrl: referralUrl || null,
    createdAt: pickString(row, "createdAt", "acceptedAt", "enrolledAt") || undefined,
    programName: pickString(row, "programName"),
    heroTitle: pickString(row, "heroTitle"),
    heroDescription: pickString(row, "heroDescription", "description"),
    rewardSummary: pickString(row, "rewardSummary"),
    rewardDuration: pickString(row, "rewardDuration"),
    payoutType: pickString(row, "payoutType"),
    cookieWindowDays:
      typeof row.cookieWindowDays === "number" && Number.isFinite(row.cookieWindowDays)
        ? row.cookieWindowDays
        : undefined,
    programTerms: parseProgramTermsPayload(row, programId, termsVersion),
  };
}

export function parseReferralMeJson(json: unknown): ReferralMePayload | null {
  const data = unwrapData(json);
  if (!data) {
    return null;
  }

  let parsed = parseMeRow(data);
  if (!parsed) {
    for (const key of ["referral", "enrollment"]) {
      const inner = data[key];
      if (inner && typeof inner === "object") {
        parsed = parseMeRow(inner as Record<string, unknown>);
        if (parsed) break;
      }
    }
  }

  return parsed;
}

export function isPendingEnrollmentNotFound(status: number, body: string): boolean {
  if (status !== 404) {
    return false;
  }
  try {
    const json = JSON.parse(body) as {
      error?: { code?: string; message?: string };
    };
    const code = json.error?.code?.trim();
    if (code === "NOT_FOUND") {
      return true;
    }
    const message = json.error?.message?.toLowerCase() ?? "";
    return message.includes("accept") && message.includes("terms");
  } catch {
    return true;
  }
}

export function mergeMeWithProgram(
  me: ReferralMePayload,
  program: ReferralProgramPayload,
): ReferralMePayload {
  return {
    programId: program.programId,
    termsVersion: program.termsVersion,
    code: me.code,
    referralUrl: me.referralUrl,
    createdAt: me.createdAt,
    programName: me.programName || program.programName,
    heroTitle: me.heroTitle || "Share your personal referral link",
    heroDescription:
      me.heroDescription ||
      "Invite new teams to Doublle and earn recurring account credit when they become paying customers.",
    rewardSummary: me.rewardSummary || program.rewardSummary,
    rewardDuration: me.rewardDuration || program.rewardDuration,
    payoutType: me.payoutType || program.payoutType,
    cookieWindowDays: me.cookieWindowDays ?? program.cookieWindowDays,
    programTerms: program.programTerms,
  };
}

export function pendingEnrollmentFromProgram(
  program: ReferralProgramPayload,
): ReferralMePayload {
  return {
    programId: program.programId,
    termsVersion: program.termsVersion,
    code: "",
    referralUrl: null,
    programName: program.programName,
    heroTitle: "Share your personal referral link",
    heroDescription:
      "Invite new teams to Doublle and earn recurring account credit when they become paying customers.",
    rewardSummary: program.rewardSummary,
    rewardDuration: program.rewardDuration,
    payoutType: program.payoutType,
    cookieWindowDays: program.cookieWindowDays,
    programTerms: program.programTerms,
  };
}

/** POST /api/v1/referral/terms/accept — enrollment created; link is built client-side. */
export type ReferralTermsAcceptPayload = {
  programId: string;
  termsVersion: string;
  code: string;
  acceptedAt: string;
  createdAt?: string;
  idempotent?: boolean;
};

export function parseReferralTermsAcceptJson(
  json: unknown,
): ReferralTermsAcceptPayload | null {
  const data = unwrapData(json);
  if (!data) {
    return null;
  }

  const programId = pickString(data, "programId", "program_id");
  const code = pickString(data, "code", "referralCode").toUpperCase();
  if (!programId || !code) {
    return null;
  }

  const acceptedAt =
    pickString(data, "acceptedAt", "accepted_at") || new Date().toISOString();

  return {
    programId,
    termsVersion: pickString(data, "termsVersion", "terms_version") || "v1",
    code,
    acceptedAt,
    createdAt: pickString(data, "createdAt", "created_at") || undefined,
    idempotent: data.idempotent === true,
  };
}

export type ReferralMeFetchResult =
  | { kind: "ok"; payload: ReferralMePayload }
  | { kind: "pending" }
  | { kind: "error"; status?: number };

export function composeReferralEnrollment(
  program: ReferralProgramPayload,
  me: ReferralMeFetchResult,
): ReferralMePayload | null {
  if (me.kind === "ok") {
    return mergeMeWithProgram(me.payload, program);
  }
  if (me.kind === "pending") {
    return pendingEnrollmentFromProgram(program);
  }
  return null;
}
