export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type AccountType = "MAIN" | "MARGIN" | "SAVINGS";
export type AccountStatus = "ACTIVE" | "BLOCKED" | "DISABLED";
export type TransactionType = "DEPOSIT" | "WITHDRAW" | "BUY_GOLD" | "SELL_GOLD" | "FEE";
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface User {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "OPERATOR";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  nationalId?: string;
  status: CustomerStatus;
  createdAt: string;
}

export interface Account {
  id: string;
  customerId: string;
  name: string;
  type: AccountType;
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  status: AccountStatus;
}

export interface Transaction {
  id: string;
  customerId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
}

export interface SystemStatus {
  tahesabOnline: boolean;
  lastSyncAt: string;
}

export const mockUser: User = {
  id: "u1",
  name: "مدیر سیستم",
  username: "admin",
  role: "ADMIN"
};

export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "رضا محمدی",
    phone: "09121234567",
    nationalId: "0012345678",
    status: "ACTIVE",
    createdAt: "2024-01-12T10:20:00Z"
  },
  {
    id: "c2",
    name: "سارا احمدی",
    phone: "09123334455",
    nationalId: "0098765432",
    status: "INACTIVE",
    createdAt: "2023-11-03T08:45:00Z"
  },
  {
    id: "c3",
    name: "مجید کاظمی",
    phone: "09124445566",
    nationalId: "0076543211",
    status: "BLOCKED",
    createdAt: "2023-09-30T15:05:00Z"
  },
  {
    id: "c4",
    name: "پریناز عباسی",
    phone: "09125557744",
    nationalId: "0045123678",
    status: "ACTIVE",
    createdAt: "2024-02-18T11:00:00Z"
  }
];

export const mockAccounts: Account[] = [
  {
    id: "a1",
    customerId: "c1",
    name: "حساب اصلی",
    type: "MAIN",
    availableBalance: 850_000_000,
    blockedBalance: 20_000_000,
    totalBalance: 870_000_000,
    status: "ACTIVE"
  },
  {
    id: "a2",
    customerId: "c1",
    name: "حساب پس‌انداز",
    type: "SAVINGS",
    availableBalance: 120_000_000,
    blockedBalance: 0,
    totalBalance: 120_000_000,
    status: "ACTIVE"
  },
  {
    id: "a3",
    customerId: "c2",
    name: "حساب مارجین",
    type: "MARGIN",
    availableBalance: 40_000_000,
    blockedBalance: 5_000_000,
    totalBalance: 45_000_000,
    status: "BLOCKED"
  },
  {
    id: "a4",
    customerId: "c3",
    name: "حساب اصلی",
    type: "MAIN",
    availableBalance: 12_000_000,
    blockedBalance: 2_500_000,
    totalBalance: 14_500_000,
    status: "DISABLED"
  },
  {
    id: "a5",
    customerId: "c4",
    name: "حساب طلای سرمایه",
    type: "SAVINGS",
    availableBalance: 300_000_000,
    blockedBalance: 10_000_000,
    totalBalance: 310_000_000,
    status: "ACTIVE"
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    customerId: "c1",
    accountId: "a1",
    type: "DEPOSIT",
    amount: 25_000_000,
    status: "SUCCESS",
    description: "واریز آنلاین",
    createdAt: "2024-05-20T10:30:00Z"
  },
  {
    id: "t2",
    customerId: "c1",
    accountId: "a2",
    type: "BUY_GOLD",
    amount: 12_000_000,
    status: "PENDING",
    description: "خرید طلا",
    createdAt: "2024-05-21T09:10:00Z"
  },
  {
    id: "t3",
    customerId: "c2",
    accountId: "a3",
    type: "WITHDRAW",
    amount: 3_500_000,
    status: "FAILED",
    description: "برداشت ناموفق",
    createdAt: "2024-05-18T13:15:00Z"
  },
  {
    id: "t4",
    customerId: "c1",
    accountId: "a1",
    type: "WITHDRAW",
    amount: 5_000_000,
    status: "SUCCESS",
    description: "برداشت کارت",
    createdAt: "2024-05-23T08:00:00Z"
  },
  {
    id: "t5",
    customerId: "c4",
    accountId: "a5",
    type: "SELL_GOLD",
    amount: 18_500_000,
    status: "SUCCESS",
    description: "فروش شمش ۲ گرمی",
    createdAt: "2024-05-24T16:40:00Z"
  },
  {
    id: "t6",
    customerId: "c3",
    accountId: "a4",
    type: "FEE",
    amount: 250_000,
    status: "SUCCESS",
    description: "کارمزد ماهانه",
    createdAt: "2024-05-17T07:50:00Z"
  },
  {
    id: "t7",
    customerId: "c4",
    accountId: "a5",
    type: "DEPOSIT",
    amount: 90_000_000,
    status: "SUCCESS",
    description: "انتقال بانکی",
    createdAt: "2024-05-15T11:25:00Z"
  },
  {
    id: "t8",
    customerId: "c2",
    accountId: "a3",
    type: "BUY_GOLD",
    amount: 6_200_000,
    status: "PENDING",
    description: "خرید ربع سکه",
    createdAt: "2024-05-22T12:10:00Z"
  }
];

