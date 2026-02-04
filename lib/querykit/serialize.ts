import { cleanDefaults, type ListParams } from "./schemas";

type BooleanFormat = "string" | "numeric";

export function serializeBoolean(value: boolean, format: BooleanFormat = "string") {
  if (format === "numeric") return value ? "1" : "0";
  return value ? "true" : "false";
}

export function serializeQueryValue(value: unknown, format: BooleanFormat = "string") {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return serializeBoolean(value, format);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    const entries = value
      .map((entry) => serializeQueryValue(entry, format))
      .filter((entry): entry is string => Boolean(entry));
    return entries.length ? entries.join(",") : undefined;
  }
  return String(value);
}

export function serializeListParams<TFilters>(params: Partial<ListParams<TFilters>>): string {
  const searchParams = new URLSearchParams();
  const cleaned = cleanDefaults(params);
  if (cleaned.page !== undefined) searchParams.set("page", String(cleaned.page));
  if (cleaned.limit !== undefined) searchParams.set("limit", String(cleaned.limit));
  if (cleaned.search) searchParams.set("search", cleaned.search);
  if (cleaned.sort) {
    searchParams.set("sortKey", cleaned.sort.key);
    searchParams.set("sortDir", cleaned.sort.dir);
  }
  if (cleaned.filters && Object.keys(cleaned.filters).length) {
    searchParams.set("filters", JSON.stringify(cleaned.filters));
  }
  if (cleaned.tab) searchParams.set("tab", cleaned.tab);
  const query = searchParams.toString();
  return query.length ? `?${query}` : "";
}
