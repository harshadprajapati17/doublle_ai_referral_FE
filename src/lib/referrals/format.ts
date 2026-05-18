const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatSignedCurrency(value: number, currency = "USD") {
  const code = currency.trim().toUpperCase() || "USD";
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    });
    return `${value >= 0 ? "+" : "-"}${formatter.format(Math.abs(value))}`;
  } catch {
    return `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(2)} ${code}`;
  }
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
