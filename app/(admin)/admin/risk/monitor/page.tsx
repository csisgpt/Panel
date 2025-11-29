"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsers } from "@/lib/api/users";
import { getAccounts } from "@/lib/api/accounts";
import { getTrades } from "@/lib/api/trades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendUser, Account, Trade, TradeStatus, UserRole } from "@/lib/types/backend";
import { mapRiskLevel, RiskLevel } from "@/lib/ui-mappers";

interface ClientRiskRow {
  client: BackendUser;
  openTradesCount: number;
  exposure: number;
  availableBalance: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

const openStatuses = [TradeStatus.PENDING, TradeStatus.APPROVED];

export default function RiskMonitorPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<RiskLevel | "ALL">("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [u, a, t] = await Promise.all([getUsers(), getAccounts(), getTrades()]);
        setUsers(u.filter((user) => user.role === UserRole.CLIENT));
        setAccounts(a);
        setTrades(t);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows: ClientRiskRow[] = useMemo(() => {
    return users.map((client) => {
      const clientTrades = trades.filter(
        (t) => t.clientId === client.id && openStatuses.includes(t.status)
      );
      const clientAccounts = accounts.filter((acc) => acc.userId === client.id);
      const exposure = clientTrades.reduce(
        (sum, t) => sum + Number(t.quantity) * Number(t.pricePerUnit),
        0
      );
      const availableBalance = clientAccounts
        .filter((acc) => acc.instrument?.code === "IRR")
        .reduce((sum, acc) => sum + Number(acc.balance || "0"), 0);
      const riskScore = exposure / (availableBalance + 1_000_000);
      const riskLevel: RiskLevel = riskScore > 1 ? "HIGH" : riskScore > 0.5 ? "MEDIUM" : "LOW";

      return {
        client,
        openTradesCount: clientTrades.length,
        exposure,
        availableBalance,
        riskScore,
        riskLevel,
      };
    });
  }, [accounts, trades, users]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) =>
        [row.client.fullName, row.client.mobile].some((field) =>
          field?.toLowerCase().includes(search.toLowerCase())
        )
      )
      .filter((row) => levelFilter === "ALL" || row.riskLevel === levelFilter)
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [rows, search, levelFilter]);

  const summary = useMemo(() => {
    const totalClients = rows.length;
    const highRisk = rows.filter((r) => r.riskLevel === "HIGH").length;
    const totalExposure = rows.reduce((sum, r) => sum + r.exposure, 0);
    return { totalClients, highRisk, totalExposure };
  }, [rows]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مانیتورینگ ریسک</h1>
        <p className="text-sm text-muted-foreground">نمای کلی ریسک مشتریان و مواجهه باز</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">تعداد مشتریان تحت نظر</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.totalClients}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">مشتریان پرریسک</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">{summary.highRisk}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">کل مواجهه باز (ریال)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.totalExposure.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="جستجو نام/موبایل"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as RiskLevel | "ALL")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="همه سطوح" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه سطوح</SelectItem>
                <SelectItem value="LOW">کم</SelectItem>
                <SelectItem value="MEDIUM">متوسط</SelectItem>
                <SelectItem value="HIGH">بالا</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>وضعیت ریسک مشتریان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>مشتری</TableHead>
                  <TableHead>معاملات باز</TableHead>
                  <TableHead>مواجهه (ریال)</TableHead>
                  <TableHead>موجودی آزاد (ریال)</TableHead>
                  <TableHead>امتیاز ریسک</TableHead>
                  <TableHead>سطح</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const badge = mapRiskLevel(row.riskLevel);
                  return (
                    <TableRow key={row.client.id}>
                      <TableCell>
                        <div className="font-semibold">{row.client.fullName}</div>
                        <p className="text-xs text-muted-foreground">{row.client.mobile}</p>
                      </TableCell>
                      <TableCell>{row.openTradesCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.exposure.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.availableBalance.toLocaleString()}
                      </TableCell>
                      <TableCell>{row.riskScore.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      مشتری مطابق فیلتر پیدا نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
