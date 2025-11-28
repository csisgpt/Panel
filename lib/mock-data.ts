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
  UpdateUserDto,
  WithdrawRequest,
  WithdrawStatus,
} from "@/lib/types/backend";

const now = new Date().toISOString();

const mockUsers: BackendUser[] = [
  {
    id: "u-admin",
    createdAt: now,
    updatedAt: now,
    fullName: "مدیر سامانه",
    mobile: "09120000000",
    email: "admin@gold.test",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "u-trader",
    createdAt: now,
    updatedAt: now,
    fullName: "معامله‌گر نمونه",
    mobile: "09121111111",
    email: "trader@gold.test",
    role: "TRADER",
    status: "ACTIVE",
  },
  {
    id: "u-client",
    createdAt: now,
    updatedAt: now,
    fullName: "مشتری تستی",
    mobile: "09122222222",
    email: "client@gold.test",
    role: "CLIENT",
    status: "PENDING_APPROVAL",
  },
];

const mockInstruments: Instrument[] = [
  {
    id: "ins-gold",
    createdAt: now,
    updatedAt: now,
    code: "GOLD-GRAM",
    name: "طلا ۱۸ عیار",
    type: InstrumentType.GOLD,
    unit: InstrumentUnit.GRAM_750_EQ,
  },
  {
    id: "ins-coin",
    createdAt: now,
    updatedAt: now,
    code: "SEKE-ROBE",
    name: "ربع سکه",
    type: InstrumentType.COIN,
    unit: InstrumentUnit.PIECE,
  },
  {
    id: "ins-fiat",
    createdAt: now,
    updatedAt: now,
    code: "IRR",
    name: "ریال ایران",
    type: InstrumentType.FIAT,
    unit: InstrumentUnit.CURRENCY,
  },
];

const mockInstrumentPrices: InstrumentPrice[] = [
  {
    id: "p1",
    createdAt: now,
    instrumentId: "ins-gold",
    buyPrice: "36500000",
    sellPrice: "36000000",
    source: "نرخ بازار",
    instrument: mockInstruments[0],
  },
  {
    id: "p2",
    createdAt: now,
    instrumentId: "ins-coin",
    buyPrice: "151000000",
    sellPrice: "149500000",
    source: "نرخ بازار",
    instrument: mockInstruments[1],
  },
];

const mockAccounts: Account[] = [
  {
    id: "acc-1",
    createdAt: now,
    updatedAt: now,
    userId: "u-trader",
    instrumentId: "ins-fiat",
    balance: "1250000000",
    blockedBalance: "50000000",
    minBalance: "0",
    instrument: mockInstruments[2],
    user: mockUsers[1],
  },
  {
    id: "acc-2",
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    instrumentId: "ins-fiat",
    balance: "425000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[2],
    user: mockUsers[2],
  },
  {
    id: "acc-house",
    createdAt: now,
    updatedAt: now,
    userId: null,
    instrumentId: "ins-fiat",
    balance: "9300000000",
    blockedBalance: "0",
    minBalance: "0",
    instrument: mockInstruments[2],
    user: null,
  },
];

const mockTrades: Trade[] = [
  {
    id: "t-1",
    createdAt: now,
    updatedAt: now,
    clientId: "u-trader",
    instrumentId: "ins-gold",
    side: TradeSide.BUY,
    status: TradeStatus.APPROVED,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "120",
    pricePerUnit: "36000000",
    totalAmount: "4320000000",
    clientNote: "خرید سریع برای تحویل فردا",
    approvedAt: now,
    approvedById: "u-admin",
    client: mockUsers[1],
    instrument: mockInstruments[0],
    approvedBy: mockUsers[0],
  },
  {
    id: "t-2",
    createdAt: now,
    updatedAt: now,
    clientId: "u-client",
    instrumentId: "ins-coin",
    side: TradeSide.SELL,
    status: TradeStatus.PENDING,
    settlementMethod: SettlementMethod.EXTERNAL,
    quantity: "3",
    pricePerUnit: "150000000",
    totalAmount: "450000000",
    client: mockUsers[2],
    instrument: mockInstruments[1],
  },
];

const mockDeposits: DepositRequest[] = [
  {
    id: "d-1",
    createdAt: now,
    updatedAt: now,
    userId: "u-client",
    amount: "200000000",
    method: "کارت به کارت",
    status: DepositStatus.APPROVED,
    refNo: "REF-2001",
    processedAt: now,
    processedById: "u-admin",
    user: mockUsers[2],
  },
];

const mockWithdrawals: WithdrawRequest[] = [
  {
    id: "w-1",
    createdAt: now,
    updatedAt: now,
    userId: "u-trader",
    amount: "50000000",
    status: WithdrawStatus.PENDING,
    bankName: "بانک ملت",
    iban: "IR000700000000000000000000",
    note: "برداشت هفتگی",
    user: mockUsers[1],
  },
];

const mockGoldLots: GoldLot[] = [
  {
    id: "gl-1",
    createdAt: now,
    updatedAt: now,
    userId: "u-trader",
    grossWeight: "52.3",
    karat: 18,
    equivGram750: "50",
    status: GoldLotStatus.IN_VAULT,
    note: "شمش امانی مشتری",
    user: mockUsers[1],
  },
];

const mockFiles: FileMeta[] = [
  {
    id: "file-1",
    createdAt: now,
    uploadedById: "u-admin",
    storageKey: "mock/file-1",
    fileName: "رسید-واریز.pdf",
    mimeType: "application/pdf",
    sizeBytes: 12000,
    label: "رسید",
  },
];

