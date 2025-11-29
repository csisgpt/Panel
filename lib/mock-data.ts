// lib/mock-data.ts
// Mock layer aligned with backend types (Gold-nest).
// All monetary / decimal fields are strings, all dates are ISO strings.

import {
  Account,
  AccountTx,
  AccountTxType,
  Attachment,
  AttachmentEntityType,
  BackendUser,
  CreateDepositDto,
  CreateGoldLotDto,
  CreateTradeDto,
  CreateUserDto,
  CreateWithdrawalDto,
  DepositRequest,
  DepositStatus,
  FileMeta,
  GoldLot,
  GoldLotStatus,
  Instrument,
  InstrumentPrice,
  InstrumentType,
  InstrumentUnit,
  LoginDto,
  LoginResponse,
  SettlementMethod,
  SystemStatus,
  TahesabAssetType,
  TahesabBalanceRecord,
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  TahesabDocumentType,
  TahesabSyncStatus,
  Trade,
  TradeSide,
  TradeStatus,
  TxRefType,
  UpdateUserDto,
  UserRole,
  UserStatus,
  WithdrawRequest,
  WithdrawStatus,
} from "@/lib/types/backend";

export enum RemittanceStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Remittance {
  id: string;
  customerId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  status: RemittanceStatus;
  description?: string;
  createdAt: string;
}

export type TahesabLogLevel = "info" | "warn" | "error";

export interface TahesabLog {
  id: string;
  time: string;
  level: TahesabLogLevel;
  message: string;
  entityRef?: string;
}

export interface TahesabMapping {
  id: string;
  internalAccount: string;
  tahesabCode: string;
  type: "HOUSE" | "CLIENT";
  status: "ACTIVE" | "DISABLED";
}

export interface RiskSettingsConfig {
  globalMaxExposure: number;
  maxExposurePerClient: number;
  maxOpenTradesPerClient: number;
  updatedAt: string;
}

export interface PricingLog {
  id: string;
  createdAt: string;
  userId: string;
  description: string;
  affectedInstrumentIds: string[];
}

