import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { CustomerGroupDto, EffectiveSettingsDto, ListResult, UserSafeDto } from "@/lib/types/admin-modules";

function qs(params?: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const listCustomerGroupsPaged = (params?: Record<string, unknown>) =>
  apiGet<ListResult<CustomerGroupDto>>(`/admin/customer-groups/paged${qs(params)}`);
export const listCustomerGroups = () => apiGet<CustomerGroupDto[]>(`/admin/customer-groups`);
export const createCustomerGroup = (body: Partial<CustomerGroupDto>) => apiPost<CustomerGroupDto, Partial<CustomerGroupDto>>(`/admin/customer-groups`, body);
export const updateCustomerGroup = (id: string, body: Partial<CustomerGroupDto>) => apiPut<CustomerGroupDto, Partial<CustomerGroupDto>>(`/admin/customer-groups/${id}`, body);
export const deleteCustomerGroup = (id: string) => apiDelete(`/admin/customer-groups/${id}`);
export const getCustomerGroupSettings = (id: string) => apiGet<EffectiveSettingsDto>(`/admin/customer-groups/${id}/settings`);
export const putCustomerGroupSettings = (id: string, body: EffectiveSettingsDto) => apiPut(`/admin/customer-groups/${id}/settings`, body);
export const listCustomerGroupUsers = (id: string, params?: Record<string, unknown>) =>
  apiGet<ListResult<UserSafeDto>>(`/admin/customer-groups/${id}/users${qs(params)}`);
export const moveCustomerGroupUsers = (id: string, body: { userIds: string[]; toGroupId: string }) =>
  apiPost(`/admin/customer-groups/${id}/users:move`, body);
