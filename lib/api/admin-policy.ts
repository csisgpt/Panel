import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { ListResult, PolicyRuleDto, PolicySummaryDto } from "@/lib/types/admin-modules";

function qs(params?: Record<string, unknown>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    search.set(k, String(v));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const listPolicyRules = (params?: Record<string, unknown>) => apiGet<ListResult<PolicyRuleDto>>(`/admin/policy-rules${qs(params)}`);
export const createPolicyRule = (body: Partial<PolicyRuleDto>) => apiPost(`/admin/policy-rules`, body);
export const updatePolicyRule = (id: string, body: Partial<PolicyRuleDto>) => apiPut(`/admin/policy-rules/${id}`, body);
export const deletePolicyRule = (id: string) => apiDelete(`/admin/policy-rules/${id}`);
export const bulkUpsertPolicyRules = (body: unknown[]) => apiPost(`/admin/policy-rules/bulk-upsert`, body);
export const getAdminUserPolicySummary = (id: string) => apiGet<PolicySummaryDto>(`/admin/users/${id}/policy/summary`);
export const getAdminUserEffectivePolicy = (id: string) => apiGet<any>(`/admin/users/${id}/effective-policy`);
