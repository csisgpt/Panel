export type CustomerStatus = "active" | "inactive" | "blocked";
export type AccountType = "main" | "margin" | "savings";
export type AccountStatus = "active" | "blocked" | "disabled";
export type TransactionType = "deposit" | "withdrawal" | "gold_buy" | "gold_sell" | "fee";
export type TransactionStatus = "success" | "pending" | "failed";

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
  accountName: string;
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
  accountName: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
}

export const customers: Customer[] = [
  {
    id: "c1",
    name: "رضا محمدی",
    phone: "09121234567",
    nationalId: "0012345678",
    status: "active",
    createdAt: "2024-01-12"
  },
  {
    id: "c2",
    name: "سارا احمدی",
    phone: "09123334455",
    nationalId: "0098765432",
    status: "inactive",
    createdAt: "2023-11-03"
  },
  {
    id: "c3",
    name: "مجید کاظمی",
    phone: "09124445566",
    nationalId: "0076543211",
    status: "blocked",
    createdAt: "2023-09-30"
  }
];

export const accounts: Account[] = [
  {
    id: "a1",
    customerId: "c1",
    accountName: "حساب اصلی",
    type: "main",
    availableBalance: 850000000,
    blockedBalance: 20000000,
    totalBalance: 870000000,
    status: "active"
  },
  {
    id: "a2",
    customerId: "c1",
    accountName: "حساب پس‌انداز",
    type: "savings",
    availableBalance: 120000000,
    blockedBalance: 0,
    totalBalance: 120000000,
    status: "active"
  },
  {
    id: "a3",
    customerId: "c2",
    accountName: "حساب مارجین",
    type: "margin",
    availableBalance: 40000000,
    blockedBalance: 5000000,
    totalBalance: 45000000,
    status: "blocked"
  }
];

export const transactions: Transaction[] = [
  {
    id: "t1",
    customerId: "c1",
    accountId: "a1",
    accountName: "حساب اصلی",
    type: "deposit",
    amount: 25000000,
    status: "success",
    description: "واریز آنلاین",
    createdAt: "2024-05-20T10:30:00Z"
  },
  {
    id: "t2",
    customerId: "c1",
    accountId: "a2",
    accountName: "حساب پس‌انداز",
    type: "gold_buy",
    amount: 12000000,
    status: "pending",
    description: "خرید طلا",
    createdAt: "2024-05-21T09:10:00Z"
  },
  {
    id: "t3",
    customerId: "c2",
    accountId: "a3",
    accountName: "حساب مارجین",
    type: "withdrawal",
    amount: 3500000,
    status: "failed",
    description: "برداشت ناموفق",
    createdAt: "2024-05-18T13:15:00Z"
  },
  {
    id: "t4",
    customerId: "c1",
    accountId: "a1",
    accountName: "حساب اصلی",
    type: "withdrawal",
    amount: 5000000,
    status: "success",
    description: "برداشت کارت",
    createdAt: "2024-05-23T08:00:00Z"
  }
];

export const chartData30Days = Array.from({ length: 30 }).map((_, idx) => {
  const day = idx + 1;
  return {
    day: `روز ${day}`,
    volume: Math.round(200 + Math.sin(idx / 3) * 80 + Math.random() * 40)
  };
});

export const transactionTypeData = [
  { name: "واریز", value: 45, type: "deposit" },
  { name: "برداشت", value: 25, type: "withdrawal" },
  { name: "خرید طلا", value: 15, type: "gold_buy" },
  { name: "فروش طلا", value: 10, type: "gold_sell" },
  { name: "کارمزد", value: 5, type: "fee" }
];
