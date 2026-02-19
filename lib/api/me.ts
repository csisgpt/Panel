import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import type { AdminUserOverviewDto, PolicySummaryDto, UserKycDto } from "@/lib/types/admin-modules";

export const getMeOverview = () => apiGet<AdminUserOverviewDto>(`/me/overview`);
export const getMePolicySummary = () => apiGet<PolicySummaryDto>(`/me/policy/summary`);
export const getMeKyc = () => apiGet<UserKycDto>(`/me/kyc`);
export const submitMeKyc = (body: { levelRequested?: string; note?: string; fileIds?: string[] }) => apiPost(`/me/kyc/submit`, body);
export const getMeSettings = () => apiGet<Record<string, unknown>>(`/users/me/settings`);
export const putMeSettings = (body: Record<string, unknown>) => apiPut(`/users/me/settings`, body);
