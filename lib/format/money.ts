const latinNumberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function normalizeNumeric(value: number | string | bigint): number | bigint | null {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const sanitized = value.replace(/,/g, "").trim();
  if (!sanitized) return null;
  if (/^-?\d+$/.test(sanitized)) {
    try {
      return BigInt(sanitized);
    } catch {
      return Number(sanitized);
    }
  }
  const asNumber = Number(sanitized);
  return Number.isFinite(asNumber) ? asNumber : null;
}

export function formatNumber(n: number | string | bigint): string {
  const normalized = normalizeNumeric(n);
  if (normalized === null) return "-";
  return latinNumberFormatter.format(normalized as number | bigint);
}

export function formatMoneyIRR(amount: number | string | bigint, unit: "rial" | "toman" = "rial"): string {
  const normalized = normalizeNumeric(amount);
  if (normalized === null) return "-";

  const value = unit === "toman"
    ? typeof normalized === "bigint"
      ? normalized / BigInt(10)
      : normalized / 10
    : normalized;

  return formatNumber(value);
}

export function formatMoney(amount: number | string | bigint, currency = "IRR") {
  const normalized = normalizeNumeric(amount);
  if (normalized === null) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(normalized));
}

export function formatMoneyCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "-";
  return compactFormatter.format(amount);
}
