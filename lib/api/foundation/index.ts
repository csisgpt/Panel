import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm, apiPut } from "@/lib/api/client";
import type {
  CustomerGroup,
  CustomerGroupSettingsDto,
  ListResult,
  GroupUserRowDto,
  PolicyRuleDto,
  PolicySummary,
  TahesabOutbox,
  UserKyc,
  UserSafeDto,
  UserSettingsDto,
  WalletAccountDto,
} from "@/lib/contracts/foundation/dtos";
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
export const submitMeKyc = (body: { levelRequested?: string; note?: string; fileIds?: string[] }) =>
  apiPost<UserKyc, typeof body>(`/me/kyc/submit`, body);
export const getMePolicySummary = () => apiGet<PolicySummary>(`/me/policy/summary`);
export const getMeSettings = () => apiGet<UserSettingsDto>(`/users/me/settings`);
export const putMeSettings = (body: UserSettingsDto) => apiPut<UserSettingsDto, UserSettingsDto>(`/users/me/settings`, body);

export const adminGetUserSettings = (userId: string) => apiGet<UserSettingsDto>(`/admin/users/${userId}/settings`);
export const adminPutUserSettings = (userId: string, body: UserSettingsDto) => apiPut<UserSettingsDto, UserSettingsDto>(`/admin/users/${userId}/settings`, body);
export const adminGetUserEffectiveSettings = (userId: string) => apiGet<unknown>(`/admin/users/${userId}/effective-settings`);

export const adminGetUsersMeta = () =>
  apiGet<{ roles: string[]; statuses: string[]; kycStatuses: string[]; kycLevels: string[]; policyScopes: string[]; policySelectors: string[]; periods: string[] }>(`/admin/meta/users`);
export const adminListUsers = (params?: Record<string, unknown>) =>
  apiGet<ListResult<UserSafeDto & { customerGroup: { id: string; code: string; name: string } | null; kyc: UserKyc | null }>>(`/admin/users${q(params)}`);
export const adminGetUserOverview = (id: string, expandOutboxHistory?: boolean) =>
  apiGet<AdminUserOverviewResponse>(`/admin/users/${id}/overview${expandOutboxHistory ? "?expand=outboxHistory" : ""}`);
export const adminListUserWalletAccounts = (id: string, params?: Record<string, unknown>) =>
  apiGet<ListResult<WalletAccountDto>>(`/admin/users/${id}/wallet/accounts${q(params)}`);
export const adminPatchUser = (id: string, body: Partial<UserSafeDto>) => apiPatch<UserSafeDto, Partial<UserSafeDto>>(`/admin/users/${id}`, body);
export const adminGetUserPolicySummary = (id: string) => apiGet<PolicySummary>(`/admin/users/${id}/policy/summary`);
export const adminWalletAdjust = (id: string, body: { instrumentCode: string; amount: string; reason: string; externalRef?: string }) =>
  apiPost(`/admin/users/${id}/wallet/adjust`, body);

export const adminKycQueue = (params?: Record<string, unknown>) =>
  apiGet<ListResult<{ user: { id: string; fullName: string; mobile: string; email: string }; kyc: UserKyc; submittedAt: string }>>(`/admin/kyc/queue${q(params)}`);
export const adminGetUserKyc = (id: string) => apiGet<UserKyc | null>(`/admin/users/${id}/kyc`);
export const adminUpdateUserKyc = (id: string, body: { status: string; level: string; reason?: string }) => apiPut(`/admin/users/${id}/kyc`, body);

export const adminListCustomerGroupsPaged = (params?: Record<string, unknown>) => apiGet<ListResult<CustomerGroup>>(`/admin/customer-groups/paged${q(params)}`);
export const adminListCustomerGroups = () => apiGet<CustomerGroup[]>(`/admin/customer-groups`);
export const adminGetCustomerGroup = (id: string) => apiGet<CustomerGroup>(`/admin/customer-groups/${id}`);
export const adminCreateCustomerGroup = (body: { code: string; name: string; tahesabGroupName?: string | null; isDefault?: boolean }) =>
  apiPost<CustomerGroup, typeof body>(`/admin/customer-groups`, body);
export const adminPutCustomerGroup = (id: string, body: { name: string; tahesabGroupName?: string | null; isDefault?: boolean }) =>
  apiPut<CustomerGroup, typeof body>(`/admin/customer-groups/${id}`, body);
