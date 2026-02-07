import type { ListMeta } from "@/lib/contracts/list";
import type { ListMetaExtended } from "./list-response-adapter";

export interface P2PMeta {
  limit?: number;
  offset?: number;
  total?: number;
  page?: number;
  totalItems?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextCursor?: string | null;
  sort?: string;
  filtersApplied?: Record<string, unknown>;
}

/**
 * Convert offset-based P2P meta to page-based meta for table views.
 */
export function adaptP2PMeta(meta: P2PMeta): ListMetaExtended {
  if (meta.page !== undefined || meta.totalItems !== undefined) {
    const limit = meta.limit ?? 20;
    const page = meta.page ?? 1;
    const total = meta.totalItems ?? meta.total ?? 0;
    const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / limit));
    const hasPrev = meta.hasPrevPage ?? page > 1;
    const hasNext = meta.hasNextPage ?? page < totalPages;

    return {
      page,
      limit,
      total,
      totalPages,
      sort: meta.sort,
      filtersApplied: meta.filtersApplied,
      hasNext,
      hasPrev,
      hasNextPage: meta.hasNextPage ?? hasNext,
      hasPrevPage: meta.hasPrevPage ?? hasPrev,
    } as ListMeta & ListMetaExtended;
  }

  const limit = meta.limit ?? 20;
  const offset = meta.offset ?? 0;
  const total = meta.total;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : page;
  const hasNext = total ? page < totalPages : false;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total: total ?? offset + limit,
    totalPages,
    sort: meta.sort,
    filtersApplied: meta.filtersApplied,
    hasNext,
    hasPrev,
    hasNextPage: hasNext,
    hasPrevPage: hasPrev,
  } as ListMeta & ListMetaExtended;
}
