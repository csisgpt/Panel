"use client";

import { useEffect, useMemo, useState } from "react";

import { DepositDetailsDialog } from "@/components/details/deposit-details-dialog";
import { TradeDetailsDialog } from "@/components/details/trade-details-dialog";
import { WithdrawDetailsDialog } from "@/components/details/withdraw-details-dialog";
import { TransactionTable, TransactionTableRow } from "@/components/transactions/transaction-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDeposits } from "@/lib/api/deposits";
import { getMyTrades } from "@/lib/api/trades";
import { getWithdrawals } from "@/lib/api/withdrawals";
import {
  DepositRequest,
  DepositStatus,
  Trade,
  TradeStatus,
  WithdrawRequest,
  WithdrawStatus,
} from "@/lib/types/backend";
import type { BadgeProps } from "@/components/ui/badge";

const transactionTypeOptions = [
  { label: "همه نوع تراکنش", value: "ALL" },
  { label: "معامله", value: "TRADE" },
  { label: "واریز", value: "DEPOSIT" },
  { label: "برداشت", value: "WITHDRAW" },
] as const;

const statusFilterOptions = [
  { label: "همه وضعیت‌ها", value: "ALL" },
  { label: "موفق", value: "SUCCESS" },
  { label: "در انتظار", value: "PENDING" },
  { label: "ناموفق", value: "FAILED" },
] as const;

type FilterType = (typeof transactionTypeOptions)[number]["value"];
type FilterStatus = (typeof statusFilterOptions)[number]["value"];

type StatusMeta = {
  label: string;
  variant: BadgeProps["variant"];
  filterStatus: Exclude<FilterStatus, "ALL">;
};

const tradeStatusMap: Record<TradeStatus, StatusMeta> = {
  [TradeStatus.PENDING]: {
    label: "در انتظار",
    variant: "warning",
    filterStatus: "PENDING",
  },
  [TradeStatus.APPROVED]: {
    label: "تایید شده",
    variant: "success",
    filterStatus: "SUCCESS",
  },
  [TradeStatus.SETTLED]: {
    label: "تسویه شده",
    variant: "success",
    filterStatus: "SUCCESS",
  },
  [TradeStatus.REJECTED]: {
    label: "رد شده",
    variant: "destructive",
    filterStatus: "FAILED",
  },
  [TradeStatus.CANCELLED_BY_USER]: {
    label: "لغو توسط مشتری",
    variant: "secondary",
    filterStatus: "FAILED",
  },
  [TradeStatus.CANCELLED_BY_ADMIN]: {
    label: "لغو توسط ادمین",
    variant: "secondary",
    filterStatus: "FAILED",
  },
};

const depositStatusMap: Record<DepositStatus, StatusMeta> = {
  [DepositStatus.PENDING]: {
    label: "در انتظار",
    variant: "warning",
    filterStatus: "PENDING",
  },
  [DepositStatus.APPROVED]: {
    label: "تایید شده",
    variant: "success",
    filterStatus: "SUCCESS",
  },
  [DepositStatus.REJECTED]: {
    label: "رد شده",
    variant: "destructive",
    filterStatus: "FAILED",
  },
  [DepositStatus.CANCELLED]: {
    label: "لغو شده",
    variant: "secondary",
    filterStatus: "FAILED",
  },
};

