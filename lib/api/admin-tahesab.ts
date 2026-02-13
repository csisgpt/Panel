import { apiGet, apiPost } from "@/lib/api/client";
import type { ListResult, TahesabOutboxDto } from "@/lib/types/admin-modules";

function qs(params?: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const listTahesabOutbox = (params?: Record<string, unknown>) => apiGet<ListResult<TahesabOutboxDto>>(`/admin/tahesab/outbox${qs(params)}`);
export const retryTahesabOutbox = (id: string) => apiPost(`/admin/tahesab/outbox/${id}/retry`, {});
export const resyncTahesabUser = (id: string) => apiPost(`/admin/tahesab/users/${id}/resync`, {});
export const resyncTahesabGroupUsers = (groupId: string) => apiPost(`/admin/tahesab/customer-groups/${groupId}/resync-users`, { mode: "ONLY_LINKED" });
