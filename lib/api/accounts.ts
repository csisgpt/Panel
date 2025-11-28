import { Account, AccountTx } from "@/lib/types/backend";
import { isMockMode } from "./config";
import { apiGet } from "./client";
import {
  getMockAccounts,
  getMockAccountsByUser,
  getMockAccountTx,
} from "@/lib/mock-data";

export async function getAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccounts();
  return apiGet<Account[]>("/accounts");
}

export async function getMyAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccountsByUser("u-trader");
  return apiGet<Account[]>("/accounts/my");
}

export async function getAccountTransactions(
  accountId: string
): Promise<AccountTx[]> {
  if (isMockMode()) {
    return getMockAccountTx(accountId);
  }
  return apiGet<AccountTx[]>(`/accounts/${accountId}/transactions`);
}