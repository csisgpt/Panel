// این فایل ساختار انواع و اینترفیس‌های فرانت‌اند را با مدل‌ها و DTOهای بک‌اند Gold-nest هماهنگ می‌کند.

export enum UserRole {
  ADMIN = "ADMIN",
  TRADER = "TRADER",
  CLIENT = "CLIENT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
}

export enum InstrumentType {
  FIAT = "FIAT",
  GOLD = "GOLD",
  COIN = "COIN",
  OTHER = "OTHER",
}

export enum InstrumentUnit {
  GRAM_750_EQ = "GRAM_750_EQ",
  PIECE = "PIECE",
  CURRENCY = "CURRENCY",
}

export enum TradeSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum TradeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED_BY_USER = "CANCELLED_BY_USER",
  CANCELLED_BY_ADMIN = "CANCELLED_BY_ADMIN",
  SETTLED = "SETTLED",
}

export enum SettlementMethod {
  WALLET = "WALLET",
  EXTERNAL = "EXTERNAL",
  CASH = "CASH",
}

export enum AccountTxType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  TRADE_DEBIT = "TRADE_DEBIT",
  TRADE_CREDIT = "TRADE_CREDIT",
  ADJUSTMENT = "ADJUSTMENT",
  FEE = "FEE",
}

export enum TxRefType {
  TRADE = "TRADE",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  ADJUSTMENT = "ADJUSTMENT",
  GOLD_LOT = "GOLD_LOT",
  REMITTANCE = "REMITTANCE",
}

export enum DepositStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum WithdrawStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum TahesabDocumentType {
  BUY = "BUY",
  SELL = "SELL",
  REMITTANCE = "REMITTANCE",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  ADJUSTMENT = "ADJUSTMENT",
  FEE = "FEE",
  TAX = "TAX",
}

export enum TahesabDocumentStatus {
  POSTED = "POSTED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export type TahesabAssetType = "GOLD" | "COIN" | "CURRENCY" | "SILVER" | "PLATINUM";

export enum GoldLotStatus {
  IN_VAULT = "IN_VAULT",
  SOLD = "SOLD",
  WITHDRAWN = "WITHDRAWN",
  MELTED = "MELTED",
}

export enum AttachmentEntityType {
  TRADE = "TRADE",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  GOLD_LOT = "GOLD_LOT",
  REMITTANCE = "REMITTANCE",
}

export interface BackendUser {
  id: string;
  createdAt: string;
  updatedAt: string;

  fullName: string;
  mobile: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface Instrument {
  id: string;
  createdAt: string;
  updatedAt: string;

  code: string;
  name: string;
  type: InstrumentType;
  unit: InstrumentUnit;
}

export interface InstrumentPrice {
  id: string;
  createdAt: string;
  instrumentId: string;
  buyPrice: string;
  sellPrice: string;
  source?: string | null;
  instrument?: Instrument;
}

export interface Account {
  id: string;
  createdAt: string;
  updatedAt: string;

  userId: string | null;
  instrumentId: string;

  balance: string;
  blockedBalance: string;
  minBalance: string;

  instrument?: Instrument;
  user?: BackendUser | null;
}

export interface AccountTx {
  id: string;
  createdAt: string;
  accountId: string;
  delta: string;
  type: AccountTxType;
  refType: TxRefType;
  refId?: string | null;
  createdById?: string | null;
}

export interface Trade {
  id: string;
  createdAt: string;
  updatedAt: string;

  clientId: string;
  instrumentId: string;
  side: TradeSide;
  status: TradeStatus;
  settlementMethod: SettlementMethod;

  quantity: string;
  pricePerUnit: string;
  totalAmount: string;

  clientNote?: string | null;
  adminNote?: string | null;

  settlementDate?: string | null;

  approvedAt?: string | null;
  approvedById?: string | null;

  rejectedAt?: string | null;
  rejectReason?: string | null;

