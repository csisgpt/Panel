import type { ListParams } from "@/lib/querykit/schemas";
import { listParamsToQuery } from "@/lib/adapters/list-params-to-query";

const p2pWithdrawalSortMap: Record<string, string | { asc?: string; desc?: string }> = {
  createdAt: { asc: "createdAt_asc", desc: "createdAt_desc" },
  amount: { asc: "amount_asc", desc: "amount_desc" },
  remainingToAssign: { asc: "remainingToAssign_asc", desc: "remainingToAssign_desc" },
  priority: "priority",
  nearestExpire: "nearestExpire_asc",
};

const supportsBooleanQuery = process.env.NEXT_PUBLIC_API_SUPPORTS_BOOLEAN_QUERY !== "false";
const booleanFilters = ["hasDispute", "hasProof", "receiverConfirmed", "adminVerified", "expired", "expiresSoon"];
const booleanDenyList = supportsBooleanQuery ? [] : booleanFilters;

export function buildAdminP2PWithdrawalsQuery(params: ListParams) {
  return listParamsToQuery(params, {
    searchKey: "mobile",
    sortParam: "sort",
    sortMap: p2pWithdrawalSortMap,
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
