import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import {
  getMockTahesabBalances,
  getMockTahesabBalancesByCustomer,
  getMockTahesabBalanceBreakdown,
  getMockTahesabBankAccounts,
  getMockTahesabBankBalances,
  getMockTahesabCoinTypes,
  getMockTahesabCustomerBalances,
  getMockTahesabCustomerByCode,
  getMockTahesabCustomerDocuments,
  getMockTahesabCustomers,
  getMockTahesabDocuments,
  getMockTahesabDocumentsByRef,
  getMockTahesabFinishedInventory,
  getMockTahesabGoldInventory,
  getMockTahesabLogs,
  getMockTahesabMappings,
  getMockTahesabRawDocumentById,
  getMockTahesabRawDocuments,
  getMockTahesabSyncStatus,
  getMockTahesabTagByCode,
  getMockTahesabTags,
  getMockTahesabTaraz,
  getMockTahesabWorkNames,
  mockCreateTahesabDocument,
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

export interface TahesabCustomer {
  code: string;
  name: string;
  groupId?: string;
  groupName?: string;
  mobile?: string;
  nationalId?: string;
  city?: string;
  address?: string;
  defaultMetal?: string;
}

export interface TahesabCustomerBalance {
  currency?: string;
  monetaryBalance?: number;
  goldWeightBalance?: number;
  silverWeightBalance?: number;
  metal?: string;
  type?: string;
  [key: string]: unknown;
}

export interface TahesabCustomerBalancePoint {
  date: string;
  monetaryBalance?: number;
  goldWeightBalance?: number;
}

export interface TahesabBankBalance {
  bankName: string;
  accountNumber?: string;
  balance: number;
  totalDeposit?: number;
  totalWithdraw?: number;
}

export interface TahesabGoldInventoryItem {
  metal: string;
  ayar: number;
  weight: number;
}

export interface TahesabFinishedInventoryItem {
  workName: string;
  metal?: string;
  availableWeight?: number;
  availableCount?: number;
}

export interface TahesabTarazCoinItem {
  name: string;
  quantity: number;
  value: number;
}

export interface TahesabTarazCurrencyItem {
  code: string;
  quantity: number;
  value: number;
}

export interface TahesabTarazSummary {
  totalGoldWeight: number;
  totalGoldValue: number;
  totalCurrencyValue: number;
  coins: TahesabTarazCoinItem[];
  currencies: TahesabTarazCurrencyItem[];
}

export interface TahesabCoinType {
  name: string;
  weight?: number;
  ayar?: number;
  description?: string;
}

export interface TahesabBankAccount {
  bankName: string;
  accountNumber: string;
  iban?: string;
  branch?: string;
}

export interface TahesabWorkName {
  workName: string;
  metal?: string;
  category?: string;
}

export interface TahesabTag {
  code: string;
  workCode?: string;
  name?: string;
  ayar?: number;
  weight?: number;
  makingCost?: number;
  onlinePrice?: number;
  displayPrice?: number;
  hasPhoto?: boolean;
  isInStock?: boolean;
  rfid?: string | null;
}

export interface TahesabTagDetail extends TahesabTag {
  description?: string;
  pricingBreakdown?: {
    weight?: number;
    makingCost?: number;
    tax?: number;
    profit?: number;
  };
  imageBase64?: string;
  imageUrl?: string;
}

export interface TahesabRawDocumentSummary {
  id: string;
  documentNo: string;
  date: string;
  customerCode?: string;
  customerName?: string;
  type: string;
  metal?: string;
  amount?: number;
  weight?: number;
}

export interface TahesabRawDocumentLine {
  rowNo: number;
  description?: string;
  amount?: number;
  weight?: number;
  metal?: string;
}

export interface TahesabRawDocumentDetail extends TahesabRawDocumentSummary {
  lines: TahesabRawDocumentLine[];
  rawPayload?: unknown;
}

export interface CreateTahesabCustomerPayload extends Omit<TahesabCustomer, "code"> {
  code?: string;
}

export type UpdateTahesabCustomerPayload = Partial<Omit<TahesabCustomer, "code">>;

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

export async function getTahesabCustomers(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
  groupId?: string;
}): Promise<TahesabCustomer[]> {
  if (isMockMode()) return getMockTahesabCustomers(params);
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.pageSize) query.append("pageSize", String(params.pageSize));
  if (params?.groupId) query.append("groupId", params.groupId);
  const qs = query.toString();
  return apiGet(`/tahesab/customers${qs ? `?${qs}` : ""}`);
}

