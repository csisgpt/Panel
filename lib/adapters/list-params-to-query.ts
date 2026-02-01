import type { ListParams } from "@/lib/querykit/schemas";

export interface ListQueryMapOptions {
  searchKey?: string;
  filterKeyMap?: Record<string, string>;
  offsetBased?: boolean;
}

export function listParamsToQuery<TFilters>(
  params: ListParams<TFilters>,
  options: ListQueryMapOptions = {}
): URLSearchParams {
  const searchParams = new URLSearchParams();
  const searchKey = options.searchKey ?? "search";
  if (params.search) searchParams.set(searchKey, params.search);

  if (params.sort?.key) {
    searchParams.set("sortKey", params.sort.key);
    searchParams.set("sortDir", params.sort.dir);
  }

  if (options.offsetBased) {
    const offset = (params.page - 1) * params.limit;
    searchParams.set("limit", String(params.limit));
    searchParams.set("offset", String(offset));
  } else {
    searchParams.set("page", String(params.page));
    searchParams.set("limit", String(params.limit));
  }

  const filters = params.filters as Record<string, unknown> | undefined;
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      const mappedKey = options.filterKeyMap?.[key] ?? key;
      searchParams.set(mappedKey, String(value));
    });
  }

  if (params.tab) {
    searchParams.set("tab", params.tab);
  }

  return searchParams;
}
