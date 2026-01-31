import type { ListParams } from "./schemas";

export function serializeListParams(params: Partial<ListParams>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query.length ? `?${query}` : "";
}
