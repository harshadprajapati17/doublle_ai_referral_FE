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

export function formatSignedCurrency(value: number) {
  return `${value >= 0 ? "+" : "-"}${currencyFormatter.format(Math.abs(value))}`;
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
