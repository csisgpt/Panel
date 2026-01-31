export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  sort?: string;
  filtersApplied?: Record<string, unknown>;
}

export interface ListEnvelope<T> {
  data?: T[];
  items?: T[];
  meta?: ListMeta;
}

export function normalizeListResponse<T>(raw: ListEnvelope<T> | null | undefined) {
  const items = raw?.data ?? raw?.items ?? [];
  const meta: ListMeta = {
    page: raw?.meta?.page ?? 1,
    limit: raw?.meta?.limit ?? items.length,
    total: raw?.meta?.total ?? items.length,
    totalPages: raw?.meta?.totalPages,
    sort: raw?.meta?.sort,
    filtersApplied: raw?.meta?.filtersApplied,
  };

  return { items, meta };
}
