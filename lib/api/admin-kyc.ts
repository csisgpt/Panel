import { apiGet, apiPut } from "@/lib/api/client";
import type { ListResult, UserKycDto } from "@/lib/types/admin-modules";

function qs(params?: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const listAdminKycQueue = (params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/kyc/queue${qs(params)}`);
export const getAdminUserKyc = (id: string) => apiGet<UserKycDto>(`/admin/users/${id}/kyc`);
export const putAdminUserKyc = (id: string, body: { status: string; level?: string; rejectReason?: string }) => apiPut(`/admin/users/${id}/kyc`, body);
