import "server-only";

import { getAuthApiBase } from "@/lib/referrals/auth-api";
import type { SignupPlan } from "@/lib/referrals/types";

function parseSignupPlansJson(json: unknown): SignupPlan[] {
  let root = json;
  if (root && typeof root === "object" && "data" in root) {
    const data = (root as { data: unknown }).data;
    if (data !== undefined) {
      root = data;
    }
  }

  let arr: unknown[] = [];
  if (Array.isArray(root)) {
    arr = root;
  } else if (
    root &&
    typeof root === "object" &&
    "plans" in root &&
    Array.isArray((root as { plans: unknown }).plans)
  ) {
    arr = (root as { plans: unknown[] }).plans;
  } else if (
    root &&
    typeof root === "object" &&
    "results" in root &&
    Array.isArray((root as { results: unknown }).results)
  ) {
    arr = (root as { results: unknown[] }).results;
  }

  const plans: SignupPlan[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!id || !name) {
      continue;
    }
    const description =
      typeof row.description === "string" ? row.description.trim() : "";

    let labelMonthlyRevenue = 0;
    const lm =
      typeof row.labelMonthlyRevenue === "number"
        ? row.labelMonthlyRevenue
        : typeof row.monthlyPrice === "number"
          ? row.monthlyPrice
          : typeof row.priceMonthly === "number"
            ? row.priceMonthly
            : null;
    if (lm !== null && Number.isFinite(lm)) {
      labelMonthlyRevenue = lm;
    }

    const badge =
      typeof row.badge === "string" && row.badge.trim() ? row.badge.trim() : undefined;

    plans.push({
      id,
      name,
      description,
      labelMonthlyRevenue,
      ...(badge !== undefined ? { badge } : {}),
    });
  }

  return plans;
}

/** GET `{AUTH_API_BASE_URL}/api/v1/signup/plans` — unauthenticated catalog for signup UI. */
export async function fetchSignupPlans(): Promise<SignupPlan[]> {
  const base = getAuthApiBase();
  if (!base) {
    return [];
  }

  const candidates = [`${base}/api/v1/signup/plans`, `${base}/api/v1/catalog/plans`];

  for (const url of candidates) {
    let response: Response;
    try {
      response = await fetch(url, {
        cache: "no-store",
      });
    } catch {
      continue;
    }

    if (!response.ok) {
      continue;
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      continue;
    }

    const plans = parseSignupPlansJson(json);
    if (plans.length > 0) {
      return plans;
    }
  }

  return [];
}
