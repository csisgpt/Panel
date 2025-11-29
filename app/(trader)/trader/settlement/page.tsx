"use client";

import { useEffect, useMemo, useState } from "react";
import { getAccounts } from "@/lib/api/accounts";
import { getMyTrades } from "@/lib/api/trades";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { getUsers } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendUser, Account, Trade, TradeStatus, DepositRequest, WithdrawRequest, UserRole, DepositStatus, WithdrawStatus } from "@/lib/types/backend";
import { Input } from "@/components/ui/input";

interface SettlementRow {
  client: BackendUser;
  totalDeposits: number;
  totalWithdrawals: number;
  tradePnl: number;
  accountBalance: number;
  netBalance: number;
}

const pnlForTrade = (trade: Trade) => {
  const qty = Number(trade.quantity);
  const price = Number(trade.pricePerUnit);
  return (trade.side === "SELL" ? 1 : -1) * qty * price;
};

export default function TraderSettlementPage() {
  const [clients, setClients] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SettlementRow | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersData, accountData, tradeData, depData, wdData] = await Promise.all([
          getUsers(),
          getAccounts(),
          getMyTrades(),
          getDeposits(),
          getWithdrawals(),
        ]);
        setClients(usersData.filter((u) => u.role === UserRole.CLIENT));
        setAccounts(accountData);
        setTrades(tradeData);
        setDeposits(depData);
        setWithdrawals(wdData);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت داده‌های تسویه");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows: SettlementRow[] = useMemo(() => {
    return clients.map((client) => {
      const clientAccounts = accounts.filter((acc) => acc.userId === client.id);
      const clientTrades = trades.filter((t) => t.clientId === client.id);
      const accountBalance = clientAccounts
        .filter((acc) => acc.instrument?.code === "IRR")
        .reduce((sum, acc) => sum + Number(acc.balance || "0"), 0);
      const tradePnl = clientTrades
        .filter((t) => t.status === TradeStatus.SETTLED || t.status === TradeStatus.APPROVED)
        .reduce((sum, t) => sum + pnlForTrade(t), 0);
      const totalDeposits = deposits
        .filter((d) => d.userId === client.id && d.status === DepositStatus.APPROVED)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      const totalWithdrawals = withdrawals
        .filter((w) => w.userId === client.id && w.status === WithdrawStatus.APPROVED)
        .reduce((sum, w) => sum + Number(w.amount), 0);
      const netBalance = accountBalance + tradePnl + totalDeposits - totalWithdrawals;
      return { client, totalDeposits, totalWithdrawals, tradePnl, accountBalance, netBalance };
    });
  }, [accounts, clients, trades, deposits, withdrawals]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        [row.client.fullName, row.client.mobile].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
      ),
    [rows, search]
  );

  const summary = useMemo(() => {
    const receivable = rows.filter((r) => r.netBalance < 0).reduce((sum, r) => sum + Math.abs(r.netBalance), 0);
    const payable = rows.filter((r) => r.netBalance > 0).reduce((sum, r) => sum + r.netBalance, 0);
    const net = payable - receivable;
    return { receivable, payable, net };
  }, [rows]);

  const statusFor = (value: number) => {
    if (value > 0) return { label: "بستانکار", variant: "success" as const };
    if (value < 0) return { label: "بدهکار", variant: "destructive" as const };
    return { label: "متوازن", variant: "secondary" as const };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">وضعیت تسویه مشتریان</h1>
        <p className="text-sm text-muted-foreground">جمع‌بندی مانده و تعهدات هر مشتری</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">طلب از مشتریان</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">{summary.receivable.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">بدهی به مشتریان</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{summary.payable.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">خالص موقعیت</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.net.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="جستجو نام یا موبایل"
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>جدول تسویه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>مشتری</TableHead>
                  <TableHead>واریز تایید شده</TableHead>
                  <TableHead>برداشت تایید شده</TableHead>
                  <TableHead>سود/زیان معاملات</TableHead>
                  <TableHead>موجودی حساب</TableHead>
                  <TableHead>مانده نهایی</TableHead>
                  <TableHead>جزئیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const status = statusFor(row.netBalance);
                  return (
                    <TableRow key={row.client.id}>
                      <TableCell>
                        <div className="font-semibold">{row.client.fullName}</div>
                        <p className="text-xs text-muted-foreground">{row.client.mobile}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.totalDeposits.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.totalWithdrawals.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.tradePnl.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.accountBalance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{row.netBalance.toLocaleString()} ({status.label})</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                          جزئیات
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      موردی یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>جزئیات تسویه</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">مشتری</span>
                <span className="font-semibold">{selected.client.fullName}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">واریزها</div>
                  <div className="font-semibold">{selected.totalDeposits.toLocaleString()} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">برداشت‌ها</div>
                  <div className="font-semibold">{selected.totalWithdrawals.toLocaleString()} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">سود/زیان معاملات</div>
                  <div className="font-semibold">{selected.tradePnl.toLocaleString()} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">موجودی حساب</div>
                  <div className="font-semibold">{selected.accountBalance.toLocaleString()} ریال</div>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">مانده نهایی</span>
                  <Badge variant={statusFor(selected.netBalance).variant}>
                    {selected.netBalance.toLocaleString()} ({statusFor(selected.netBalance).label})
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
