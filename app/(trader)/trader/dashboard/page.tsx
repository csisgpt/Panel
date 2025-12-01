"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable, TransactionRow, TransactionKind } from "@/components/transactions/transaction-table";
import { TradeDetailsDialog } from "@/components/details/trade-details-dialog";
import { DepositDetailsDialog } from "@/components/details/deposit-details-dialog";
import { WithdrawDetailsDialog } from "@/components/details/withdraw-details-dialog";
import { RemittanceDetailsDialog } from "@/components/details/remittance-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyTrades } from "@/lib/api/trades";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { getRemittances } from "@/lib/api/remittances";
import {
  DepositRequest,
  DepositStatus,
  Trade,
  WithdrawRequest,
  WithdrawStatus,
} from "@/lib/types/backend";
import { Remittance, RemittanceStatus } from "@/lib/mock-data";

function isToday(date: string | undefined) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function TraderDashboardPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdraw, setSelectedWithdraw] = useState<WithdrawRequest | null>(null);
  const [selectedRemittance, setSelectedRemittance] = useState<Remittance | null>(null);

  useEffect(() => {
    getMyTrades().then(setTrades).catch(() => setTrades([]));
    getDeposits().then(setDeposits).catch(() => setDeposits([]));
    getWithdrawals().then(setWithdrawals).catch(() => setWithdrawals([]));
    getRemittances().then(setRemittances).catch(() => setRemittances([]));
  }, []);

  const todayStats = useMemo(() => {
    return {
      trades: trades.filter((t) => isToday(t.createdAt)).length,
      remittances: remittances.filter((r) => isToday(r.createdAt)).length,
      deposits: deposits.filter((d) => isToday(d.createdAt)).length,
      withdrawals: withdrawals.filter((w) => isToday(w.createdAt)).length,
    };
  }, [deposits, remittances, trades, withdrawals]);

  const recentTransactions: TransactionRow[] = useMemo(() => {
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
        statusLabel: trade.status,
        statusVariant: "secondary" as const,
        createdAt: trade.createdAt,
        trade,
      })),
      ...deposits.map((dep) => ({
        id: dep.id,
        kind: "DEPOSIT" as TransactionKind,
        customer: dep.user?.fullName ?? "واریز کننده",
        contact: dep.user?.mobile,
        amount: Number(dep.amount),
        account: dep.refNo ?? "-",
        instrument: "واریز ریالی",
        statusLabel: dep.status,
        statusVariant: badgeForDeposit(dep.status),
        createdAt: dep.createdAt,
        deposit: dep,
      })),
      ...withdrawals.map((wd) => ({
        id: wd.id,
        kind: "WITHDRAW" as TransactionKind,
        customer: wd.user?.fullName ?? "برداشت کننده",
        contact: wd.user?.mobile,
        amount: Number(wd.amount),
        account: wd.accountTxId ?? wd.iban ?? wd.cardNumber ?? "-",
        instrument: "برداشت",
        statusLabel: wd.status,
        statusVariant: badgeForWithdraw(wd.status),
        createdAt: wd.createdAt,
        withdrawal: wd,
      })),
    ];

    return rows
      .sort((a, b) => (a.createdAt && b.createdAt ? (a.createdAt > b.createdAt ? -1 : 1) : 0))
      .slice(0, 5);
  }, [deposits, trades, withdrawals]);

  const latestRemittances = useMemo(() => remittances.slice(0, 5), [remittances]);

  const summaryCards = [
    {
      title: "کل معاملات امروز",
      value: todayStats.trades,
      onClick: () => router.push("/trader/transactions?type=TRADE"),
    },
    {
      title: "کل حواله‌های امروز",
      value: todayStats.remittances,
      onClick: () => router.push("/trader/remittances"),
    },
    {
      title: "کل واریزهای امروز",
      value: todayStats.deposits,
      onClick: () => router.push("/trader/transactions?type=DEPOSIT"),
    },
    {
      title: "کل برداشت‌های امروز",
      value: todayStats.withdrawals,
      onClick: () => router.push("/trader/transactions?type=WITHDRAW"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">داشبورد معامله‌گر</h1>
        <p className="text-sm text-muted-foreground">جمع‌بندی سریع از فعالیت امروز و موارد اخیر.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer transition hover:shadow-lg"
            onClick={card.onClick}
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>آخرین تراکنش‌ها</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/trader/transactions")}>مشاهده همه</Button>
          </CardHeader>
          <CardContent>
            <TransactionTable
              data={recentTransactions}
              onSelectTrade={setSelectedTrade}
              onSelectDeposit={setSelectedDeposit}
              onSelectWithdraw={setSelectedWithdraw}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>آخرین حواله‌ها</CardTitle>
            <Badge variant="outline">{remittances.length} مورد</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="text-right">
                  <th className="p-2">از</th>
                  <th className="p-2">به</th>
                  <th className="p-2">مبلغ</th>
                  <th className="p-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {latestRemittances.map((rem) => (
                  <tr
                    key={rem.id}
                    className="border-t cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedRemittance(rem)}
                  >
                    <td className="p-2">{rem.fromAccountId}</td>
                    <td className="p-2">{rem.toAccountId}</td>
                    <td className="p-2 text-right font-semibold">{rem.amount.toLocaleString("fa-IR")}</td>
                    <td className="p-2">
                      <Badge variant={badgeForRemittance(rem.status)}>{statusLabel(rem.status)}</Badge>
                    </td>
                  </tr>
                ))}
                {!latestRemittances.length && (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-xs text-muted-foreground">
                      حواله‌ای ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
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
        withdrawal={selectedWithdraw}
        open={!!selectedWithdraw}
        onOpenChange={(open) => !open && setSelectedWithdraw(null)}
      />
      <RemittanceDetailsDialog
        remittance={selectedRemittance}
        open={!!selectedRemittance}
        onOpenChange={(open) => !open && setSelectedRemittance(null)}
      />
    </div>
  );
}

function badgeForRemittance(status: RemittanceStatus) {
  switch (status) {
    case RemittanceStatus.COMPLETED:
      return "success" as const;
    case RemittanceStatus.PENDING:
      return "warning" as const;
    case RemittanceStatus.SENT:
      return "secondary" as const;
    default:
      return "destructive" as const;
  }
}

function statusLabel(status: RemittanceStatus) {
  switch (status) {
    case RemittanceStatus.COMPLETED:
      return "تکمیل شده";
    case RemittanceStatus.PENDING:
      return "در انتظار";
    case RemittanceStatus.SENT:
      return "ارسال شده";
    default:
      return "ناموفق";
  }
}

function badgeForDeposit(status: DepositStatus): TransactionRow["statusVariant"] {
  switch (status) {
    case DepositStatus.APPROVED:
      return "success";
    case DepositStatus.PENDING:
      return "warning";
    default:
      return "destructive";
  }
}

function badgeForWithdraw(status: WithdrawStatus): TransactionRow["statusVariant"] {
  switch (status) {
    case WithdrawStatus.APPROVED:
      return "success";
    case WithdrawStatus.PENDING:
      return "warning";
    default:
      return "destructive";
  }
}