export async function getTahesabCustomerByCode(code: string): Promise<TahesabCustomer | null> {
  if (isMockMode()) return getMockTahesabCustomerByCode(code);
  return apiGet(`/tahesab/customers/${code}`);
}

export async function createTahesabCustomer(payload: CreateTahesabCustomerPayload): Promise<TahesabCustomer> {
  if (isMockMode()) return (await import("@/lib/mock-data")).createMockTahesabCustomer(payload);
  // TODO: wire to backend endpoint
  return apiPost(`/tahesab/customers`, payload);
}

export async function updateTahesabCustomer(
  code: string,
  payload: UpdateTahesabCustomerPayload
): Promise<TahesabCustomer> {
  if (isMockMode()) return (await import("@/lib/mock-data")).updateMockTahesabCustomer(code, payload);
  // TODO: wire to backend endpoint
  return apiPatch(`/tahesab/customers/${code}`, payload);
}

export async function getTahesabCustomerBalances(
  code: string,
  params?: { toDate?: string }
): Promise<TahesabCustomerBalance[]> {
  if (isMockMode()) return getMockTahesabCustomerBalances(code);
  const query = new URLSearchParams();
  if (params?.toDate) query.append("toDate", params.toDate);
  const qs = query.toString();
  return apiGet<TahesabCustomerBalance[]>(`/tahesab/customers/${code}/balances${qs ? `?${qs}` : ""}`);
}

export async function getTahesabCustomerDocuments(
  code: string,
  params?: { fromDate?: string; toDate?: string; type?: string }
): Promise<TahesabRawDocumentSummary[]> {
  if (isMockMode()) return getMockTahesabCustomerDocuments(code);
  const query = new URLSearchParams();
  if (params?.fromDate) query.append("fromDate", params.fromDate);
  if (params?.toDate) query.append("toDate", params.toDate);
  if (params?.type) query.append("type", params.type);
  const qs = query.toString();
  return apiGet<TahesabRawDocumentSummary[]>(`/tahesab/customers/${code}/documents${qs ? `?${qs}` : ""}`);
}

export async function getTahesabBankBalances(params?: { fromDate?: string; toDate?: string }): Promise<TahesabBankBalance[]> {
  if (isMockMode()) return getMockTahesabBankBalances();
  const query = new URLSearchParams();
  if (params?.fromDate) query.append("fromDate", params.fromDate);
  if (params?.toDate) query.append("toDate", params.toDate);
  const qs = query.toString();
  return apiGet<TahesabBankBalance[]>(`/tahesab/balances/banks${qs ? `?${qs}` : ""}`);
}

export async function getTahesabGoldInventory(params?: { metal?: string; ayar?: number }): Promise<TahesabGoldInventoryItem[]> {
  if (isMockMode()) return getMockTahesabGoldInventory();
  const query = new URLSearchParams();
  if (params?.metal) query.append("metal", params.metal);
  if (params?.ayar) query.append("ayar", String(params.ayar));
  const qs = query.toString();
  return apiGet<TahesabGoldInventoryItem[]>(`/tahesab/inventory/gold${qs ? `?${qs}` : ""}`);
}

export async function getTahesabFinishedInventory(params?: { metal?: string }): Promise<TahesabFinishedInventoryItem[]> {
  if (isMockMode()) return getMockTahesabFinishedInventory();
  const query = new URLSearchParams();
  if (params?.metal) query.append("metal", params.metal);
  const qs = query.toString();
  return apiGet<TahesabFinishedInventoryItem[]>(`/tahesab/inventory/finished${qs ? `?${qs}` : ""}`);
}

export async function getTahesabTarazSummary(): Promise<TahesabTarazSummary> {
  if (isMockMode()) return getMockTahesabTaraz();
  return apiGet<TahesabTarazSummary>("/tahesab/taraz");
}