export const adminDeleteCustomerGroup = (id: string) => apiDelete<{ deleted: true }>(`/admin/customer-groups/${id}`);
export const adminGetGroupSettings = (id: string) => apiGet<CustomerGroupSettingsDto | null>(`/admin/customer-groups/${id}/settings`);
export const adminUpsertGroupSettings = (id: string, body: {
  showBalances?: boolean | null;
  showGold?: boolean | null;
  showCoins?: boolean | null;
  showCash?: boolean | null;
  tradeEnabled?: boolean | null;
  withdrawEnabled?: boolean | null;
  maxOpenTrades?: number | null;
  metaJson?: Record<string, unknown> | null;
}) => apiPut(`/admin/customer-groups/${id}/settings`, body);
export const adminListGroupUsers = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<GroupUserRowDto>>(`/admin/customer-groups/${id}/users${q(params)}`);
export const adminMoveGroupUsers = (id: string, body: { toGroupId: string; userIds: string[] }) =>
  apiPost<{ moved: number }, typeof body>(`/admin/customer-groups/${id}/users:move`, body);

export const adminListPolicyRules = (params?: Record<string, unknown>) => apiGet<ListResult<PolicyRuleDto>>(`/admin/policy-rules${q(params)}`);
export const adminCreatePolicyRule = (body: Omit<PolicyRuleDto, "id" | "updatedAt">) => apiPost<PolicyRuleDto, Omit<PolicyRuleDto, "id" | "updatedAt">>(`/admin/policy-rules`, body);
export const adminPatchPolicyRule = (id: string, body: Partial<Omit<PolicyRuleDto, "id" | "updatedAt">>) => apiPatch<PolicyRuleDto, Partial<Omit<PolicyRuleDto, "id" | "updatedAt">>>(`/admin/policy-rules/${id}`, body);
export const adminDeletePolicyRule = (id: string) => apiDelete<{ deleted: true }>(`/admin/policy-rules/${id}`);
export const adminBulkUpsertPolicyRules = (body: { items: Array<Omit<PolicyRuleDto, "id" | "updatedAt">> }) => apiPost(`/admin/policy-rules/bulk-upsert`, body);

export const adminGetEffectivePolicy = (id: string, params?: Record<string, unknown>) => apiGet<EffectivePolicyTraceResponse>(`/admin/users/${id}/effective-policy${q(params)}`);
export const adminGetUserProductLimitsGrid = (id: string, params?: Record<string, unknown>) => apiGet<unknown>(`/admin/users/${id}/product-limits${q(params)}`);
export const adminApplyUserProductLimits = (id: string, body: { changes: unknown[] }) => apiPost(`/admin/users/${id}/product-limits:apply`, body);
export const adminGetUserLimitUsage = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<unknown>>(`/admin/users/${id}/limits/usage${q(params)}`);
export const adminGetUserLimitReservations = (id: string, params?: Record<string, unknown>) => apiGet<ListResult<unknown>>(`/admin/users/${id}/limits/reservations${q(params)}`);
export const adminListPolicyAudit = (params?: Record<string, unknown>) => apiGet<ListResult<unknown>>(`/admin/audit/policy${q(params)}`);

export const listFiles = (params?: Record<string, unknown>) => apiGet<ListResult<unknown>>(`/files${q(params)}`);
export const uploadFile = (file: File, label = "مدارک KYC") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  return apiPostForm<unknown>(`/files`, formData);
};
export const getFileMeta = (id: string) => apiGet<unknown>(`/files/${id}/meta`);
export const getFileLinks = (id: string) => apiGet<unknown>(`/files/${id}`);
export const deleteFile = (id: string) => apiDelete<{ deleted: true }>(`/files/${id}`);

export const listAdminFiles = (params?: Record<string, unknown>) => apiGet<ListResult<unknown>>(`/admin/files${q(params)}`);
export const getAdminFileMeta = (id: string) => apiGet<unknown>(`/admin/files/${id}/meta`);
export const deleteAdminFile = (id: string, hard?: boolean) => apiDelete<{ deleted: true }>(`/admin/files/${id}${hard !== undefined ? q({ hard }) : ""}`);

export const listOutbox = (params?: Record<string, unknown>) => apiGet<ListResult<TahesabOutbox>>(`/admin/tahesab/outbox${q(params)}`);
export const retryOutbox = (id: string) => apiPost(`/admin/tahesab/outbox/${id}/retry`, {});
export const resyncUser = (id: string) => apiPost(`/admin/tahesab/users/${id}/resync`, {});
export const resyncGroupUsers = (groupId: string, body: { mode: "ONLY_LINKED" | "ALL"; userIds?: string[] }) =>
  apiPost(`/admin/tahesab/customer-groups/${groupId}/resync-users`, body);