export const mockSystemStatus: SystemStatus = {
  tahesabOnline: true,
  lastSyncAt: "2024-05-24T18:30:00Z"
};

export const dashboardChartData = Array.from({ length: 30 }).map((_, idx) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - idx));
  return {
    day: date.toLocaleDateString("fa-IR", { month: "numeric", day: "numeric" }),
    volume: Math.round(180 + Math.sin(idx / 3) * 60 + Math.random() * 40)
  };
});

export const transactionTypeData = [
  { name: "واریز", value: 42, type: "DEPOSIT" },
  { name: "برداشت", value: 24, type: "WITHDRAW" },
  { name: "خرید طلا", value: 18, type: "BUY_GOLD" },
  { name: "فروش طلا", value: 10, type: "SELL_GOLD" },
  { name: "کارمزد", value: 6, type: "FEE" }
];

export interface TransactionFilters {
  customerId?: string;
  accountId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
}

export function getMockCustomers(): Promise<Customer[]> {
  return Promise.resolve(mockCustomers);
}

export function getMockCustomer(id: string): Promise<Customer | undefined> {
  return Promise.resolve(mockCustomers.find((customer) => customer.id === id));
}

export function getMockAccounts(): Promise<Account[]> {
  return Promise.resolve(mockAccounts);
}

export function getMockAccountsByCustomer(customerId: string): Promise<Account[]> {
  return Promise.resolve(mockAccounts.filter((account) => account.customerId === customerId));
}

export function getMockAccount(id: string): Promise<Account | undefined> {
  return Promise.resolve(mockAccounts.find((account) => account.id === id));
}

export function getMockTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  let data = [...mockTransactions];
  if (filters?.customerId) {
    data = data.filter((tx) => tx.customerId === filters.customerId);
  }
  if (filters?.accountId) {
    data = data.filter((tx) => tx.accountId === filters.accountId);
  }
  if (filters?.type) {
    data = data.filter((tx) => tx.type === filters.type);
  }
  if (filters?.dateFrom) {
    data = data.filter((tx) => new Date(tx.createdAt) >= new Date(filters.dateFrom!));
  }
  if (filters?.dateTo) {
    data = data.filter((tx) => new Date(tx.createdAt) <= new Date(filters.dateTo!));
  }
  return Promise.resolve(data);
}

export function getMockTransaction(id: string): Promise<Transaction | undefined> {
  return Promise.resolve(mockTransactions.find((tx) => tx.id === id));
}

export function getMockSystemStatus(): Promise<SystemStatus> {
  return Promise.resolve(mockSystemStatus);
}
