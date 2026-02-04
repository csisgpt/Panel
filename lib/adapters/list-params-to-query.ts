import type { ListParams } from "@/lib/querykit/schemas";
import { serializeQueryValue } from "@/lib/querykit/serialize";

export interface ListQueryMapOptions {
  searchKey?: string;
  filterKeyMap?: Record<string, string>;
  offsetBased?: boolean;
  sortParam?: string;
  sortMap?: Record<string, string | { asc?: string; desc?: string }>;
  allowOffsetParam?: boolean;
  includeTab?: boolean;
  enableSearch?: boolean;
  filterAllowList?: string[];
  filterDenyList?: string[];
  dropUnknownFilters?: boolean;
}

export function listParamsToQuery<TFilters>(
  params: ListParams<TFilters>,
  options: ListQueryMapOptions = {}
): URLSearchParams {
  const searchParams = new URLSearchParams();
  const searchKey = options.searchKey ?? "search";
  const enableSearch = options.enableSearch ?? true;
  if (enableSearch && params.search) searchParams.set(searchKey, params.search);

  if (params.sort?.key) {
    const sortParam = options.sortParam ?? "sort";
    const mapping = options.sortMap?.[params.sort.key];
    if (typeof mapping === "string") {
      searchParams.set(sortParam, mapping);
    } else if (mapping) {
      const mapped = params.sort.dir === "asc" ? mapping.asc : mapping.desc;
      if (mapped) searchParams.set(sortParam, mapped);
    } else {
      searchParams.set(sortParam, `${params.sort.key}_${params.sort.dir}`);
    }
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
      if (key === "offset" && options.allowOffsetParam) {
        searchParams.set("offset", String(value));
        return;
      }
      const hasMappedKey = options.filterKeyMap ? key in options.filterKeyMap : false;
      if (options.filterKeyMap && !hasMappedKey && (options.dropUnknownFilters ?? true)) return;
      const mappedKey = (options.filterKeyMap && hasMappedKey ? options.filterKeyMap[key] : key) ?? key;
      if (options.filterAllowList && !options.filterAllowList.includes(mappedKey)) return;
      if (options.filterDenyList && options.filterDenyList.includes(mappedKey)) return;
      const serialized = serializeQueryValue(value);
      if (serialized !== undefined) {
        searchParams.set(mappedKey, serialized);
      }
    });
  }

  // if (options.includeTab && params.tab) {
  //   searchParams.set("tab", params.tab);
  // }

  return searchParams;
}
