export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  sort?: string;
  filtersApplied?: Record<string, unknown>;
}

export interface ListEnvelope<T> {
  data?: T[];
  items?: T[];
  meta?: ListMeta;
}

import { unwrapApiResult } from "@/lib/api/http";

type ListMetaPayload = Partial<ListMeta> & {
  totalItems?: number;
  offset?: number;
  total?: number;
};

export function normalizeListResponse<T>(raw: ListEnvelope<T> | null | undefined) {
  const payload = unwrapApiResult(raw ?? undefined) as ListEnvelope<T> | null | undefined;
  const items = payload?.data ?? payload?.items ?? [];
  const metaFromPayload = (payload?.meta ?? {}) as ListMetaPayload;
  const limit = metaFromPayload.limit ?? (items.length || 20);
  const page =
    metaFromPayload.page ??
    (metaFromPayload.offset !== undefined ? Math.floor(metaFromPayload.offset / limit) + 1 : 1);
  const total = metaFromPayload.totalItems ?? metaFromPayload.total ?? items.length;
  const totalPages = metaFromPayload.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const meta: ListMeta = {
    page,
    limit,
    total,
    totalPages,
    hasPrevPage: metaFromPayload.hasPrevPage ?? page > 1,
    hasNextPage: metaFromPayload.hasNextPage ?? page < totalPages,
    sort: metaFromPayload.sort,
    filtersApplied: metaFromPayload.filtersApplied,
  };

  return { items, meta };
}
