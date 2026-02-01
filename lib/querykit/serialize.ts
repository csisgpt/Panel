import { cleanDefaults, type ListParams } from "./schemas";

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
