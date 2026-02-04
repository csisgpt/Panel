import type { ListParams } from "@/lib/querykit/schemas";
import { serializeQueryValue } from "@/lib/querykit/serialize";

type SortMap = Record<string, string | { asc?: string; desc?: string }>;

const withdrawalSortMap: SortMap = {
  createdAt: { asc: "createdAt_asc", desc: "createdAt_desc" },
  amount: { asc: "amount_asc", desc: "amount_desc" },
  remainingToAssign: { asc: "remainingToAssign_asc", desc: "remainingToAssign_desc" },
  priority: "priority",
  nearestExpire: "nearestExpire_asc",
};

const allocationSortMap: SortMap = {
  createdAt: "createdAt_desc",
  expiresAt: "expiresAt_asc",
  paidAt: "paidAt_desc",
  amount: "amount_desc",
};

const candidateSortMap: SortMap = {
  remaining: "remaining_desc",
  createdAt: { asc: "createdAt_asc", desc: "createdAt_desc" },
};

type FilterMap = Record<string, string>;

function appendFilters(
  searchParams: URLSearchParams,
  filters: Record<string, unknown> | undefined,
  filterMap: FilterMap
) {
  if (!filters) return;
  Object.entries(filterMap).forEach(([key, mappedKey]) => {
    const value = filters[key];
    const serialized = serializeQueryValue(value);
    if (serialized === undefined) return;
    searchParams.set(mappedKey, serialized);
  });
}

function appendSort(searchParams: URLSearchParams, params: ListParams, sortParam: string, sortMap: SortMap) {
  if (!params.sort?.key) return;
  const mapping = sortMap[params.sort.key];
  if (typeof mapping === "string") {
    searchParams.set(sortParam, mapping);
    return;
  }
  if (mapping) {
    const mapped = params.sort.dir === "asc" ? mapping.asc : mapping.desc;
    if (mapped) searchParams.set(sortParam, mapped);
    return;
  }
  searchParams.set(sortParam, `${params.sort.key}_${params.sort.dir}`);
}

function buildListQuery(
  params: ListParams,
  {
    searchKey = "search",
    sortParam = "sort",
    sortMap,
    filterMap = {},
  }: {
    searchKey?: string;
    sortParam?: string;
    sortMap: SortMap;
    filterMap?: FilterMap;
  }
) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.search) {
    searchParams.set(searchKey, params.search);
  }
  appendSort(searchParams, params, sortParam, sortMap);
  appendFilters(searchParams, params.filters as Record<string, unknown> | undefined, filterMap);
  if (params.tab) {
    searchParams.set("tab", params.tab);
  }
  return searchParams;
}

export function buildAdminWithdrawalsQuery(params: ListParams) {
  return buildListQuery(params, {
    searchKey: "mobile",
    sortParam: "sort",
    sortMap: withdrawalSortMap,
    filterMap: {
      destinationType: "destinationType",
      hasProof: "hasProof",
      hasDispute: "hasDispute",
      expiringSoonMinutes: "expiringSoonMinutes",
      amountMin: "amountMin",
      amountMax: "amountMax",
      remainingToAssignMin: "remainingToAssignMin",
      remainingToAssignMax: "remainingToAssignMax",
      createdFrom: "createdFrom",
      createdTo: "createdTo",
    },
  });
}

export function buildAdminAllocationsQuery(params: ListParams) {
  return buildListQuery(params, {
    searchKey: "bankRefSearch",
    sortParam: "sort",
    sortMap: allocationSortMap,
    filterMap: {
      status: "status",
      method: "method",
      hasProof: "hasProof",
      receiverConfirmed: "receiverConfirmed",
      adminVerified: "adminVerified",
      expired: "expired",
      expiresSoonMinutes: "expiresSoonMinutes",
      amountMin: "amountMin",
      amountMax: "amountMax",
      createdFrom: "createdFrom",
      createdTo: "createdTo",
      paidFrom: "paidFrom",
      paidTo: "paidTo",
    },
  });
}

export function buildWithdrawalCandidatesQuery(params: ListParams) {
  return buildListQuery(params, {
    searchKey: "mobile",
    sortParam: "sort",
    sortMap: candidateSortMap,
  });
}

export function buildTraderHistoryQuery(params: ListParams) {
  return buildListQuery(params, {
    sortParam: "sort",
    sortMap: allocationSortMap,
    filterMap: {
      status: "status",
      amountMin: "amountMin",
      amountMax: "amountMax",
    },
  });
}
