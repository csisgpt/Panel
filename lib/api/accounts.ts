import { Account, AccountTx } from "@/lib/types/backend";
import { isMockMode } from "./config";
import { apiGet } from "./client";
import {
  getMockAccounts,
  getMockAccountsByUser,
  getMockAccountTx,
  getMockAccountTxEnvelope,
} from "@/lib/mock-data";
import { normalizeListResponse, type ListEnvelope, type ListMeta } from "@/lib/contracts/list";

export interface AccountTxListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccounts();
  return apiGet<Account[]>("/accounts");
}

export async function getMyAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccountsByUser("u-trader");
  return apiGet<Account[]>("/accounts/my");
}

export async function listAccountTransactions(
  accountId: string,
  params: AccountTxListParams = {}
): Promise<{ items: AccountTx[]; meta: ListMeta }> {
  if (isMockMode()) {
    return normalizeListResponse(getMockAccountTxEnvelope(accountId, params));
  }
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await apiGet<ListEnvelope<AccountTx>>(
    `/accounts/${accountId}/transactions${query ? `?${query}` : ""}`
  );
  return normalizeListResponse(response);
}

export async function getAccountTransactions(accountId: string): Promise<AccountTx[]> {
  if (isMockMode()) {
    return getMockAccountTx(accountId);
  }
  const { items } = await listAccountTransactions(accountId);
  return items;
}
