import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm, apiPut } from "@/lib/api/client";
import type { CustomerGroup, EffectiveSettingsWithSources, ListResult, PolicyRuleDto, PolicySummary, TahesabOutbox, UserKyc, UserSafeDto, WalletAccountDto } from "@/lib/contracts/foundation/dtos";
import type { AdminUserOverviewResponse, EffectivePolicyTraceResponse, MeOverviewResponse } from "@/lib/contracts/foundation/responses";

const q = (params?: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const getMeOverview = () => apiGet<MeOverviewResponse>(`/me/overview`);
export const getMeKyc = () => apiGet<UserKyc | null>(`/me/kyc`);
export const submitMeKyc = (body: { levelRequested?: string; note?: string; fileIds?: string[] }) => apiPost<UserKyc, typeof body>(`/me/kyc/submit`, body);
export const getMePolicySummary = () => apiGet<PolicySummary>(`/me/policy/summary`);
export const getMeSettings = () => apiGet<Record<string, unknown>>(`/me/settings`);
export const patchMeSettings = (body: Record<string, unknown>) => apiPatch(`/me/settings`, body);

export const adminGetUsersMeta = () => apiGet<{ roles: string[]; statuses: string[]; kycStatuses: string[]; kycLevels: string[]; policyScopes: string[]; policySelectors: string[]; periods: string[] }>(`/admin/meta/users`);
export const adminListUsers = (params?: Record<string, unknown>) => apiGet<ListResult<UserSafeDto & { customerGroup: { id: string; code: string; name: string } | null; kyc: UserKyc | null }>>(`/admin/users${q(params)}`);
export const adminGetUserOverview = (id: string, expandOutboxHistory?: boolean) => apiGet<AdminUserOverviewResponse>(`/admin/users/${id}/overview${expandOutboxHistory ? "?expand=outboxHistory" : ""}`);
export const adminListUserWalletAccounts = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<WalletAccountDto>>(`/admin/users/${id}/wallet/accounts${q(params)}`);
export const adminPatchUser = (id: string, body: Record<string, unknown>) => apiPatch<UserSafeDto, Record<string, unknown>>(`/admin/users/${id}`, body);
export const adminGetUserPolicySummary = (id: string) => apiGet<PolicySummary>(`/admin/users/${id}/policy/summary`);
export const adminWalletAdjust = (id: string, body: { instrumentCode: string; amount: string; reason: string; externalRef?: string }) => apiPost(`/admin/users/${id}/wallet/adjust`, body);

export const adminKycQueue = (params?: Record<string, unknown>) => apiGet<ListResult<{ user: { id: string; fullName: string; mobile: string; email: string }; kyc: UserKyc; submittedAt: string }>>(`/admin/kyc/queue${q(params)}`);
export const adminGetUserKyc = (id: string) => apiGet<UserKyc | null>(`/admin/users/${id}/kyc`);
export const adminUpdateUserKyc = (id: string, body: { status: string; level: string; reason?: string }) => apiPut(`/admin/users/${id}/kyc`, body);

export const adminListCustomerGroupsPaged = (params?: Record<string, unknown>) => apiGet<ListResult<CustomerGroup>>(`/admin/customer-groups/paged${q(params)}`);
export const adminListCustomerGroups = () => apiGet<CustomerGroup[]>(`/admin/customer-groups`);
export const adminCreateCustomerGroup = (body: { code: string; name: string; tahesabGroupName?: string }) => apiPost<CustomerGroup, typeof body>(`/admin/customer-groups`, body);
export const adminPatchCustomerGroup = (id: string, body: { code?: string; name?: string; tahesabGroupName?: string | null }) => apiPatch<CustomerGroup, typeof body>(`/admin/customer-groups/${id}`, body);
export const adminDeleteCustomerGroup = (id: string) => apiDelete<{ deleted: true }>(`/admin/customer-groups/${id}`);
export const adminGetGroupSettings = (id: string) => apiGet<Partial<EffectiveSettingsWithSources["effective"]> | null>(`/admin/customer-groups/${id}/settings`);
export const adminUpsertGroupSettings = (id: string, body: Record<string, unknown>) => apiPut(`/admin/customer-groups/${id}/settings`, body);
export const adminListGroupUsers = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/customer-groups/${id}/users${q(params)}`);
export const adminMoveGroupUsers = (id: string, body: { toGroupId: string; userIds: string[] }) => apiPost<{ moved: number }, typeof body>(`/admin/customer-groups/${id}/users:move`, body);

export const adminListPolicyRules = (params?: Record<string, unknown>) => apiGet<ListResult<PolicyRuleDto>>(`/admin/policy-rules${q(params)}`);
export const adminCreatePolicyRule = (body: Record<string, unknown>) => apiPost<PolicyRuleDto, Record<string, unknown>>(`/admin/policy-rules`, body);
export const adminPatchPolicyRule = (id: string, body: Record<string, unknown>) => apiPatch<PolicyRuleDto, Record<string, unknown>>(`/admin/policy-rules/${id}`, body);
export const adminDeletePolicyRule = (id: string) => apiDelete<{ deleted: true }>(`/admin/policy-rules/${id}`);
export const adminBulkUpsertPolicyRules = (body: { items: Record<string, unknown>[] }) => apiPost(`/admin/policy-rules/bulk-upsert`, body);

export const adminGetEffectivePolicy = (id: string, params?: Record<string, unknown>) => apiGet<EffectivePolicyTraceResponse>(`/admin/users/${id}/effective-policy${q(params)}`);
export const adminGetUserProductLimitsGrid = (id: string, params?: Record<string, unknown>) => apiGet<any>(`/admin/users/${id}/product-limits${q(params)}`);
export const adminApplyUserProductLimits = (id: string, body: { changes: unknown[] }) => apiPost(`/admin/users/${id}/product-limits:apply`, body);
export const adminGetUserLimitUsage = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/users/${id}/limits/usage${q(params)}`);
export const adminGetUserLimitReservations = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/users/${id}/limits/reservations${q(params)}`);
export const adminListPolicyAudit = (params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/audit/policy${q(params)}`);

export const listFiles = (params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/files${q(params)}`);
export const uploadFile = (file: File, label = "مدارک KYC") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  return apiPostForm<any>(`/files`, formData);
};
export const getFileMeta = (id: string) => apiGet<any>(`/files/${id}/meta`);
export const getFileLinks = (id: string) => apiGet<any>(`/files/${id}`);
export const deleteFile = (id: string) => apiDelete<{ deleted: true }>(`/files/${id}`);

export const listAdminFiles = (params?: Record<string, unknown>) => apiGet<ListResult<any>>(`/admin/files${q(params)}`);
export const getAdminFileMeta = (id: string) => apiGet<any>(`/admin/files/${id}/meta`);
export const deleteAdminFile = (id: string, hard?: boolean) => apiDelete<{ deleted: true }>(`/admin/files/${id}${hard !== undefined ? q({ hard }) : ""}`);

export const listOutbox = (params?: Record<string, unknown>) => apiGet<ListResult<TahesabOutbox>>(`/admin/tahesab/outbox${q(params)}`);
export const retryOutbox = (id: string) => apiPost(`/admin/tahesab/outbox/${id}/retry`, {});
export const resyncUser = (id: string) => apiPost(`/admin/tahesab/users/${id}/resync`, {});
export const resyncGroupUsers = (groupId: string, body: { mode: "ONLY_LINKED" | "ALL"; userIds?: string[] }) => apiPost(`/admin/tahesab/customer-groups/${groupId}/resync-users`, body);