export interface AdminUiSettings {
  theme: "light" | "dark" | "system";
  language: "fa";
  dateFormat: "jalali" | "gregorian";
  showExperimentalFeatures: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date();
const isoNow = now.toISOString();

const daysAgo = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

async function simulateDelay(ms = 250) {
  if (typeof window === "undefined") return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

let mockUsers: BackendUser[] = [
  {
    id: "u-admin",
    createdAt: daysAgo(28),
    updatedAt: isoNow,
    fullName: "مریم مدیری",
    mobile: "09120000000",
    email: "admin@gold.test",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-ops",
    createdAt: daysAgo(15),
    updatedAt: isoNow,
    fullName: "حمید عملیات",
    mobile: "09125551234",
    email: "ops@gold.test",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-trader",
    createdAt: daysAgo(20),
    updatedAt: isoNow,
    fullName: "معامله‌گر نمونه",
    mobile: "09121111111",
    email: "trader@gold.test",
    role: UserRole.TRADER,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-trader-2",
    createdAt: daysAgo(5),
    updatedAt: isoNow,
    fullName: "نسترن طلایی",
    mobile: "09129876543",
    email: "n.tala@gold.test",
    role: UserRole.TRADER,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-client",
    createdAt: daysAgo(18),
    updatedAt: isoNow,
    fullName: "زهرا رضایی",
    mobile: "09122222222",
    email: "zahra@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-client-2",
    createdAt: daysAgo(9),
    updatedAt: isoNow,
    fullName: "رضا کریمی",
    mobile: "09123334455",
    email: "reza@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.BLOCKED,
  },
  {
    id: "u-client-3",
    createdAt: daysAgo(2),
    updatedAt: isoNow,
    fullName: "سارا احمدی",
    mobile: "09127778899",
    email: "s.ahmadi@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.PENDING_APPROVAL,
  },
  {
    id: "u-client-4",
    createdAt: daysAgo(7),
    updatedAt: isoNow,
    fullName: "علی موسوی",
    mobile: "09124561234",
    email: "ali.m@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-client-5",
    createdAt: daysAgo(25),
    updatedAt: isoNow,
    fullName: "لیلا اسلامی",
    mobile: "09127654321",
    email: "leila@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.BLOCKED,
  },
  {
    id: "u-trader-3",
    createdAt: daysAgo(30),
    updatedAt: isoNow,
    fullName: "مهسا دادفر",
    mobile: "09121004567",
    email: "mahsa.trader@gold.test",
    role: UserRole.TRADER,
    status: UserStatus.ACTIVE,
  },
];

export async function mockLogin(dto: LoginDto): Promise<LoginResponse> {
  await simulateDelay();
  const user =
    mockUsers.find((u) => u.mobile === dto.mobile) ?? mockUsers[0];

  return {
    accessToken: `mock-token-${user.id}`,
    user,
  };
}

export async function getMockUsers(): Promise<BackendUser[]> {
  await simulateDelay();
  return [...mockUsers];
}

export async function getMockUser(id: string): Promise<BackendUser> {
  await simulateDelay();
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function createMockUser(
  dto: CreateUserDto
): Promise<BackendUser> {
  await simulateDelay();
  const user: BackendUser = {
    id: createId("u"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: dto.fullName,
    mobile: dto.mobile,
    email: dto.email,
    role: dto.role,
    status: UserStatus.ACTIVE,
  };
  mockUsers.push(user);
  return user;
}

export async function updateMockUser(
  id: string,
  dto: UpdateUserDto
): Promise<BackendUser> {
  await simulateDelay();
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) {
    throw new Error("User not found");
  }
  const current = mockUsers[idx];
  const updated: BackendUser = {
    ...current,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
  mockUsers[idx] = updated;
  return updated;
}

// ---------------------------------------------------------------------------
// Instruments & Prices
// ---------------------------------------------------------------------------

const mockInstruments: Instrument[] = [
  {
    id: "ins-irr",
    createdAt: isoNow,
    updatedAt: isoNow,
    code: "IRR",
    name: "ریال ایران",
    type: InstrumentType.FIAT,
    unit: InstrumentUnit.CURRENCY,
  },
  {
    id: "ins-gold-750",
    createdAt: isoNow,
    updatedAt: isoNow,
    code: "GOLD_750_EQ",
    name: "طلای ۱۸ عیار معادل ۷۵۰",
    type: InstrumentType.GOLD,
    unit: InstrumentUnit.GRAM_750_EQ,
  },
  {
    id: "ins-emami",
    createdAt: isoNow,
    updatedAt: isoNow,
    code: "SEKE_EMAMI",
    name: "سکه امامی",
    type: InstrumentType.COIN,
    unit: InstrumentUnit.PIECE,
  },
];

let mockInstrumentPrices: InstrumentPrice[] = [
  {
    id: "pr-irr",
    createdAt: isoNow,
    instrumentId: "ins-irr",
    buyPrice: "1",
    sellPrice: "1",
    source: "mock",
    instrument: mockInstruments[0],
  },
  {
    id: "pr-gold-750",
    createdAt: isoNow,
    instrumentId: "ins-gold-750",
    buyPrice: "36250000",
    sellPrice: "36880000",
    source: "mock",
    instrument: mockInstruments[1],
  },
  {
    id: "pr-emami",
    createdAt: isoNow,
    instrumentId: "ins-emami",
    buyPrice: "428500000",
    sellPrice: "435000000",
    source: "mock",
    instrument: mockInstruments[2],
  },
];

export async function getMockInstruments(): Promise<Instrument[]> {
  await simulateDelay();
  return [...mockInstruments];
}

export async function getMockInstrumentPrices(): Promise<InstrumentPrice[]> {
  await simulateDelay();
  return [...mockInstrumentPrices];
}

// ---------------------------------------------------------------------------
// Accounts & AccountTx
// ---------------------------------------------------------------------------

let mockAccounts: Account[] = [
  {
    id: "acc-1",
    createdAt: daysAgo(18),
    updatedAt: isoNow,
    userId: "u-client",
    instrumentId: "ins-irr",
    balance: "256000000",
    blockedBalance: "15000000",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client"),
  },
  {
    id: "acc-2",
    createdAt: daysAgo(17),
    updatedAt: isoNow,
    userId: "u-client",
    instrumentId: "ins-gold-750",
    balance: "142.8",
    blockedBalance: "5.5",
    minBalance: "0",
    instrument: mockInstruments[1],
    user: mockUsers.find((u) => u.id === "u-client"),
  },
  {
    id: "acc-3",
    createdAt: daysAgo(8),
    updatedAt: isoNow,
    userId: "u-client-2",
    instrumentId: "ins-irr",
    balance: "82000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client-2"),
  },
  {
    id: "acc-4",
    createdAt: daysAgo(8),
    updatedAt: isoNow,
    userId: "u-client-2",
    instrumentId: "ins-emami",
    balance: "15",
    blockedBalance: "2",
    minBalance: "0",
    instrument: mockInstruments[2],
    user: mockUsers.find((u) => u.id === "u-client-2"),
  },
  {
    id: "acc-5",
    createdAt: daysAgo(2),
    updatedAt: isoNow,
    userId: "u-client-3",
    instrumentId: "ins-irr",
    balance: "45000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client-3"),
  },
  {
    id: "acc-6",
    createdAt: daysAgo(7),
    updatedAt: isoNow,
    userId: "u-client-4",
    instrumentId: "ins-irr",
    balance: "465000000",
    blockedBalance: "25000000",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client-4"),
  },
  {
    id: "acc-7",
    createdAt: daysAgo(7),
    updatedAt: isoNow,
    userId: "u-client-4",
    instrumentId: "ins-gold-750",
    balance: "86.4",
    blockedBalance: "2.5",
    minBalance: "0",
    instrument: mockInstruments[1],
    user: mockUsers.find((u) => u.id === "u-client-4"),
  },
  {
    id: "acc-8",
    createdAt: daysAgo(26),
    updatedAt: isoNow,
    userId: "u-client-5",
    instrumentId: "ins-emami",
    balance: "14",
    blockedBalance: "2",
    minBalance: "0",
    instrument: mockInstruments[2],
    user: mockUsers.find((u) => u.id === "u-client-5"),
  },
  {
    id: "acc-9",
    createdAt: daysAgo(26),
    updatedAt: isoNow,
    userId: "u-client-5",
    instrumentId: "ins-irr",
    balance: "195000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client-5"),
  },
  {
    id: "acc-house-irr",
    createdAt: isoNow,
    updatedAt: isoNow,
    userId: null,
    instrumentId: "ins-irr",
    balance: "100000000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: null,
  },
];

let mockAccountTx: AccountTx[] = [
  {
    id: "tx-1",
    createdAt: daysAgo(14),
    accountId: "acc-1",
    delta: "-50000000",
    type: AccountTxType.WITHDRAW,
    refType: TxRefType.WITHDRAW,
    refId: "w-1",
    createdById: "u-admin",
  },
  {
    id: "tx-2",
    createdAt: daysAgo(13),
    accountId: "acc-1",
    delta: "200000000",
    type: AccountTxType.DEPOSIT,
    refType: TxRefType.DEPOSIT,
    refId: "d-1",
    createdById: "u-admin",
  },
  {
    id: "tx-3",
    createdAt: daysAgo(6),
    accountId: "acc-2",
    delta: "-10.5",
    type: AccountTxType.TRADE_DEBIT,
    refType: TxRefType.TRADE,
    refId: "t-2",
    createdById: "u-trader",
  },
  {
    id: "tx-4",
    createdAt: daysAgo(4),
    accountId: "acc-4",
    delta: "3",
    type: AccountTxType.ADJUSTMENT,
    refType: TxRefType.TRADE,
    refId: "t-4",
    createdById: "u-ops",
  },
  {
    id: "tx-5",
    createdAt: daysAgo(6),
    accountId: "acc-6",
    delta: "480000000",
    type: AccountTxType.DEPOSIT,
    refType: TxRefType.DEPOSIT,
    refId: "d-4",
    createdById: "u-admin",
  },
  {
    id: "tx-6",
    createdAt: daysAgo(21),
    accountId: "acc-9",
    delta: "950000000",
    type: AccountTxType.DEPOSIT,
    refType: TxRefType.DEPOSIT,
    refId: "d-5",
    createdById: "u-ops",
  },
  {
    id: "tx-7",
    createdAt: daysAgo(4),
    accountId: "acc-7",
    delta: "-3",
    type: AccountTxType.TRADE_DEBIT,
    refType: TxRefType.TRADE,
    refId: "t-6",
    createdById: "u-trader-3",
  },
  {
    id: "tx-8",
    createdAt: daysAgo(3),
    accountId: "acc-2",
    delta: "10.5",
    type: AccountTxType.TRADE_CREDIT,
    refType: TxRefType.TRADE,
    refId: "t-2",
    createdById: "u-trader",
  },
  {
    id: "tx-9",
    createdAt: daysAgo(2),
    accountId: "acc-7",
    delta: "3",
    type: AccountTxType.TRADE_CREDIT,
    refType: TxRefType.TRADE,
    refId: "t-6",
    createdById: "u-trader-3",
  },
];

export async function getMockAccounts(): Promise<Account[]> {
  await simulateDelay();
  return [...mockAccounts];
}

export async function getMockAccountsByUser(
  userId: string | "house"
): Promise<Account[]> {
  await simulateDelay();
  if (userId === "house") {
    return mockAccounts.filter((a) => a.userId === null);
  }
  return mockAccounts.filter((a) => a.userId === userId);
}

export async function getMockAccountTx(accountId: string): Promise<AccountTx[]> {
  await simulateDelay();
  return mockAccountTx.filter((tx) => tx.accountId === accountId);
}

// ---------------------------------------------------------------------------
// Trades
// ---------------------------------------------------------------------------

let mockTrades: Trade[] = [
  {
    id: "t-1",
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
    clientId: "u-client",
    instrumentId: "ins-gold-750",
    side: TradeSide.BUY,
    status: TradeStatus.APPROVED,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "10",
    pricePerUnit: "36000000",
    totalAmount: "360000000",
    clientNote: "خرید جهت تحویل فوری",
    adminNote: "اوکی",
    approvedAt: daysAgo(11),
    approvedById: "u-admin",
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client")!,
    instrument: mockInstruments[1],
  },
  {
    id: "t-2",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    clientId: "u-client",
    instrumentId: "ins-gold-750",
    side: TradeSide.SELL,
    status: TradeStatus.PENDING,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "8.5",
    pricePerUnit: "36500000",
    totalAmount: "310250000",
    clientNote: "فروش بخشی از موجودی",
    adminNote: null,
    approvedAt: null,
    approvedById: null,
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client")!,
    instrument: mockInstruments[1],
  },
  {
    id: "t-3",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    clientId: "u-client-2",
    instrumentId: "ins-emami",
    side: TradeSide.BUY,
    status: TradeStatus.APPROVED,
    settlementMethod: SettlementMethod.EXTERNAL,
    quantity: "5",
    pricePerUnit: "430000000",
    totalAmount: "2150000000",
    clientNote: "خرید سکه سرمایه‌ای",
    adminNote: "تسویه بانکی شد",
    approvedAt: daysAgo(2),
    approvedById: "u-ops",
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client-2")!,
    instrument: mockInstruments[2],
  },
  {
    id: "t-4",
    createdAt: daysAgo(1),
    updatedAt: isoNow,
    clientId: "u-client-3",
    instrumentId: "ins-irr",
    side: TradeSide.SELL,
    status: TradeStatus.REJECTED,
    settlementMethod: SettlementMethod.CASH,
    quantity: "90000000",
    pricePerUnit: "1",
    totalAmount: "90000000",
    clientNote: "فروش ریال",
    adminNote: "رد شد به دلیل سقف",
    approvedAt: null,
    approvedById: null,
    rejectedAt: isoNow,
    rejectReason: "مغایرت اطلاعات حساب",
    client: mockUsers.find((u) => u.id === "u-client-3")!,
    instrument: mockInstruments[0],
  },
  {
    id: "t-5",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
    clientId: "u-client-4",
    instrumentId: "ins-gold-750",
    side: TradeSide.BUY,
    status: TradeStatus.SETTLED,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "25",
    pricePerUnit: "35800000",
    totalAmount: "895000000",
    clientNote: "خرید جهت تحویل آتی",
    adminNote: "تسویه شد",
    approvedAt: daysAgo(8),
    approvedById: "u-admin",
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client-4")!,
    instrument: mockInstruments[1],
  },
  {
    id: "t-6",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    clientId: "u-client-4",
    instrumentId: "ins-emami",
    side: TradeSide.SELL,
    status: TradeStatus.PENDING,
    settlementMethod: SettlementMethod.EXTERNAL,
    quantity: "3",
    pricePerUnit: "440000000",
    totalAmount: "1320000000",
    clientNote: "فروش جهت نقدینگی",
    adminNote: null,
    approvedAt: null,
    approvedById: null,
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client-4")!,
    instrument: mockInstruments[2],
  },
  {
    id: "t-7",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(19),
    clientId: "u-client-5",
    instrumentId: "ins-emami",
    side: TradeSide.BUY,
    status: TradeStatus.APPROVED,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "10",
    pricePerUnit: "425000000",
    totalAmount: "4250000000",
    clientNote: "سرمایه‌گذاری خانوادگی",
    adminNote: "پرداخت کامل انجام شد",
    approvedAt: daysAgo(19),
    approvedById: "u-ops",
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client-5")!,
    instrument: mockInstruments[2],
  },
  {
    id: "t-8",
    createdAt: daysAgo(0),
    updatedAt: isoNow,
    clientId: "u-client-5",
    instrumentId: "ins-gold-750",
    side: TradeSide.SELL,
    status: TradeStatus.CANCELLED_BY_USER,
    settlementMethod: SettlementMethod.CASH,
    quantity: "5",
    pricePerUnit: "37000000",
    totalAmount: "185000000",
    clientNote: "لغو توسط مشتری",
    adminNote: "در انتظار تایید لغو",
    approvedAt: null,
    approvedById: null,
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client-5")!,
    instrument: mockInstruments[1],
  },
];

export async function getMockTrades(): Promise<Trade[]> {
  await simulateDelay();
  return [...mockTrades];
}

export async function getMockTradeById(id: string): Promise<Trade> {
  await simulateDelay();
  const trade = mockTrades.find((t) => t.id === id);
  if (!trade) {
    throw new Error("Trade not found");
  }
  return trade;
}

export async function createMockTrade(
  dto: CreateTradeDto
): Promise<Trade> {
  await simulateDelay();

  const instrument =
    mockInstruments.find((ins) => ins.code === dto.instrumentCode) ??
    mockInstruments[1];

  const quantity = Number(dto.quantity || "0");
  const price = Number(dto.pricePerUnit || "0");
  const total = quantity * price;

  const trade: Trade = {
    id: createId("t"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: "u-client", // in real app: current user id
    instrumentId: instrument.id,
    side: dto.side,
    status: TradeStatus.PENDING,
    settlementMethod: dto.settlementMethod,
    quantity: dto.quantity,
    pricePerUnit: dto.pricePerUnit,
    totalAmount: total.toString(),
    clientNote: dto.clientNote,
    adminNote: null,
    approvedAt: null,
    approvedById: null,
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client")!,
    instrument,
  };

  mockTrades.unshift(trade);
  return trade;
}

// ---------------------------------------------------------------------------
// Deposits
// ---------------------------------------------------------------------------

let mockDeposits: DepositRequest[] = [
  {
    id: "d-1",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(13),
    userId: "u-client",
    amount: "200000000",
    method: "bank-transfer",
    status: DepositStatus.APPROVED,
    refNo: "DEP001",
    note: "واریز اولیه",
    processedAt: daysAgo(13),
    processedById: "u-admin",
    accountTxId: "tx-2",
    user: mockUsers.find((u) => u.id === "u-client")!,
  },
  {
    id: "d-2",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    userId: "u-client-2",
    amount: "120000000",
    method: "atm",
    status: DepositStatus.PENDING,
    refNo: "DEP127",
    note: "واریز جهت خرید سکه",
    processedAt: null,
    processedById: null,
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-2")!,
  },
  {
    id: "d-3",
    createdAt: daysAgo(1),
    updatedAt: isoNow,
    userId: "u-client-3",
    amount: "35000000",
    method: "bank-transfer",
    status: DepositStatus.REJECTED,
    refNo: "DEP199",
    note: "برگشت به دلیل مغایرت",
    processedAt: isoNow,
    processedById: "u-ops",
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-3")!,
  },
  {
    id: "d-4",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    userId: "u-client-4",
    amount: "480000000",
    method: "bank-transfer",
    status: DepositStatus.APPROVED,
    refNo: "DEP230",
    note: "واریز جهت خرید ۲۵ گرم",
    processedAt: daysAgo(6),
    processedById: "u-admin",
    accountTxId: "tx-5",
    user: mockUsers.find((u) => u.id === "u-client-4")!,
  },
  {
    id: "d-5",
    createdAt: daysAgo(22),
    updatedAt: daysAgo(21),
    userId: "u-client-5",
    amount: "950000000",
    method: "atm",
    status: DepositStatus.APPROVED,
    refNo: "DEP312",
    note: "واریز خرید سکه",
    processedAt: daysAgo(21),
    processedById: "u-ops",
    accountTxId: "tx-6",
    user: mockUsers.find((u) => u.id === "u-client-5")!,
  },
];

export async function getMockDeposits(): Promise<DepositRequest[]> {
  await simulateDelay();
  return [...mockDeposits];
}

export async function createMockDeposit(
  dto: CreateDepositDto
): Promise<DepositRequest> {
  await simulateDelay();
  const dep: DepositRequest = {
    id: createId("d"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: dto.userId,
    amount: dto.amount,
    method: dto.method,
    status: DepositStatus.PENDING,
    refNo: dto.refNo,
    note: dto.note,
    processedAt: null,
    processedById: null,
    accountTxId: null,
    user: mockUsers.find((u) => u.id === dto.userId)!,
  };
  mockDeposits.unshift(dep);
  return dep;
}

// ---------------------------------------------------------------------------
// Withdrawals
// ---------------------------------------------------------------------------

let mockWithdrawals: WithdrawRequest[] = [
  {
    id: "w-1",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(14),
    userId: "u-client",
    amount: "50000000",
    status: WithdrawStatus.APPROVED,
    bankName: "بانک ملی",
    iban: "IR120580000000000000000001",
    cardNumber: "6037997000001234",
    note: "برداشت تستی",
    processedAt: daysAgo(14),
    processedById: "u-admin",
    accountTxId: "tx-1",
    user: mockUsers.find((u) => u.id === "u-client")!,
  },
  {
    id: "w-2",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    userId: "u-client-2",
    amount: "15000000",
    status: WithdrawStatus.PENDING,
    bankName: "بانک ملت",
    iban: "IR580120000000000000000002",
    cardNumber: "6104337000007890",
    note: "برداشت روزانه",
    processedAt: null,
    processedById: null,
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-2")!,
  },
  {
    id: "w-3",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    userId: "u-client-3",
    amount: "9000000",
    status: WithdrawStatus.REJECTED,
    bankName: "بانک پاسارگاد",
    iban: "IR420700000000000000000003",
    cardNumber: "5022291000005566",
    note: "درخواست نقدی",
    processedAt: daysAgo(1),
    processedById: "u-ops",
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-3")!,
  },
  {
    id: "w-4",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    userId: "u-client-4",
    amount: "22000000",
    status: WithdrawStatus.PENDING,
    bankName: "بانک ملت",
    iban: "IR780170000000000000000044",
    cardNumber: "6104337890123456",
    note: "برداشت برای هزینه جاری",
    processedAt: null,
    processedById: null,
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-4")!,
  },
  {
    id: "w-5",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(17),
    userId: "u-client-5",
    amount: "150000000",
    status: WithdrawStatus.REJECTED,
    bankName: "بانک صادرات",
    iban: "IR540190000000000000000055",
    cardNumber: "6037691409876543",
    note: "درخواست برداشت سکه",
    processedAt: daysAgo(17),
    processedById: "u-ops",
    accountTxId: null,
    user: mockUsers.find((u) => u.id === "u-client-5")!,
  },
];

export async function getMockWithdrawals(): Promise<WithdrawRequest[]> {
  await simulateDelay();
  return [...mockWithdrawals];
}

export async function createMockWithdrawal(
  dto: CreateWithdrawalDto
): Promise<WithdrawRequest> {
  await simulateDelay();
  const w: WithdrawRequest = {
    id: createId("w"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: dto.userId,
    amount: dto.amount,
    status: WithdrawStatus.PENDING,
    bankName: dto.bankName,
    iban: dto.iban,
    cardNumber: dto.cardNumber,
    note: dto.note,
    processedAt: null,
    processedById: null,
    accountTxId: null,
    user: mockUsers.find((u) => u.id === dto.userId)!,
  };
  mockWithdrawals.unshift(w);
  return w;
}

// ---------------------------------------------------------------------------
// Gold Lots
// ---------------------------------------------------------------------------

let mockGoldLots: GoldLot[] = [
  {
    id: "g-1",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(19),
    userId: "u-client",
    grossWeight: "150.50",
    karat: 750,
    equivGram750: "150.50",
    status: GoldLotStatus.IN_VAULT,
    note: "آبشده آب شده تبریز",
    user: mockUsers.find((u) => u.id === "u-client")!,
  },
  {
    id: "g-2",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    userId: "u-client-2",
    grossWeight: "15.2",
    karat: 740,
    equivGram750: "14.96",
    status: GoldLotStatus.WITHDRAWN,
    note: "تحویل مشتری در دفتر",
    user: mockUsers.find((u) => u.id === "u-client-2")!,
  },
  {
    id: "g-3",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    userId: "u-client-3",
    grossWeight: "8.7",
    karat: 750,
    equivGram750: "8.7",
    status: GoldLotStatus.SOLD,
    note: "فروش جهت تسویه",
    user: mockUsers.find((u) => u.id === "u-client-3")!,
  },
  {
    id: "g-4",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(8),
    userId: "u-client-4",
    grossWeight: "32.4",
    karat: 750,
    equivGram750: "32.4",
    status: GoldLotStatus.IN_VAULT,
    note: "سپرده مشتری برای تحویل بعدی",
    user: mockUsers.find((u) => u.id === "u-client-4")!,
  },
  {
    id: "g-5",
    createdAt: daysAgo(18),
    updatedAt: daysAgo(17),
    userId: "u-client-5",
    grossWeight: "110",
    karat: 750,
    equivGram750: "110",
    status: GoldLotStatus.WITHDRAWN,
    note: "تحویل در شعبه ونک",
    user: mockUsers.find((u) => u.id === "u-client-5")!,
  },
];

export async function getMockGoldLots(): Promise<GoldLot[]> {
  await simulateDelay();
  return [...mockGoldLots];
}

export async function createMockGoldLot(
  dto: CreateGoldLotDto
): Promise<GoldLot> {
  await simulateDelay();
  const lot: GoldLot = {
    id: createId("g"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: dto.userId,
    grossWeight: dto.grossWeight,
    karat: dto.karat,
    equivGram750: dto.grossWeight, // simple mock
    status: GoldLotStatus.IN_VAULT,
    note: dto.note,
    user: mockUsers.find((u) => u.id === dto.userId)!,
  };
  mockGoldLots.unshift(lot);
  return lot;
}

// ---------------------------------------------------------------------------
// Files & Attachments
// ---------------------------------------------------------------------------

let mockFiles: FileMeta[] = [
  {
    id: "file-1",
    createdAt: daysAgo(14),
    uploadedById: "u-client",
    storageKey: "mock://file-1",
    fileName: "receipt-1.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 120_000,
    label: "رسید واریز",
  },
  {
    id: "file-2",
    createdAt: daysAgo(5),
    uploadedById: "u-client-2",
    storageKey: "mock://file-2",
    fileName: "withdraw-slip.pdf",
    mimeType: "application/pdf",
    sizeBytes: 240_000,
    label: "فرم برداشت",
  },
  {
    id: "file-3",
    createdAt: daysAgo(1),
    uploadedById: "u-ops",
    storageKey: "mock://file-3",
    fileName: "pricing-note.txt",
    mimeType: "text/plain",
    sizeBytes: 4800,
    label: "یادداشت قیمت",
  },
  {
    id: "file-4",
    createdAt: daysAgo(6),
    uploadedById: "u-client-4",
    storageKey: "mock://file-4",
    fileName: "deposit-slip-ali.pdf",
    mimeType: "application/pdf",
    sizeBytes: 180_000,
    label: "رسید واریز علی",
  },
];

let mockAttachments: Attachment[] = [
  {
    id: "att-1",
    createdAt: daysAgo(14),
    fileId: "file-1",
    entityType: AttachmentEntityType.DEPOSIT,
    entityId: "d-1",
    purpose: "receipt",
    file: mockFiles[0],
  },
  {
    id: "att-2",
    createdAt: daysAgo(5),
    fileId: "file-2",
    entityType: AttachmentEntityType.WITHDRAW,
    entityId: "w-2",
    purpose: "request",
    file: mockFiles[1],
  },
  {
    id: "att-3",
    createdAt: daysAgo(1),
    fileId: "file-3",
    entityType: AttachmentEntityType.TRADE,
    entityId: "t-2",
    purpose: "note",
    file: mockFiles[2],
  },
  {
    id: "att-4",
    createdAt: daysAgo(6),
    fileId: "file-4",
    entityType: AttachmentEntityType.DEPOSIT,
    entityId: "d-4",
    purpose: "receipt",
    file: mockFiles[3],
  },
];

export async function getMockFiles(): Promise<FileMeta[]> {
  await simulateDelay();
  return [...mockFiles];
}

export async function getMockAttachments(
  entityType?: AttachmentEntityType,
  entityId?: string
): Promise<Attachment[]> {
  await simulateDelay();
  let result = [...mockAttachments];
  if (entityType) {
    result = result.filter((a) => a.entityType === entityType);
  }
  if (entityId) {
    result = result.filter((a) => a.entityId === entityId);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Pricing logs
// ---------------------------------------------------------------------------

let mockPricingLogs: PricingLog[] = [
  {
    id: "pl-1",
    createdAt: daysAgo(3),
    userId: "u-admin",
    description: "به‌روزرسانی قیمت خرید طلای ۷۵۰ به دلیل افزایش بازار جهانی",
    affectedInstrumentIds: ["ins-gold-750"],
  },
  {
    id: "pl-2",
    createdAt: daysAgo(1),
    userId: "u-ops",
    description: "کاهش ۱٪ قیمت سکه امامی جهت متعادل‌سازی سفارشات",
    affectedInstrumentIds: ["ins-emami"],
  },
  {
    id: "pl-3",
    createdAt: isoNow,
    userId: "u-admin",
    description: "همگام‌سازی قیمت‌ها با منبع ثانویه و تثبیت اسپرد",
    affectedInstrumentIds: ["ins-gold-750", "ins-emami"],
  },
];

export async function getMockPricingLogs(): Promise<PricingLog[]> {
  await simulateDelay();
  return [...mockPricingLogs];
}

export async function addMockPricingLog(
  log: Omit<PricingLog, "id" | "createdAt">
): Promise<void> {
  await simulateDelay();
  mockPricingLogs.unshift({ ...log, id: createId("pl"), createdAt: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Admin UI Settings
// ---------------------------------------------------------------------------

let adminUiSettings: AdminUiSettings = {
  theme: "light",
  language: "fa",
  dateFormat: "jalali",
  showExperimentalFeatures: false,
};

export async function getAdminUiSettings(): Promise<AdminUiSettings> {
  await simulateDelay();
  return { ...adminUiSettings };
}

export async function updateAdminUiSettings(
  patch: Partial<AdminUiSettings>
): Promise<AdminUiSettings> {
  await simulateDelay();
  adminUiSettings = { ...adminUiSettings, ...patch };
  return { ...adminUiSettings };
}

// ---------------------------------------------------------------------------
// System Status (Tahesab connection mock)
// ---------------------------------------------------------------------------

let mockSystemStatus: SystemStatus = {
  tahesabOnline: true,
  lastSyncAt: isoNow,
};

export async function getMockSystemStatus(): Promise<SystemStatus> {
  await simulateDelay();
  return { ...mockSystemStatus };
}

export async function updateMockSystemStatus(partial: Partial<SystemStatus>) {
  mockSystemStatus = { ...mockSystemStatus, ...partial, lastSyncAt: partial.lastSyncAt ?? new Date().toISOString() };
  return getMockSystemStatus();
}

// ---------------------------------------------------------------------------
// Tahesab Logs & Mapping
// ---------------------------------------------------------------------------

let mockTahesabLogs: TahesabLog[] = [
  {
    id: "log-1",
    time: daysAgo(1),
    level: "info",
    message: "همگام‌سازی موفق کاربران",
    entityRef: "users",
  },
  {
    id: "log-2",
    time: daysAgo(2),
    level: "warn",
    message: "تاخیر در پاسخ تاهساب برای تراکنش‌ها",
    entityRef: "transactions",
  },
  {
    id: "log-3",
    time: daysAgo(3),
    level: "error",
    message: "عدم تطابق موجودی حساب داخلی با تاهساب",
    entityRef: "acc-house-irr",
  },
];

let mockTahesabMappings: TahesabMapping[] = [
  { id: "map-1", internalAccount: "حساب خانه ریالی", tahesabCode: "TH-1001", type: "HOUSE", status: "ACTIVE" },
  { id: "map-2", internalAccount: "مشتری علی رضایی - ریالی", tahesabCode: "TH-4302", type: "CLIENT", status: "ACTIVE" },
  { id: "map-3", internalAccount: "مشتری سارا کریمی - طلا ۷۵۰", tahesabCode: "TH-7845", type: "CLIENT", status: "DISABLED" },
];

export async function getMockTahesabLogs(): Promise<TahesabLog[]> {
  await simulateDelay();
  return [...mockTahesabLogs].sort((a, b) => (a.time > b.time ? -1 : 1));
}

export async function getMockTahesabMappings(): Promise<TahesabMapping[]> {
  await simulateDelay();
  return [...mockTahesabMappings];
}

export async function updateMockTahesabMapping(id: string, partial: Partial<TahesabMapping>): Promise<TahesabMapping> {
  const idx = mockTahesabMappings.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Mapping not found");
  mockTahesabMappings[idx] = { ...mockTahesabMappings[idx], ...partial };
  return mockTahesabMappings[idx];
}

// ---------------------------------------------------------------------------
// Tahesab Sync, Balances & Documents
// ---------------------------------------------------------------------------

const mockTahesabSyncStatus: TahesabSyncStatus = {
  connected: true,
  lastSyncedAt: daysAgo(0.5),
  lastSuccessfulSyncAt: daysAgo(1),
  nextScheduledAt: new Date(now.getTime() + 1000 * 60 * 20).toISOString(),
  queueLength: 2,
  pendingSince: daysAgo(0.2),
};

const mockTahesabBalances: TahesabBalanceRecord[] = [
  {
    id: "bal-1",
    customerId: "u-client",
    customerName: "زهرا رضایی",
    tahesabAccountCode: "TH-4302",
    assetType: "GOLD",
    balanceInternal: 9.5,
    balanceTahesab: 9.2,
    difference: 0.3,
    lastSyncedAt: daysAgo(1),
  },
  {
    id: "bal-2",
    customerId: "u-client-2",
    customerName: "رضا کریمی",
    tahesabAccountCode: "TH-7845",
    assetType: "COIN",
    balanceInternal: 5,
    balanceTahesab: 5,
    difference: 0,
    lastSyncedAt: daysAgo(2),
  },
  {
    id: "bal-3",
    customerId: "u-client-3",
    customerName: "سارا احمدی",
    tahesabAccountCode: "TH-8891",
    assetType: "CURRENCY",
    balanceInternal: 95000000,
    balanceTahesab: 92000000,
    difference: 3000000,
    lastSyncedAt: daysAgo(0.7),
  },
  {
    id: "bal-4",
    tahesabAccountCode: "TH-HOUSE-IRR",
    assetType: "CURRENCY",
    balanceInternal: 3500000000,
    balanceTahesab: 3495000000,
    difference: 5000000,
    lastSyncedAt: daysAgo(0.3),
  },
];

const mockTahesabDocuments: TahesabDocumentSummary[] = [
  {
    id: "doc-1",
    documentNumber: "TS-1001",
    date: daysAgo(2),
    customerId: "u-client",
    tahesabAccountCode: "TH-4302",
    type: TahesabDocumentType.BUY,
    status: TahesabDocumentStatus.POSTED,
    totalAmount: 360000000,
    totalWeight: 10,
    internalEntityRef: { type: "trade", id: "t-1" },
  },
  {
    id: "doc-2",
    documentNumber: "TS-1002",
    date: daysAgo(1),
    customerId: "u-client",
    tahesabAccountCode: "TH-4302",
    type: TahesabDocumentType.SELL,
    status: TahesabDocumentStatus.PENDING,
    totalAmount: 310250000,
    totalWeight: 8.5,
    internalEntityRef: { type: "trade", id: "t-2" },
  },
  {
    id: "doc-3",
    documentNumber: "TS-1003",
    date: daysAgo(4),
    customerId: "u-client-2",
    tahesabAccountCode: "TH-7845",
    type: TahesabDocumentType.DEPOSIT,
    status: TahesabDocumentStatus.POSTED,
    totalAmount: 120000000,
    totalWeight: undefined,
    internalEntityRef: { type: "deposit", id: "dep-1" },
  },
  {
    id: "doc-4",
    documentNumber: "TS-1004",
    date: daysAgo(3),
    tahesabAccountCode: "TH-REMIT-1",
    type: TahesabDocumentType.REMITTANCE,
    status: TahesabDocumentStatus.POSTED,
    totalAmount: 50000000,
    internalEntityRef: { type: "remittance", id: "rem-1" },
  },
];

const mockTahesabDocumentDetails: Record<string, TahesabDocumentDetail> = {
  "doc-1": {
    ...mockTahesabDocuments[0],
    lines: [
      {
        lineId: "doc-1-1",
        assetType: "GOLD",
        instrumentName: "طلا ۱۸ عیار",
        weight: 10,
        unitPrice: 36000000,
        tax: 0,
        discount: 0,
        amount: 360000000,
      },
    ],
  },
  "doc-2": {
    ...mockTahesabDocuments[1],
    lines: [
      {
        lineId: "doc-2-1",
        assetType: "GOLD",
        instrumentName: "طلا ۱۸ عیار",
        weight: 8.5,
        unitPrice: 36500000,
        tax: 0,
        discount: 0,
        amount: 310250000,
      },
    ],
  },
  "doc-3": {
    ...mockTahesabDocuments[2],
    lines: [
      {
        lineId: "doc-3-1",
        assetType: "CURRENCY",
        instrumentName: "ریال",
        quantity: 1,
        unitPrice: 120000000,
        amount: 120000000,
        tax: 0,
      },
    ],
  },
  "doc-4": {
    ...mockTahesabDocuments[3],
    lines: [
      {
        lineId: "doc-4-1",
        assetType: "CURRENCY",
        instrumentName: "ریال",
        quantity: 1,
        unitPrice: 50000000,
        amount: 50000000,
      },
    ],
  },
};

export async function getMockTahesabSyncStatus(): Promise<TahesabSyncStatus> {
  await simulateDelay();
  return { ...mockTahesabSyncStatus };
}

export async function getMockTahesabBalances(): Promise<TahesabBalanceRecord[]> {
  await simulateDelay();
  return [...mockTahesabBalances];
}

export async function getMockTahesabBalancesByCustomer(customerId: string): Promise<TahesabBalanceRecord[]> {
  await simulateDelay();
  return mockTahesabBalances.filter((b) => b.customerId === customerId);
}

export async function getMockTahesabDocuments(
  params?: Partial<{
    type: TahesabDocumentType;
    status: TahesabDocumentStatus;
    customerId: string;
    dateFrom: string;
    dateTo: string;
  }>
): Promise<TahesabDocumentSummary[]> {
  await simulateDelay();
  return mockTahesabDocuments.filter((doc) => {
    const matchesType = params?.type ? doc.type === params.type : true;
    const matchesStatus = params?.status ? doc.status === params.status : true;
    const matchesCustomer = params?.customerId ? doc.customerId === params.customerId : true;
    const matchesFrom = params?.dateFrom ? new Date(doc.date) >= new Date(params.dateFrom) : true;
    const matchesTo = params?.dateTo ? new Date(doc.date) <= new Date(params.dateTo) : true;
    return matchesType && matchesStatus && matchesCustomer && matchesFrom && matchesTo;
  });
}

export async function getMockTahesabDocumentById(id: string): Promise<TahesabDocumentDetail> {
  await simulateDelay();
  const detail = mockTahesabDocumentDetails[id];
  if (!detail) throw new Error("Document not found");
  return detail;
}

export async function getMockTahesabDocumentsByRef(
  refType: "trade" | "deposit" | "withdrawal" | "remittance",
  refId: string
): Promise<TahesabDocumentSummary[]> {
  await simulateDelay();
  return mockTahesabDocuments.filter((doc) => doc.internalEntityRef?.type === refType && doc.internalEntityRef.id === refId);
}

// ---------------------------------------------------------------------------
// Risk Settings
// ---------------------------------------------------------------------------

let mockRiskSettings: RiskSettingsConfig = {
  globalMaxExposure: 120000000000,
  maxExposurePerClient: 35000000000,
  maxOpenTradesPerClient: 25,
  updatedAt: isoNow,
};

export async function getMockRiskSettings(): Promise<RiskSettingsConfig> {
  await simulateDelay();
  return { ...mockRiskSettings };
}

export async function updateMockRiskSettings(partial: Partial<RiskSettingsConfig>): Promise<RiskSettingsConfig> {
  mockRiskSettings = { ...mockRiskSettings, ...partial, updatedAt: new Date().toISOString() };
  return getMockRiskSettings();
}

// ---------------------------------------------------------------------------
// Remittances (Trader)
// ---------------------------------------------------------------------------

let mockRemittances: Remittance[] = [
  {
    id: "rem-1",
    customerId: "u-client",
    fromAccountId: "acc-1",
    toAccountId: "acc-house-irr",
    amount: 12000000,
    status: RemittanceStatus.PENDING,
    description: "انتقال برای تسویه خرید طلا",
    createdAt: daysAgo(2),
  },
  {
    id: "rem-2",
    customerId: "u-client-2",
    fromAccountId: "acc-8",
    toAccountId: "acc-house-irr",
    amount: 8500000,
    status: RemittanceStatus.SENT,
    description: "واریز کمیسیون معاملات",
    createdAt: daysAgo(3),
  },
  {
    id: "rem-3",
    customerId: "u-client-3",
    fromAccountId: "acc-11",
    toAccountId: "acc-1",
    amount: 4200000,
    status: RemittanceStatus.COMPLETED,
    description: "بازگشت اضافه برداشت",
    createdAt: daysAgo(5),
  },
];

export async function getMockRemittances(): Promise<Remittance[]> {
  await simulateDelay();
  return [...mockRemittances].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export async function createMockRemittance(remittance: Omit<Remittance, "id" | "createdAt">): Promise<Remittance> {
  await simulateDelay(300);
  const newRemittance: Remittance = {
    ...remittance,
    id: `rem-${mockRemittances.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  mockRemittances = [newRemittance, ...mockRemittances];
  return newRemittance;
}