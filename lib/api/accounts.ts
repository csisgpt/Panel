import { apiGet } from "./client";
import { isMockMode } from "./config";
import { getMockAccountTx, getMockAccounts, getMockAccountsByUser } from "@/lib/mock-data";
import { Account, AccountTx } from "@/lib/types/backend";

export async function getAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccounts();
  return apiGet<Account[]>("/accounts");
}

export async function getMyAccounts(): Promise<Account[]> {
  if (isMockMode()) return getMockAccountsByUser("u-trader");
  return apiGet<Account[]>("/accounts/my");
}

export async function getAccountTransactions(): Promise<AccountTx[]> {
  if (isMockMode()) return getMockAccountTx();
  return apiGet<AccountTx[]>("/account-transactions");
}