const withdrawStatusMap: Record<WithdrawStatus, StatusMeta> = {
  [WithdrawStatus.PENDING]: {
    label: "در انتظار",
    variant: "warning",
    filterStatus: "PENDING",
  },
  [WithdrawStatus.APPROVED]: {
    label: "تایید شده",
    variant: "success",
    filterStatus: "SUCCESS",
  },
  [WithdrawStatus.REJECTED]: {
    label: "رد شده",
    variant: "destructive",
    filterStatus: "FAILED",
  },
  [WithdrawStatus.CANCELLED]: {
    label: "لغو شده",
    variant: "secondary",
    filterStatus: "FAILED",
  },
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function TraderTransactionsPage() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawRequest | null>(null);

  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getMyTrades().catch(() => [] as Trade[]),
      getDeposits().catch(() => [] as DepositRequest[]),
      getWithdrawals().catch(() => [] as WithdrawRequest[]),
    ])
      .then(([tradeData, depositData, withdrawData]) => {
        setTrades(tradeData);
        setDeposits(depositData);
        setWithdrawals(withdrawData);
      })
      .finally(() => setLoading(false));
  }, []);

  const transactions: TransactionTableRow[] = useMemo(() => {
    const tradeRows = trades.map((trade) => {
      const status = tradeStatusMap[trade.status];
      const quantity = Number(trade.quantity || 0);
      const price = Number(trade.pricePerUnit || 0);
      const total = Number(trade.totalAmount || quantity * price);

      return {
        id: `trade-${trade.id}`,
        type: "TRADE" as const,
        typeLabel: "معامله",
        customerName: trade.client?.fullName ?? "—",
        accountCode:
          trade.client?.mobile ?? trade.client?.email ?? trade.client?.id ?? "—",
        amount: total,
        status: status.filterStatus,
        statusLabel: status.label,
        statusVariant: status.variant,
        date: trade.createdAt ?? null,
        description: trade.instrument?.name,
        onClick: () => setSelectedTrade(trade),
        actionLabel: "جزئیات معامله",
      } satisfies TransactionTableRow;
    });

    const depositRows = deposits.map((dep) => {
      const status = depositStatusMap[dep.status];
      return {
        id: `deposit-${dep.id}`,
        type: "DEPOSIT" as const,
        typeLabel: "واریز",
        customerName: dep.user?.fullName ?? "—",
        accountCode: dep.user?.mobile ?? dep.user?.email ?? dep.user?.id ?? "—",
        amount: Number(dep.amount || 0),
        status: status.filterStatus,
        statusLabel: status.label,
        statusVariant: status.variant,
        date: dep.createdAt ?? null,
        description: dep.method,
        onClick: () => setSelectedDeposit(dep),
        actionLabel: "جزئیات واریز",
      } satisfies TransactionTableRow;
    });

    const withdrawRows = withdrawals.map((wd) => {
      const status = withdrawStatusMap[wd.status];
      return {
        id: `withdraw-${wd.id}`,
        type: "WITHDRAW" as const,
        typeLabel: "برداشت",
        customerName: wd.user?.fullName ?? "—",
        accountCode:
          wd.user?.mobile ?? wd.user?.email ?? wd.cardNumber ?? wd.user?.id ?? "—",
        amount: Number(wd.amount || 0),
        status: status.filterStatus,
        statusLabel: status.label,
        statusVariant: status.variant,
        date: wd.createdAt ?? null,
        description: wd.iban ?? wd.bankName ?? undefined,
        onClick: () => setSelectedWithdrawal(wd),
        actionLabel: "جزئیات برداشت",
      } satisfies TransactionTableRow;
    });

    return [...tradeRows, ...depositRows, ...withdrawRows];
  }, [deposits, trades, withdrawals]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && tx.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase();
        const haystack = `${tx.customerName} ${tx.accountCode ?? ""} ${tx.description ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      const txDate = parseDate(tx.date);
      if (fromDate) {
        const from = parseDate(fromDate);
        if (from && txDate && txDate < from) return false;
      }
      if (toDate) {
        const to = parseDate(toDate);
        if (to && txDate && txDate > to) return false;
      }

      return true;
    });
  }, [fromDate, searchQuery, statusFilter, toDate, transactions, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
        <p className="text-sm text-muted-foreground">
          در این صفحه تمام تراکنش‌های معاملاتی، واریز و برداشت شما قابل مشاهده و مدیریت است.
        </p>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">نوع تراکنش</label>
          <Select value={typeFilter} onValueChange={(value: FilterType) => setTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="همه نوع تراکنش" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">وضعیت</label>
          <Select value={statusFilter} onValueChange={(value: FilterStatus) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="همه وضعیت‌ها" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">جستجو بر اساس نام یا کد حساب</label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس نام یا کد حساب"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">بازه تاریخ</label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="از تاریخ"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="تا تاریخ"
            />
          </div>
        </div>
      </div>

      <TransactionTable transactions={filteredTransactions} loading={loading} />

      <TradeDetailsDialog
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
      <DepositDetailsDialog
        deposit={selectedDeposit}
        open={!!selectedDeposit}
        onOpenChange={(open) => !open && setSelectedDeposit(null)}
      />
      <WithdrawDetailsDialog
        withdrawal={selectedWithdrawal}
        open={!!selectedWithdrawal}
        onOpenChange={(open) => !open && setSelectedWithdrawal(null)}
      />
    </div>
  );
}
