import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format/date";
import { formatMoney, formatNumber } from "@/lib/format/money";

export const rtlCell = "text-right";
export const ltrCell = "text-left";

/**
 * Safely reads a nested value from an object using dot notation.
 */
export function nestedAccessor<T>(path: string, fallback: unknown = "-") {
  return (row: T) => {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, row as unknown);
    return value ?? fallback;
  };
}

/**
 * Column helper for money values.
 */
export function moneyColumn<T>(
  accessorKey: keyof T | string,
  header: string,
  currency = "IRR"
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    meta: { cellClassName: rtlCell },
    size: 140,
    cell: ({ getValue }) => formatMoney(getValue() as number | string, currency),
  };
}

/**
 * Column helper for numeric values.
 */
export function numberColumn<T>(accessorKey: keyof T | string, header: string): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    meta: { cellClassName: rtlCell },
    size: 120,
    cell: ({ getValue }) => formatNumber(getValue() as number | string),
  };
}

/**
 * Column helper for date values.
 */
export function dateColumn<T>(accessorKey: keyof T | string, header: string): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    meta: { cellClassName: rtlCell },
    size: 160,
    cell: ({ getValue }) => formatDate(getValue() as string),
  };
}
