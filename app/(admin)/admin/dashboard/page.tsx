"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsers } from "@/lib/api/users";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { getTrades } from "@/lib/api/trades";
import { getSystemStatus } from "@/lib/api/system";
import {
  BackendUser,
  DepositRequest,
  Trade,
  WithdrawRequest,
  UserStatus,
  TradeStatus,
  DepositStatus,
  WithdrawStatus,
} from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ tahesabOnline: boolean; lastSyncAt: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [u, t, d, w, status] = await Promise.all([
          getUsers(),
          getTrades(),
          getDeposits(),
          getWithdrawals(),
          getSystemStatus(),
        ]);
        setUsers(u);
        setTrades(t);
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

  const metrics = useMemo(() => {
    const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE).length;
    const last24h = trades.filter((t) => Date.now() - new Date(t.createdAt).getTime() < 24 * 3600 * 1000).length;
    const last7d = trades.filter((t) => Date.now() - new Date(t.createdAt).getTime() < 7 * 24 * 3600 * 1000).length;
    const totalApprovedDeposit = deposits
      .filter((d) => d.status === DepositStatus.APPROVED)
      .reduce((sum, d) => sum + Number(d.amount), 0);
    const totalApprovedWithdraw = withdrawals
      .filter((w) => w.status === WithdrawStatus.APPROVED)
      .reduce((sum, w) => sum + Number(w.amount), 0);

    return [
      { title: "کل کاربران", value: users.length.toLocaleString() },
      { title: "کاربران فعال", value: activeUsers.toLocaleString() },
      { title: "معاملات ۲۴ ساعت", value: last24h.toLocaleString() },
      { title: "معاملات ۷ روز", value: last7d.toLocaleString() },
      { title: "واریزی تایید شده", value: totalApprovedDeposit.toLocaleString() + " ریال" },
      { title: "برداشت تایید شده", value: totalApprovedWithdraw.toLocaleString() + " ریال" },
    ];
  }, [users, trades, deposits, withdrawals]);

  const sortByDateDesc = <T extends { createdAt: string }>(items: T[]) =>
    [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestTrades = sortByDateDesc(trades).slice(0, 5);
  const latestDeposits = sortByDateDesc(deposits).slice(0, 5);
  const latestWithdrawals = sortByDateDesc(withdrawals).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">داشبورد ادمین</h1>
          <p className="text-sm text-muted-foreground">نمای کلی از کاربران، معاملات و نقدینگی</p>
        </div>
        {systemStatus && (
          <Badge variant={systemStatus.tahesabOnline ? "success" : "destructive"}>
            {systemStatus.tahesabOnline ? "اتصال تاهساب برقرار" : "قطع ارتباط"} - آخرین همگام سازی: {new Date(systemStatus.lastSyncAt).toLocaleString("fa-IR")}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>آخرین معاملات</CardTitle>
          </CardHeader>
          <CardContent className="divide-y text-sm">
            {latestTrades.length === 0 && <p className="text-muted-foreground">هیچ معامله‌ای ثبت نشده است.</p>}
            {latestTrades.map((trade) => (
              <div key={trade.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{trade.instrument?.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {trade.side === "BUY" ? "خرید" : "فروش"} | {trade.quantity} @ {trade.pricePerUnit}
                  </p>
                </div>
                <Badge variant={trade.status === TradeStatus.APPROVED ? "success" : trade.status === TradeStatus.REJECTED ? "destructive" : "outline"}>
                  {trade.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>وضعیت سیستم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">تاهساب</span>
              <Badge variant={systemStatus?.tahesabOnline ? "success" : "destructive"}>
                {systemStatus?.tahesabOnline ? "آنلاین" : "آفلاین"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>آخرین همگام‌سازی</span>
              <span>{systemStatus ? new Date(systemStatus.lastSyncAt).toLocaleString("fa-IR") : "--"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>آخرین واریزها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestDeposits.length === 0 && <p className="text-muted-foreground">درخواستی ثبت نشده است.</p>}
            {latestDeposits.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-semibold">{dep.user?.fullName}</div>
                  <p className="text-xs text-muted-foreground">{Number(dep.amount).toLocaleString()} ریال</p>
                </div>
                <Badge variant={dep.status === "APPROVED" ? "success" : dep.status === "REJECTED" ? "destructive" : "secondary"}>{dep.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>آخرین برداشت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestWithdrawals.length === 0 && <p className="text-muted-foreground">درخواستی ثبت نشده است.</p>}
            {latestWithdrawals.map((wd) => (
              <div key={wd.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-semibold">{wd.user?.fullName}</div>
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
