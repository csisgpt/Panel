import { apiGet, apiPost } from "@/lib/api/client";
import { normalizeListResponse } from "@/lib/contracts/list";
import { sanitizeAllowedQuery, toQueryString } from "@/lib/contract-mappers/query-sanitize";
import type {
  AdminListDepositsParams,
  CancelRequestDto,
  DecisionDto,
  DepositRequest,
} from "@/lib/types/backend";

const DEPOSITS_ALLOWED_LIST_KEYS = [
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
] as const satisfies ReadonlyArray<keyof AdminListDepositsParams>;

export async function listAdminDeposits(params: AdminListDepositsParams = {}) {
  const sanitized = sanitizeAllowedQuery(params, DEPOSITS_ALLOWED_LIST_KEYS);
  const query = toQueryString(sanitized as Record<string, unknown>);
  const response = await apiGet(`/admin/deposits${query ? `?${query}` : ""}`);
  return normalizeListResponse<DepositRequest>(response as never);
}

export function getAdminDepositDetail(id: string) {
  return apiGet<DepositRequest>(`/admin/deposits/${id}`);
}

export function approveAdminDeposit(id: string, body: DecisionDto) {
  return apiPost<DepositRequest, DecisionDto>(`/admin/deposits/${id}/approve`, body);
}

export function rejectAdminDeposit(id: string, body: DecisionDto) {
  return apiPost<DepositRequest, DecisionDto>(`/admin/deposits/${id}/reject`, body);
}

export function cancelAdminDeposit(id: string, body: CancelRequestDto) {
  return apiPost<DepositRequest, CancelRequestDto>(`/admin/deposits/${id}/cancel`, body);
}
