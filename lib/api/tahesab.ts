import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import {
  getMockTahesabBalances,
  getMockTahesabBalancesByCustomer,
  getMockTahesabDocumentById,
  getMockTahesabDocuments,
  getMockTahesabDocumentsByRef,
  getMockTahesabLogs,
  getMockTahesabMappings,
  getMockTahesabSyncStatus,
  updateMockTahesabMapping,
  TahesabLog,
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

export async function getTahesabLogs(): Promise<TahesabLog[]> {
  if (isMockMode()) return getMockTahesabLogs();
  return apiGet<TahesabLog[]>("/tahesab/logs");
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

export async function getTahesabBalancesByCustomer(customerId: string): Promise<TahesabBalanceRecord[]> {
  if (isMockMode()) return getMockTahesabBalancesByCustomer(customerId);
  return apiGet<TahesabBalanceRecord[]>(`/tahesab/balances?customerId=${customerId}`);
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
  if (isMockMode()) return { success: true, message: "اتصال به صورت موفقیت‌آمیز تست شد" };
  return apiPost<{ success: boolean; message: string }, Record<string, never>>("/tahesab/test", {} as never);
}

export async function triggerTahesabSync(): Promise<{ accepted: boolean }> {
  if (isMockMode()) return { accepted: true };
  return apiPost<{ accepted: boolean }, Record<string, never>>("/tahesab/sync", {} as never);
}
