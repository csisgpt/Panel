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

import { unwrapApiResult } from "@/lib/api/http";

export function normalizeListResponse<T>(raw: ListEnvelope<T> | null | undefined) {
  const payload = unwrapApiResult(raw ?? undefined) as ListEnvelope<T> | null | undefined;
  const items = payload?.data ?? payload?.items ?? [];
  const meta: ListMeta = {
    page: payload?.meta?.page ?? 1,
    limit: payload?.meta?.limit ?? items.length,
    total: payload?.meta?.total ?? items.length,
    totalPages: payload?.meta?.totalPages,
    sort: payload?.meta?.sort,
    filtersApplied: payload?.meta?.filtersApplied,
  };

  return { items, meta };
}
