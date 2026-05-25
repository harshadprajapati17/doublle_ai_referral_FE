export function formatBillingPrice(
  amount: number | null,
  currency: string | null,
): string {
  if (amount === null) {
    return "—";
  }
  const code = currency?.trim().toUpperCase();
  if (!code) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(amount);
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

export function formatFrequencyLabel(frequency: string | null): string {
  if (!frequency) {
    return "—";
  }
  return frequency
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBillingDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

export function billingStatusTone(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "trialing") {
    return "border-emerald-200/90 bg-emerald-50 text-emerald-800";
  }
  if (
    normalized === "past_due" ||
    normalized === "past-due" ||
    normalized === "unpaid"
  ) {
    return "border-amber-200/90 bg-amber-50 text-amber-800";
  }
  if (normalized === "canceled" || normalized === "cancelled") {
    return "border-ws-border bg-ws-page text-ws-secondary";
  }
  return "border-sky-200/90 bg-sky-50 text-sky-800";
}

export function formatBillingStatusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function daysUntilDate(iso: string | null): number | null {
  if (!iso) {
    return null;
  }
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) {
    return null;
  }
  const diffMs = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
