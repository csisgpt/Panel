export function parseMoneyInput(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const raw = String(value).replace(/,/g, "").trim();
  if (!raw) return 0;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatMoneyDisplay(value: string | number | null | undefined) {
  const num = parseMoneyInput(value);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
}
