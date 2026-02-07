import { normalizeListResponse } from "@/lib/contracts/list";
import type { ListMeta } from "@/lib/contracts/list";

export interface ListMetaExtended extends ListMeta {
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Normalize list responses and ensure common pagination metadata exists.
 */
export function adaptListResponse<T>(raw: unknown): { items: T[]; meta: ListMetaExtended } {
  const { items, meta } = normalizeListResponse<T>(raw as any);
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(meta.total / meta.limit));
  const hasPrev = meta.hasPrevPage ?? meta.page > 1;
  const hasNext = meta.hasNextPage ?? meta.page < totalPages;
  return {
    items,
    meta: {
      ...meta,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}
