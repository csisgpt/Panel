import type { ListParams } from "@/lib/querykit/schemas";
import { listParamsToQuery } from "@/lib/adapters/list-params-to-query";

const withdrawalSortMap: Record<string, string | { asc?: string; desc?: string }> = {
  createdAt: { asc: "createdAt_asc", desc: "createdAt_desc" },
  amount: { asc: "amount_asc", desc: "amount_desc" },
  remainingToAssign: { asc: "remainingToAssign_asc", desc: "remainingToAssign_desc" },
  priority: "priority",
  nearestExpire: "nearestExpire_asc",
};

const allocationSortMap: Record<string, string | { asc?: string; desc?: string }> = {
  createdAt: "createdAt_desc",
  expiresAt: "expiresAt_asc",
  paidAt: "paidAt_desc",
  amount: "amount_desc",
};

const candidateSortMap: Record<string, string | { asc?: string; desc?: string }> = {
  remaining: "remaining_desc",
  createdAt: { asc: "createdAt_asc", desc: "createdAt_desc" },
};

const supportsBooleanQuery = process.env.NEXT_PUBLIC_API_SUPPORTS_BOOLEAN_QUERY !== "false";
// TODO(backend): add DTO transforms for boolean query params (e.g. "true"/"false") to enable boolean filters safely.
const booleanFilters = ["hasDispute", "hasProof", "receiverConfirmed", "adminVerified", "expired", "expiresSoon"];
const booleanDenyList = supportsBooleanQuery ? [] : booleanFilters;

export function buildAdminWithdrawalsQuery(params: ListParams) {
  return listParamsToQuery(params, {
    searchKey: "mobile",
    sortParam: "sort",
    sortMap: withdrawalSortMap,
    filterAllowList: [
      "status",
      "userId",
      "mobile",
      "amountMin",
      "amountMax",
      "remainingToAssignMin",
      "remainingToAssignMax",
      "createdFrom",
      "createdTo",
      "destinationBank",
      "destinationType",
      "expiringSoonMinutes",
      "hasDispute",
      "hasProof",
    ],
    filterDenyList: booleanDenyList,
    includeTab: false,
  }).toString();
}

export function buildAdminAllocationsQuery(params: ListParams) {
  return listParamsToQuery(params, {
    searchKey: "bankRefSearch",
    sortParam: "sort",
    sortMap: allocationSortMap,
    filterAllowList: [
      "status",
      "withdrawalId",
      "depositId",
      "payerUserId",
      "receiverUserId",
      "method",
      "hasProof",
      "receiverConfirmed",
      "adminVerified",
      "expired",
      "expiresSoonMinutes",
      "bankRef",
      "bankRefSearch",
      "createdFrom",
      "createdTo",
      "paidFrom",
      "paidTo",
    ],
    filterDenyList: booleanDenyList,
    includeTab: false,
  }).toString();
}

export function buildWithdrawalCandidatesQuery(params: ListParams) {
  return listParamsToQuery(params, {
    searchKey: "mobile",
    sortParam: "sort",
    sortMap: candidateSortMap,
    includeTab: false,
  }).toString();
}

export function buildTraderHistoryQuery(params: ListParams) {
  return listParamsToQuery(params, {
    enableSearch: false,
    sortParam: "sort",
    sortMap: allocationSortMap,
    filterAllowList: ["status", "expiresSoon"],
    filterDenyList: [...booleanDenyList, "amountMin", "amountMax"],
    includeTab: false,
  }).toString();
}
