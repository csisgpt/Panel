import { apiGet, apiPost } from "@/lib/api/client";
import { normalizeListResponse } from "@/lib/contracts/list";
import { sanitizeAllowedQuery, toQueryString } from "@/lib/contract-mappers/query-sanitize";
import type {
  AdminListWithdrawalsParams,
  CancelRequestDto,
  DecisionDto,
  WithdrawRequest,
} from "@/lib/types/backend";

const WITHDRAWALS_ALLOWED_LIST_KEYS = [
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

export async function listAdminWithdrawals(params: AdminListWithdrawalsParams = {}) {
  const sanitized = sanitizeAllowedQuery(params, WITHDRAWALS_ALLOWED_LIST_KEYS);
  const query = toQueryString(sanitized as Record<string, unknown>);
  const response = await apiGet(`/admin/withdrawals${query ? `?${query}` : ""}`);
  return normalizeListResponse<WithdrawRequest>(response as never);
}

export function getAdminWithdrawalDetail(id: string) {
  return apiGet<WithdrawRequest>(`/admin/withdrawals/${id}`);
}

export function approveAdminWithdrawal(id: string, body: DecisionDto) {
  return apiPost<WithdrawRequest, DecisionDto>(`/admin/withdrawals/${id}/approve`, body);
}

export function rejectAdminWithdrawal(id: string, body: DecisionDto) {
  return apiPost<WithdrawRequest, DecisionDto>(`/admin/withdrawals/${id}/reject`, body);
}

export function cancelAdminWithdrawal(id: string, body: CancelRequestDto) {
  return apiPost<WithdrawRequest, CancelRequestDto>(`/admin/withdrawals/${id}/cancel`, body);
}
