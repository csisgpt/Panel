"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { TransactionTable, TransactionRow, TransactionKind } from "@/components/transactions/transaction-table";
import { DepositDetailsDialog } from "@/components/details/deposit-details-dialog";
import { WithdrawDetailsDialog } from "@/components/details/withdraw-details-dialog";
import { TradeDetailsDialog } from "@/components/details/trade-details-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { getMyTrades } from "@/lib/api/trades";
import { DepositRequest, DepositStatus, Trade, TradeStatus, WithdrawRequest, WithdrawStatus } from "@/lib/types/backend";

interface FilterState {
  type: TransactionKind | "ALL";
  status: "ALL" | "SUCCESS" | "PENDING" | "FAILED";
  search: string;
  fromDate: string;
  toDate: string;
}

const initialFilter: FilterState = {
  type: "ALL",
  status: "ALL",
  search: "",
  fromDate: "",
  toDate: "",
};

export default function TraderTransactionsPage() {
  const searchParams = useSearchParams();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawRequest | null>(null);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState<FilterState>(initialFilter);

  useEffect(() => {
    const customerId = searchParams.get("customerId");
    const typeParam = (searchParams.get("type")?.toUpperCase() as TransactionKind | null) ?? null;
    if (customerId) {
      setFilter((prev) => ({ ...prev, search: customerId }));
    }
    if (typeParam && ["TRADE", "DEPOSIT", "WITHDRAW"].includes(typeParam)) {
      setFilter((prev) => ({ ...prev, type: typeParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    getDeposits().then(setDeposits).catch(() => setDeposits([]));
    getWithdrawals().then(setWithdrawals).catch(() => setWithdrawals([]));
    getMyTrades().then(setTrades).catch(() => setTrades([]));
  }, []);

  const combined: TransactionRow[] = useMemo(() => {
    const rows: TransactionRow[] = [
      ...trades.map((trade) => ({
        id: trade.id,
        kind: "TRADE" as TransactionKind,
        customer: trade.client?.fullName ?? "مشتری",
        contact: trade.client?.mobile,
        account: trade.clientId,
        instrument: trade.instrument?.name,
        quantity: trade.quantity,
        pricePerUnit: trade.pricePerUnit,
        amount: Number(trade.totalAmount || Number(trade.quantity) * Number(trade.pricePerUnit)),
        statusLabel: mapTradeStatus(trade.status).label,
        statusVariant: mapTradeStatus(trade.status).variant,
        createdAt: trade.createdAt,
        trade,
      })),
      ...deposits.map((dep) => ({
        id: dep.id,
        kind: "DEPOSIT" as TransactionKind,
        customer: dep.user?.fullName ?? "واریز کننده",
        contact: dep.user?.mobile ?? dep.refNo ?? "",
        account: dep.refNo ?? dep.accountTxId ?? "-",
        instrument: "واریز ریالی",
        amount: Number(dep.amount),
        statusLabel: mapDepositStatus(dep.status).label,
        statusVariant: mapDepositStatus(dep.status).variant,
        createdAt: dep.createdAt,
        deposit: dep,
      })),
      ...withdrawals.map((wd) => ({
        id: wd.id,
        kind: "WITHDRAW" as TransactionKind,
        customer: wd.user?.fullName ?? "برداشت کننده",
        contact: wd.user?.mobile,
        account: wd.accountTxId ?? wd.iban ?? wd.cardNumber ?? "-",
        instrument: "برداشت",
        amount: Number(wd.amount),
        statusLabel: mapWithdrawStatus(wd.status).label,
        statusVariant: mapWithdrawStatus(wd.status).variant,
        createdAt: wd.createdAt,
        withdrawal: wd,
      })),
    ];

    return rows.sort((a, b) => (a.createdAt && b.createdAt ? (a.createdAt > b.createdAt ? -1 : 1) : 0));
  }, [deposits, withdrawals, trades]);

  const filtered = useMemo(() => {
    return combined.filter((row) => {
      const matchesType = filter.type === "ALL" || row.kind === filter.type;
      const matchesStatus = filter.status === "ALL" || mapStatusLabel(row.statusLabel) === filter.status;
      const term = filter.search.toLowerCase();
      const matchesSearch = !term
        ? true
        : [row.customer, row.contact, row.account].some((field) => field?.toLowerCase().includes(term));

      const created = row.createdAt ? new Date(row.createdAt) : null;
      const fromOk = filter.fromDate ? created && created >= new Date(filter.fromDate) : true;
      const toOk = filter.toDate ? created && created <= new Date(filter.toDate) : true;

      return matchesType && matchesStatus && matchesSearch && fromOk && toOk;
    });
  }, [combined, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
        <p className="text-sm text-muted-foreground">لیست معاملات، واریزها و برداشت‌های این معامله‌گر.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">فیلترها</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label>نوع تراکنش</Label>
            <Select value={filter.type} onValueChange={(v) => setFilter((prev) => ({ ...prev, type: v as FilterState["type"] }))}>
              <SelectTrigger>
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value="TRADE">معامله</SelectItem>
                <SelectItem value="DEPOSIT">واریز</SelectItem>
                <SelectItem value="WITHDRAW">برداشت</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>وضعیت</Label>
            <Select
              value={filter.status}
              onValueChange={(v) => setFilter((prev) => ({ ...prev, status: v as FilterState["status"] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value="SUCCESS">موفق</SelectItem>
                <SelectItem value="PENDING">در انتظار</SelectItem>
                <SelectItem value="FAILED">ناموفق</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>جستجو (نام مشتری / کد)</Label>
            <Input
              placeholder="نام، موبایل یا کد"
              value={filter.search}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>از تاریخ</Label>
              <Input
                type="date"
                value={filter.fromDate}
                onChange={(e) => setFilter((prev) => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>تا تاریخ</Label>
              <Input
                type="date"
                value={filter.toDate}
                onChange={(e) => setFilter((prev) => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-2 rounded-xl border bg-card p-3 shadow-sm">
        <TransactionTable
          data={filtered}
          onSelectTrade={setSelectedTrade}
          onSelectDeposit={setSelectedDeposit}
          onSelectWithdraw={setSelectedWithdrawal}
        />
      </div>

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

function mapTradeStatus(status: TradeStatus) {
  switch (status) {
    case TradeStatus.APPROVED:
    case TradeStatus.SETTLED:
      return { label: "موفق", variant: "success" as const, state: "SUCCESS" as const };
    case TradeStatus.PENDING:
      return { label: "در انتظار", variant: "warning" as const, state: "PENDING" as const };
    default:
      return { label: "ناموفق", variant: "destructive" as const, state: "FAILED" as const };
  }
}

function mapDepositStatus(status: DepositStatus) {
  switch (status) {
    case DepositStatus.APPROVED:
      return { label: "تایید شده", variant: "success" as const, state: "SUCCESS" as const };
    case DepositStatus.PENDING:
      return { label: "در انتظار", variant: "warning" as const, state: "PENDING" as const };
    default:
      return { label: "ناموفق", variant: "destructive" as const, state: "FAILED" as const };
  }
}

function mapWithdrawStatus(status: WithdrawStatus) {
  switch (status) {
    case WithdrawStatus.APPROVED:
      return { label: "تایید شده", variant: "success" as const, state: "SUCCESS" as const };
    case WithdrawStatus.PENDING:
      return { label: "در انتظار", variant: "warning" as const, state: "PENDING" as const };
    default:
      return { label: "ناموفق", variant: "destructive" as const, state: "FAILED" as const };
  }
}

function mapStatusLabel(label: string): FilterState["status"] {
  if (["موفق", "تایید شده"].includes(label)) return "SUCCESS";
  if (["در انتظار"].includes(label)) return "PENDING";
  return "FAILED";
}
