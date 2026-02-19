import type { AdminListWithdrawalsParams } from "@/lib/types/backend";
import { sanitizeAllowedQuery } from "@/lib/contract-mappers/query-sanitize";
import type { ListParams } from "@/lib/querykit/schemas";

export const ADMIN_WITHDRAWALS_ALLOWED_KEYS = [
  "page",
  "limit",
  "offset",
  "sort",
  "sortBy",
  "orderBy",
  "order",
  "direction",
  "dir",
  "status",
  "userId",
  "mobile",
  "createdFrom",
  "createdTo",
  "amountFrom",
  "amountTo",
  "q",
] as const satisfies ReadonlyArray<keyof AdminListWithdrawalsParams>;

export function mapAdminWithdrawalsListParams(
  params: ListParams<Record<string, unknown>>
): AdminListWithdrawalsParams {
  const mapped: AdminListWithdrawalsParams = {
    page: params.page,
    limit: params.limit,
    q: params.search || undefined,
    sort: params.sort ? `${params.sort.dir === "desc" ? "-" : ""}${params.sort.key}` : undefined,
    ...(params.filters as Record<string, string | undefined> | undefined),
  };

  return sanitizeAllowedQuery(mapped, ADMIN_WITHDRAWALS_ALLOWED_KEYS) as AdminListWithdrawalsParams;
}
