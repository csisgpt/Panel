"use client";

import { getMyTrades } from "@/lib/api/trades";
import { getMyAccounts } from "@/lib/api/accounts";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { getSystemStatus } from "@/lib/api/system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";
import { Account, DepositRequest, Trade, WithdrawRequest } from "@/lib/types/backend";

export default function TraderDashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ tahesabOnline: boolean; lastSyncAt: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [t, a, d, w, status] = await Promise.all([
          getMyTrades(),
          getMyAccounts(),
          getDeposits(),
          getWithdrawals(),
          getSystemStatus(),
        ]);
        setTrades(t);
        setAccounts(a);
        setDeposits(d);
        setWithdrawals(w);
        setSystemStatus(status);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const irrBalance = useMemo(() => {
    return accounts
      .filter((acc) => acc.instrument?.code === "IRR")
      .reduce((sum, acc) => sum + Number(acc.balance || "0"), 0)
      .toLocaleString();
  }, [accounts]);

  const goldHoldings = useMemo(() => {
    const goldAccounts = accounts.filter((acc) => acc.instrument?.code !== "IRR");
    return goldAccounts
      .map((acc) => `${acc.balance} ${acc.instrument?.unit === "PIECE" ? "عدد" : "گرم"}`)
      .join(" | ");
  }, [accounts]);

  const todayPnL = useMemo(() => {
    return trades
      .filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + Number(t.totalAmount || "0") * (t.side === "SELL" ? 1 : -1), 0)
      .toLocaleString();
  }, [trades]);

  const latestTrades = trades.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">داشبورد معامله‌گر</h1>
          <p className="text-sm text-muted-foreground">جمع‌بندی سریع وضعیت مشتریان و نقدینگی</p>
        </div>
        {systemStatus && (
          <Badge variant={systemStatus.tahesabOnline ? "success" : "destructive"}>
            وضعیت سامانه: {systemStatus.tahesabOnline ? "پایدار" : "قطع"}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">موجودی ریالی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{irrBalance} ریال</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">دارایی طلا/سکه</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold leading-6 text-foreground">{goldHoldings || "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">سود/زیان امروز</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{todayPnL} ریال</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>آخرین معاملات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestTrades.length === 0 && <p className="text-muted-foreground">معامله‌ای ثبت نشده است.</p>}
            {latestTrades.map((trade) => (
              <div key={trade.id} className="rounded-lg border p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{trade.instrument?.name}</div>
                  <Badge variant={trade.side === "BUY" ? "outline" : "secondary"}>{trade.side === "BUY" ? "خرید" : "فروش"}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{trade.quantity} @ {trade.pricePerUnit}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ورودی/خروجی اخیر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[...deposits.slice(0, 3), ...withdrawals.slice(0, 3)].length === 0 && (
              <p className="text-muted-foreground">تراکنشی ثبت نشده است.</p>
            )}
            {deposits.slice(0, 3).map((dep) => (
              <div key={dep.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-semibold">واریز</div>
                  <p className="text-xs text-muted-foreground">{Number(dep.amount).toLocaleString()} ریال</p>
                </div>
                <Badge variant={dep.status === "APPROVED" ? "success" : dep.status === "REJECTED" ? "destructive" : "secondary"}>{dep.status}</Badge>
              </div>
            ))}
            {withdrawals.slice(0, 3).map((wd) => (
              <div key={wd.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-semibold">برداشت</div>
                  <p className="text-xs text-muted-foreground">{Number(wd.amount).toLocaleString()} ریال</p>
                </div>
                <Badge variant={wd.status === "APPROVED" ? "success" : wd.status === "REJECTED" ? "destructive" : "secondary"}>{wd.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