const mockAttachments: Attachment[] = [
  {
    id: "att-1",
    createdAt: now,
    fileId: "file-1",
    entityType: AttachmentEntityType.DEPOSIT,
    entityId: "d-1",
    purpose: "رسید",
    file: mockFiles[0],
  },
];

const mockAccountTx: AccountTx[] = [
  {
    id: "tx-1",
    createdAt: now,
    accountId: "acc-1",
    delta: "-50000000",
    type: AccountTxType.WITHDRAW,
    refType: "WITHDRAW",
    refId: "w-1",
  },
  {
    id: "tx-2",
    createdAt: now,
    accountId: "acc-2",
    delta: "200000000",
    type: AccountTxType.DEPOSIT,
    refType: "DEPOSIT",
    refId: "d-1",
  },
];

const mockSystemStatus: SystemStatus = {
  tahesabOnline: true,
  lastSyncAt: now,
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function mockLogin(dto: LoginDto): Promise<LoginResponse> {
  const user = mockUsers.find((u) => u.mobile === dto.mobile);
  if (!user) {
    throw new Error("کاربر یافت نشد");
  }
  return { accessToken: createId("token"), user };
}

export async function getMockUsers(): Promise<BackendUser[]> {
  return [...mockUsers];
}

export async function getMockUser(id: string): Promise<BackendUser | null> {
  return mockUsers.find((u) => u.id === id) ?? null;
}

export async function createMockUser(dto: CreateUserDto): Promise<BackendUser> {
  const user: BackendUser = {
    id: createId("u"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: dto.fullName,
    mobile: dto.mobile,
    email: dto.email,
    role: dto.role,
    status: "ACTIVE",
  };
  mockUsers.push(user);
  return user;
}

export async function updateMockUser(id: string, dto: UpdateUserDto): Promise<BackendUser> {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error("کاربر یافت نشد");
  Object.assign(user, dto, { updatedAt: new Date().toISOString() });
  return user;
}

export async function getMockAccounts(): Promise<Account[]> {
  return [...mockAccounts];
}

export async function getMockAccountsByUser(userId: string | null): Promise<Account[]> {
  return mockAccounts.filter((acc) => acc.userId === userId);
}

export async function getMockAccountTx(): Promise<AccountTx[]> {
  return [...mockAccountTx];
}

export async function getMockTrades(): Promise<Trade[]> {
  return [...mockTrades];
}

export async function getMockTradeById(id: string): Promise<Trade> {
  const trade = mockTrades.find((t) => t.id === id);
  if (!trade) throw new Error("معامله یافت نشد");
  return trade;
}

export async function createMockTrade(dto: CreateTradeDto): Promise<Trade> {
  const instrument = mockInstruments.find((i) => i.code === dto.instrumentCode);
  if (!instrument) throw new Error("ابزار نامعتبر است");
  const totalAmount = (Number(dto.quantity) * Number(dto.pricePerUnit)).toString();
  const trade: Trade = {
    id: createId("t"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: "u-trader",
    instrumentId: instrument.id,
    side: dto.side,
    status: TradeStatus.PENDING,
    settlementMethod: dto.settlementMethod,
    quantity: dto.quantity,
    pricePerUnit: dto.pricePerUnit,
    totalAmount,
    clientNote: dto.clientNote,
    client: mockUsers.find((u) => u.id === "u-trader"),
    instrument,
  };
  mockTrades.unshift(trade);
  return trade;
}

export async function getMockDeposits(): Promise<DepositRequest[]> {
  return [...mockDeposits];
}

export async function createMockDeposit(dto: CreateDepositDto): Promise<DepositRequest> {
  const deposit: DepositRequest = {
    id: createId("d"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: dto.userId,
    amount: dto.amount,
    method: dto.method,
    status: DepositStatus.PENDING,
    refNo: dto.refNo,
    note: dto.note,
    user: mockUsers.find((u) => u.id === dto.userId),
  };
  mockDeposits.unshift(deposit);
  return deposit;
}

export async function getMockWithdrawals(): Promise<WithdrawRequest[]> {
  return [...mockWithdrawals];
}

export async function createMockWithdrawal(dto: CreateWithdrawalDto): Promise<WithdrawRequest> {
  const withdraw: WithdrawRequest = {
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
    user: mockUsers.find((u) => u.id === dto.userId),
  };
  mockWithdrawals.unshift(withdraw);
  return withdraw;
}

export async function getMockGoldLots(): Promise<GoldLot[]> {
  return [...mockGoldLots];
}

export async function createMockGoldLot(dto: CreateGoldLotDto): Promise<GoldLot> {
  const goldLot: GoldLot = {
    id: createId("gl"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: dto.userId,
    grossWeight: dto.grossWeight,
    karat: dto.karat,
    equivGram750: (Number(dto.grossWeight) * (dto.karat / 24)).toFixed(2),
    status: GoldLotStatus.IN_VAULT,
    note: dto.note,
    user: mockUsers.find((u) => u.id === dto.userId),
  };
  mockGoldLots.unshift(goldLot);
  return goldLot;
}

export async function getMockInstrumentPrices(): Promise<InstrumentPrice[]> {
  return [...mockInstrumentPrices];
}

export async function getMockInstruments(): Promise<Instrument[]> {
  return [...mockInstruments];
}

export async function getMockFiles(): Promise<FileMeta[]> {
  return [...mockFiles];
}

export async function getMockAttachments(): Promise<Attachment[]> {
  return [...mockAttachments];
}

export async function getMockSystemStatus(): Promise<SystemStatus> {
  return mockSystemStatus;
}
