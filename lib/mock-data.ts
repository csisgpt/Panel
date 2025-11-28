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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date().toISOString();

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
    createdAt: now,
    updatedAt: now,
    fullName: "مدیر سامانه",
    mobile: "09120000000",
    email: "admin@gold.test",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-trader",
    createdAt: now,
    updatedAt: now,
    fullName: "معامله‌گر نمونه",
    mobile: "09121111111",
    email: "trader@gold.test",
    role: UserRole.TRADER,
    status: UserStatus.ACTIVE,
  },
  {
    id: "u-client",
    createdAt: now,
    updatedAt: now,
    fullName: "مشتری تستی",
    mobile: "09122222222",
    email: "client@gold.test",
    role: UserRole.CLIENT,
    status: UserStatus.PENDING_APPROVAL,
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

export async function getMockUser(id: string): Promise<BackendUser | null> {
  await simulateDelay();
  return mockUsers.find((u) => u.id === id) ?? null;
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
    createdAt: now,
    updatedAt: now,
    code: "IRR",
    name: "ریال ایران",
    type: InstrumentType.FIAT,
    unit: InstrumentUnit.CURRENCY,
  },
  {
    id: "ins-gold-750",
    createdAt: now,
    updatedAt: now,
    code: "GOLD_750_EQ",
    name: "طلای ۱۸ عیار معادل ۷۵۰",
    type: InstrumentType.GOLD,
    unit: InstrumentUnit.GRAM_750_EQ,
  },
  {
    id: "ins-emami",
    createdAt: now,
    updatedAt: now,
    code: "SEKE_EMAMI",
    name: "سکه امامی",
    type: InstrumentType.COIN,
    unit: InstrumentUnit.PIECE,
  },
];

let mockInstrumentPrices: InstrumentPrice[] = [
  {
    id: "pr-irr",
    createdAt: now,
    instrumentId: "ins-irr",
    buyPrice: "1",
    sellPrice: "1",
    source: "mock",
    instrument: mockInstruments[0],
  },
  {
    id: "pr-gold-750",
    createdAt: now,
    instrumentId: "ins-gold-750",
    buyPrice: "36000000",
    sellPrice: "36500000",
    source: "mock",
    instrument: mockInstruments[1],
  },
  {
    id: "pr-emami",
    createdAt: now,
    instrumentId: "ins-emami",
    buyPrice: "420000000",
    sellPrice: "425000000",
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
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    instrumentId: "ins-irr",
    balance: "150000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[0],
    user: mockUsers.find((u) => u.id === "u-client"),
  },
  {
    id: "acc-2",
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    instrumentId: "ins-gold-750",
    balance: "100.25",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[1],
    user: mockUsers.find((u) => u.id === "u-client"),
  },
  {
    id: "acc-house-irr",
    createdAt: now,
    updatedAt: now,
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
    createdAt: now,
    accountId: "acc-1",
    delta: "-50000000",
    type: AccountTxType.WITHDRAW,
    refType: TxRefType.WITHDRAW,
    refId: "w-1",
    createdById: "u-admin",
  },
  {
    id: "tx-2",
    createdAt: now,
    accountId: "acc-1",
    delta: "200000000",
    type: AccountTxType.DEPOSIT,
    refType: TxRefType.DEPOSIT,
    refId: "d-1",
    createdById: "u-admin",
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
    createdAt: now,
    updatedAt: now,
    clientId: "u-client",
    instrumentId: "ins-gold-750",
    side: TradeSide.BUY,
    status: TradeStatus.APPROVED,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "10",
    pricePerUnit: "36000000",
    totalAmount: "360000000",
    clientNote: "خرید تستی",
    adminNote: "اوکی",
    approvedAt: now,
    approvedById: "u-admin",
    rejectedAt: null,
    rejectReason: null,
    client: mockUsers.find((u) => u.id === "u-client")!,
    instrument: mockInstruments[1],
  },
];

export async function getMockTrades(): Promise<Trade[]> {
  await simulateDelay();
  return [...mockTrades];
}

export async function getMockTradeById(id: string): Promise<Trade | null> {
  await simulateDelay();
  return mockTrades.find((t) => t.id === id) ?? null;
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
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    amount: "200000000",
    method: "bank-transfer",
    status: DepositStatus.APPROVED,
    refNo: "DEP001",
    note: "واریز اولیه",
    processedAt: now,
    processedById: "u-admin",
    accountTxId: "tx-2",
    user: mockUsers.find((u) => u.id === "u-client")!,
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
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    amount: "50000000",
    status: WithdrawStatus.APPROVED,
    bankName: "بانک ملی",
    iban: "IR1234...",
    cardNumber: "603799...",
    note: "برداشت تستی",
    processedAt: now,
    processedById: "u-admin",
    accountTxId: "tx-1",
    user: mockUsers.find((u) => u.id === "u-client")!,
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
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    grossWeight: "150.50",
    karat: 750,
    equivGram750: "150.50",
    status: GoldLotStatus.IN_VAULT,
    note: "آبشده تستی",
    user: mockUsers.find((u) => u.id === "u-client")!,
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
    createdAt: now,
    uploadedById: "u-client",
    storageKey: "mock://file-1",
    fileName: "receipt-1.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 120_000,
    label: "رسید واریز",
  },
];

let mockAttachments: Attachment[] = [
  {
    id: "att-1",
    createdAt: now,
    fileId: "file-1",
    entityType: AttachmentEntityType.DEPOSIT,
    entityId: "d-1",
    purpose: "receipt",
    file: mockFiles[0],
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
// System Status (Tahesab connection mock)
// ---------------------------------------------------------------------------

let mockSystemStatus: SystemStatus = {
  tahesabOnline: true,
  lastSyncAt: now,
};

export async function getMockSystemStatus(): Promise<SystemStatus> {
  await simulateDelay();
  return { ...mockSystemStatus };
}