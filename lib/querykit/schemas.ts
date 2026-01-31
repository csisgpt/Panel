export type SortDir = "asc" | "desc";

export interface SortParam {
  key: string;
  dir: SortDir;
}

export interface ListParams<TFilters = Record<string, unknown>> {
  page: number;
  limit: number;
  search?: string;
  sort?: SortParam;
  filters?: TFilters;
  tab?: string;
}

export const listParamsDefaults = {
  page: 1,
  limit: 20,
};

/**
 * Apply default values for list params.
 */
export function withDefaults<TFilters>(
  params: Partial<ListParams<TFilters>>,
  defaults: Partial<ListParams<TFilters>> = listParamsDefaults
): ListParams<TFilters> {
  return {
    page: params.page ?? defaults.page ?? listParamsDefaults.page,
    limit: params.limit ?? defaults.limit ?? listParamsDefaults.limit,
    search: params.search ?? defaults.search,
    sort: params.sort ?? defaults.sort,
    filters: params.filters ?? defaults.filters,
    tab: params.tab ?? defaults.tab,
  };
}

/**
 * Remove default values for shorter URLs.
 */
export function cleanDefaults<TFilters>(
  params: Partial<ListParams<TFilters>>,
  defaults: Partial<ListParams<TFilters>> = listParamsDefaults
) {
  const cleaned: Partial<ListParams<TFilters>> = { ...params };
  if (cleaned.page === defaults.page) delete cleaned.page;
  if (cleaned.limit === defaults.limit) delete cleaned.limit;
  if (cleaned.search === "" || cleaned.search === defaults.search) delete cleaned.search;
  if (cleaned.sort && !cleaned.sort.key) delete cleaned.sort;
  if (cleaned.filters && Object.keys(cleaned.filters).length === 0) delete cleaned.filters;
  if (cleaned.tab === "" || cleaned.tab === defaults.tab) delete cleaned.tab;
  return cleaned;
}
