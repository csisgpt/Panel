import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import {
  getMockTahesabBalances,
  getMockTahesabBalancesByCustomer,
  getMockTahesabBalanceBreakdown,
  getMockTahesabDocumentById,
  getMockTahesabDocuments,
  getMockTahesabDocumentsByRef,
  getMockTahesabLogs,
  getMockTahesabMappings,
  getMockTahesabSyncStatus,
  mockTestTahesabConnection,
  mockTriggerTahesabSync,
  updateMockTahesabMapping,
} from "@/lib/mock-data";
import type {
  TahesabBalanceBreakdown,
  TahesabBalanceInternalItem,
  TahesabLog,
  TahesabLogLevel,
  TahesabMapping,
} from "@/lib/mock-data";
import {
  TahesabBalanceRecord,
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  TahesabDocumentType,
  TahesabSyncStatus,
} from "@/lib/types/backend";

export async function getTahesabLogs(params?: {
  limit?: number;
  level?: TahesabLogLevel;
  operation?: string;
  entityType?: TahesabLog["entityType"];
  dateFrom?: string;
  dateTo?: string;
}): Promise<TahesabLog[]> {
  if (isMockMode()) return getMockTahesabLogs(params);
  const query = new URLSearchParams();
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.level) query.append("level", params.level);
  if (params?.operation) query.append("operation", params.operation);
  if (params?.entityType) query.append("entityType", params.entityType);
  if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params?.dateTo) query.append("dateTo", params.dateTo);
  const qs = query.toString();
  return apiGet<TahesabLog[]>(`/tahesab/logs${qs ? `?${qs}` : ""}`);
}

export async function getTahesabMappings(): Promise<TahesabMapping[]> {
  if (isMockMode()) return getMockTahesabMappings();
  return apiGet<TahesabMapping[]>("/tahesab/mappings");
}

export async function updateTahesabMapping(
  id: string,
  partial: Partial<TahesabMapping>
): Promise<TahesabMapping> {
  if (isMockMode()) return updateMockTahesabMapping(id, partial);
  return apiPatch<TahesabMapping, Partial<TahesabMapping>>(`/tahesab/mappings/${id}`, partial);
}

export async function getTahesabSyncStatus(): Promise<TahesabSyncStatus> {
  if (isMockMode()) return getMockTahesabSyncStatus();
  return apiGet<TahesabSyncStatus>("/tahesab/sync-status");
}

export async function getTahesabBalances(): Promise<TahesabBalanceRecord[]> {
  if (isMockMode()) return getMockTahesabBalances();
  return apiGet<TahesabBalanceRecord[]>("/tahesab/balances");
}

export async function getTahesabBalanceRecords(): Promise<TahesabBalanceRecord[]> {
  return getTahesabBalances();
}

export type { TahesabBalanceInternalItem, TahesabBalanceBreakdown };
export type { TahesabLog, TahesabLogLevel, TahesabMapping };

export async function getTahesabBalancesByCustomer(customerId: string): Promise<TahesabBalanceRecord[]> {
  if (isMockMode()) return getMockTahesabBalancesByCustomer(customerId);
  return apiGet<TahesabBalanceRecord[]>(`/tahesab/balances?customerId=${customerId}`);
}

export async function getTahesabBalanceBreakdown(recordId: string): Promise<
  TahesabBalanceBreakdown & { tahesabDocuments: TahesabDocumentDetail[] }
> {
  if (isMockMode()) return getMockTahesabBalanceBreakdown(recordId);
  return apiGet<TahesabBalanceBreakdown & { tahesabDocuments: TahesabDocumentDetail[] }>(
    `/tahesab/balances/${recordId}/breakdown`
  );
}

export async function getTahesabDocuments(params?: {
  type?: TahesabDocumentType;
  status?: TahesabDocumentStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<TahesabDocumentSummary[]> {
  if (isMockMode()) return getMockTahesabDocuments(params);
  const query = new URLSearchParams();
  if (params?.type) query.append("type", params.type);
  if (params?.status) query.append("status", params.status);
  if (params?.customerId) query.append("customerId", params.customerId);
  if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
  if (params?.dateTo) query.append("dateTo", params.dateTo);
  const qs = query.toString();
  return apiGet<TahesabDocumentSummary[]>(`/tahesab/documents${qs ? `?${qs}` : ""}`);
}

export async function getTahesabDocumentById(id: string): Promise<TahesabDocumentDetail> {
  if (isMockMode()) return getMockTahesabDocumentById(id);
  return apiGet<TahesabDocumentDetail>(`/tahesab/documents/${id}`);
}

export async function getTahesabDocumentsByRef(
  refType: "trade" | "deposit" | "withdrawal" | "remittance",
  refId: string
): Promise<TahesabDocumentSummary[]> {
  return getTahesabDocumentsByInternalRef(refType, refId);
}

export async function getTahesabDocumentsByInternalRef(
  refType: "trade" | "deposit" | "withdrawal" | "remittance",
  refId: string
): Promise<TahesabDocumentSummary[]> {
  if (isMockMode()) return getMockTahesabDocumentsByRef(refType, refId);
  return apiGet<TahesabDocumentSummary[]>(`/tahesab/documents/ref/${refType}/${refId}`);
}

export async function getTahesabReconciliationSummary(): Promise<TahesabBalanceRecord[]> {
  return getTahesabBalances();
}

export async function testTahesabConnection(): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) return mockTestTahesabConnection();
  return apiPost<{ success: boolean; message: string }, Record<string, never>>("/tahesab/test", {} as never);
}

export async function triggerTahesabSync(): Promise<{ accepted: boolean; status?: TahesabSyncStatus }> {
  if (isMockMode()) return mockTriggerTahesabSync();
  return apiPost<{ accepted: boolean; status?: TahesabSyncStatus }, Record<string, never>>("/tahesab/sync", {} as never);
}
