import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { AdminUserOverviewDto, ListResult, UserSafeDto, WalletAccountDto } from "@/lib/types/admin-modules";

function qs(params?: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const listAdminUsers = (params?: Record<string, unknown>) =>
  apiGet<ListResult<UserSafeDto>>(`/admin/users${qs(params)}`);

export const getAdminUserOverview = (id: string) => apiGet<AdminUserOverviewDto>(`/admin/users/${id}/overview`);

export const patchAdminUser = (id: string, body: Record<string, unknown>) => apiPatch(`/admin/users/${id}`, body);

export const getAdminUserWalletAccounts = async (id: string) => {
  const result = await apiGet<ListResult<WalletAccountDto> | WalletAccountDto[]>(`/admin/users/${id}/wallet/accounts`);
  if (Array.isArray(result)) return { items: result };
  return { items: result.items ?? [] };
};

export const adjustAdminUserWallet = (id: string, body: { instrumentCode: string; amount: string; reason: string; externalRef?: string }) =>
  apiPost(`/admin/users/${id}/wallet/adjust`, body);
