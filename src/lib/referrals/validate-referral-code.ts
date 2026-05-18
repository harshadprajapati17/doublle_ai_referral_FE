export type RefereeBenefit = {
  type: string;
  value: string | null;
  currency: string | null;
  trialDays: number | null;
};

export type ReferralCodeValidatePayload = {
  valid: boolean;
  programId?: string;
  code?: string;
  refereeBenefit?: RefereeBenefit | null;
};

export type ValidateReferralCodeResult =
  | {
      kind: "valid";
      code: string;
      programId: string;
      refereeBenefit: RefereeBenefit | null;
      benefitLabel: string | null;
    }
  | { kind: "invalid"; code: string }
  | { kind: "error" };

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

function pickNullableNumber(
  record: Record<string, unknown>,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null) {
      return null;
    }
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

export function parseRefereeBenefit(value: unknown): RefereeBenefit | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  const type = pickString(row, "type");
  if (!type) {
    return null;
  }
  return {
    type,
    value: pickNullableString(row, "value"),
    currency: pickNullableString(row, "currency"),
    trialDays: pickNullableNumber(row, "trialDays", "trial_days"),
  };
}

export function parseReferralCodeValidateJson(json: unknown): ReferralCodeValidatePayload | null {
  if (!json || typeof json !== "object") {
    return null;
  }
  const root = json as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  if (typeof data.valid !== "boolean") {
    return null;
  }

  if (!data.valid) {
    return { valid: false };
  }

  const programId = pickString(data, "programId", "program_id");
  const code = pickString(data, "code");
  if (!programId || !code) {
    return null;
  }

  return {
    valid: true,
    programId,
    code,
    refereeBenefit: parseRefereeBenefit(data.refereeBenefit ?? data.referee_benefit),
  };
}

export function formatRefereeBenefitLabel(benefit: RefereeBenefit | null): string | null {
  if (!benefit) {
    return null;
  }

  const type = benefit.type.toUpperCase();
  if (type === "CREDIT" && benefit.value) {
    const amount = Number(benefit.value);
    if (Number.isFinite(amount)) {
      return `${amount} credits`;
    }
    return `${benefit.value} credits`;
  }

  if (benefit.trialDays && benefit.trialDays > 0) {
    const days = benefit.trialDays;
    return `${days}-day extended trial`;
  }

  if (type.includes("TRIAL") && benefit.value) {
    const days = Number(benefit.value);
    if (Number.isFinite(days) && days > 0) {
      return `${days}-day extended trial`;
    }
  }

  return null;
}

export function toValidateReferralCodeResult(
  code: string,
  payload: ReferralCodeValidatePayload | null,
): ValidateReferralCodeResult {
  const normalized = code.trim().toUpperCase();
  if (!payload) {
    return { kind: "error" };
  }
  if (!payload.valid) {
    return { kind: "invalid", code: normalized };
  }
  if (!payload.programId || !payload.code) {
    return { kind: "error" };
  }

  const refereeBenefit = payload.refereeBenefit ?? null;
  return {
    kind: "valid",
    code: payload.code.trim().toUpperCase(),
    programId: payload.programId,
    refereeBenefit,
    benefitLabel: formatRefereeBenefitLabel(refereeBenefit),
  };
}