export async function getTahesabCoinTypes(): Promise<TahesabCoinType[]> {
  if (isMockMode()) return getMockTahesabCoinTypes();
  return apiGet<TahesabCoinType[]>("/tahesab/master/coins");
}

export async function getTahesabBankAccounts(): Promise<TahesabBankAccount[]> {
  if (isMockMode()) return getMockTahesabBankAccounts();
  return apiGet<TahesabBankAccount[]>("/tahesab/master/bank-accounts");
}

export async function getTahesabWorkNames(): Promise<TahesabWorkName[]> {
  if (isMockMode()) return getMockTahesabWorkNames();
  return apiGet<TahesabWorkName[]>("/tahesab/master/work-names");
}

export async function getTahesabTags(params?: {
  fromCode?: string;
  toCode?: string;
  updatedFrom?: string;
  withPhoto?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<TahesabTag[]> {
  if (isMockMode()) return getMockTahesabTags();
  const query = new URLSearchParams();
  if (params?.fromCode) query.append("fromCode", params.fromCode);
  if (params?.toCode) query.append("toCode", params.toCode);
  if (params?.updatedFrom) query.append("updatedFrom", params.updatedFrom);
  if (params?.withPhoto !== undefined) query.append("withPhoto", String(params.withPhoto));
  if (params?.page) query.append("page", String(params.page));
  if (params?.pageSize) query.append("pageSize", String(params.pageSize));
  const qs = query.toString();
  return apiGet<TahesabTag[]>(`/tahesab/tags${qs ? `?${qs}` : ""}`);
}

export async function getTahesabTagByCode(code: string, params?: { withPhoto?: boolean }): Promise<TahesabTagDetail | null> {
  if (isMockMode()) return getMockTahesabTagByCode(code);
  const query = new URLSearchParams();
  if (params?.withPhoto) query.append("withPhoto", "true");
  const qs = query.toString();
  return apiGet<TahesabTagDetail | null>(`/tahesab/tags/${code}${qs ? `?${qs}` : ""}`);
}

export async function clearTahesabTagRFID(code: string) {
  if (isMockMode()) return { success: true };
  // TODO: wire to backend endpoint
  return apiPost(`/tahesab/tags/${code}/clear-rfid`, {} as never);
}

export async function getTahesabRawDocuments(params?: {
  countLast?: number;
  customerCode?: string;
  fromDate?: string;
  toDate?: string;
  metal?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<TahesabRawDocumentSummary[]> {
  if (isMockMode()) return getMockTahesabRawDocuments();
  const query = new URLSearchParams();
  if (params?.countLast) query.append("countLast", String(params.countLast));
  if (params?.customerCode) query.append("customerCode", params.customerCode);
  if (params?.fromDate) query.append("fromDate", params.fromDate);
  if (params?.toDate) query.append("toDate", params.toDate);
  if (params?.metal) query.append("metal", params.metal);
  if (params?.type) query.append("type", params.type);
  if (params?.page) query.append("page", String(params.page));
  if (params?.pageSize) query.append("pageSize", String(params.pageSize));
  const qs = query.toString();
  return apiGet<TahesabRawDocumentSummary[]>(`/tahesab/raw-documents${qs ? `?${qs}` : ""}`);
}

export async function getTahesabRawDocumentById(id: string): Promise<TahesabRawDocumentDetail | null> {
  if (isMockMode()) return getMockTahesabRawDocumentById(id);
  return apiGet<TahesabRawDocumentDetail | null>(`/tahesab/raw-documents/${id}`);
}

export async function createTahesabGoldDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  // TODO: wire to backend endpoint
  return apiPost(`/tahesab/manual/gold`, payload);
}

export async function createTahesabCoinDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  // TODO: wire to backend endpoint
  return apiPost(`/tahesab/manual/coin`, payload);
}

export async function createTahesabCashDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/cash`, payload);
}

export async function createTahesabBankDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/bank`, payload);
}

export async function createTahesabDiscountDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/discount`, payload);
}

export async function createTahesabDebtCreditDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/debt-credit`, payload);
}

export async function createTahesabFinishedDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/finished`, payload);
}

export async function createTahesabTagDocument(payload: Record<string, unknown>) {
  if (isMockMode()) return mockCreateTahesabDocument();
  return apiPost(`/tahesab/manual/tags`, payload);
}
