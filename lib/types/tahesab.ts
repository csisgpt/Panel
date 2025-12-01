import { TahesabAssetType, TahesabDocumentSummary } from "@/lib/types/backend";

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

export type TahesabLogLevel = "INFO" | "WARN" | "ERROR";

export interface TahesabLog {
  id: string;
  time: string;
  level: TahesabLogLevel;
  operation: string;
  entityType?: "trade" | "deposit" | "withdrawal" | "remittance" | "balance" | "none";
  internalRef?: string;
  tahesabDocumentId?: string;
  message: string;
}

export interface TahesabMapping {
  id: string;
  internalName: string;
  internalCode: string;
  tahesabCode?: string;
  type: "ACCOUNT" | "INSTRUMENT" | "CUSTOMER";
  status: "MAPPED" | "UNMAPPED" | "IGNORED";
}

export interface TahesabBalanceInternalItem {
  id: string;
  type: "trade" | "deposit" | "withdrawal" | "remittance";
  date: string;
  amount: number;
  assetType: TahesabAssetType;
  description?: string;
}

export interface TahesabBalanceBreakdown {
  recordId: string;
  internalItems: TahesabBalanceInternalItem[];
  tahesabDocumentIds: string[];
}

export interface TahesabCustomerDocument extends TahesabDocumentSummary {
  documentNo: TahesabDocumentSummary["documentNumber"];
  totalWeight?: number;
}

export type CreateTahesabCustomerPayload = Omit<TahesabCustomer, "code"> & { code?: string };
export type UpdateTahesabCustomerPayload = Partial<Omit<TahesabCustomer, "code">>;