  client?: BackendUser;
  instrument?: Instrument;
  approvedBy?: BackendUser | null;
}

export interface DepositRequest {
  id: string;
  createdAt: string;
  updatedAt: string;

  userId: string;
  amount: string;
  method: string;
  status: DepositStatus;

  refNo?: string | null;
  note?: string | null;

  processedAt?: string | null;
  processedById?: string | null;

  accountTxId?: string | null;
  user?: BackendUser;
}

export interface WithdrawRequest {
  id: string;
  createdAt: string;
  updatedAt: string;

  userId: string;
  amount: string;
  status: WithdrawStatus;

  bankName?: string | null;
  iban?: string | null;
  cardNumber?: string | null;
  note?: string | null;

  processedAt?: string | null;
  processedById?: string | null;
  accountTxId?: string | null;
  user?: BackendUser;
}

export interface GoldLot {
  id: string;
  createdAt: string;
  updatedAt: string;

  userId: string;
  grossWeight: string;
  karat: number;
  equivGram750: string;
  status: GoldLotStatus;

  note?: string | null;
  user?: BackendUser;
}

export interface FileMeta {
  id: string;
  createdAt: string;

  uploadedById: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  label?: string | null;
}

export interface Attachment {
  id: string;
  createdAt: string;

  fileId: string;
  entityType: AttachmentEntityType;
  entityId: string;
  purpose?: string | null;

  file?: FileMeta;
}

export interface SystemStatus {
  tahesabOnline: boolean;
  lastSyncAt: string;
}

export interface LoginDto {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: BackendUser;
}

export interface CreateTradeDto {
  instrumentCode: string;
  side: TradeSide;
  settlementMethod: SettlementMethod;
  quantity: string;
  pricePerUnit: string;
  clientNote?: string;
  fileIds?: string[];
}

export interface CreateDepositDto {
  userId: string;
  amount: string;
  method: string;
  refNo?: string;
  note?: string;
  fileIds?: string[];
}

export interface CreateWithdrawalDto {
  userId: string;
  amount: string;
  bankName?: string;
  iban?: string;
  cardNumber?: string;
  note?: string;
  fileIds?: string[];
}

export interface CreateGoldLotDto {
  userId: string;
  grossWeight: string;
  karat: number;
  note?: string;
  fileIds?: string[];
}

export interface CreateUserDto {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface TahesabDocumentLine {
  lineId: string;
  assetType: TahesabAssetType;
  instrumentName?: string;
  weight?: number;
  quantity?: number;
  unitPrice?: number;
  tax?: number;
  discount?: number;
  amount: number;
  note?: string;
}

export interface TahesabDocumentSummary {
  id: string;
  documentNumber: string;
  date: string;
  customerId?: string;
  tahesabAccountCode?: string;
  type: TahesabDocumentType;
  status: TahesabDocumentStatus;
  totalAmount: number;
  totalWeight?: number;
  internalEntityRef?: {
    type: "trade" | "deposit" | "withdrawal" | "remittance";
    id: string;
  } | null;
}

export interface TahesabDocumentDetail extends TahesabDocumentSummary {
  lines: TahesabDocumentLine[];
  rawPayload?: Record<string, unknown>;
}

export interface TahesabBalanceRecord {
  id: string;
  customerId?: string;
  customerName?: string;
  tahesabAccountCode: string;
  assetType: TahesabAssetType;
  balanceInternal: number;
  balanceTahesab: number;
  difference: number;
  lastSyncedAt: string;
}

export interface TahesabSyncStatus {
  connected: boolean;
  lastSyncedAt: string;
  lastSuccessfulSyncAt?: string;
  nextScheduledAt?: string;
  queueLength?: number;
  pendingSince?: string;
  errorMessage?: string | null;
}

export interface TahesabSyncLogEntry {
  id: string;
  time: string;
  operation: string;
  status: "success" | "error" | "pending";
  message: string;
  internalEntityRef?: TahesabDocumentSummary["internalEntityRef"];
  tahesabDocumentId?: string;
}
