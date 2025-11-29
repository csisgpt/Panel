"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUser } from "@/lib/api/users";
import { getAccounts } from "@/lib/api/accounts";
import { getMyTrades } from "@/lib/api/trades";
import { BackendUser, Account, Trade, TradeStatus, UserRole, UserStatus } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { mapRiskLevel, mapUserStatus, RiskLevel } from "@/lib/ui-mappers";

const openTradeStatuses = [TradeStatus.PENDING, TradeStatus.APPROVED];

export default function TraderCustomersPage() {
  const [clients, setClients] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BackendUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersData, accountData, tradesData] = await Promise.all([
          getUsers(),
          getAccounts(),
          getMyTrades(),
        ]);
        setClients(usersData.filter((u) => u.role === UserRole.CLIENT));
        setAccounts(accountData);
        setTrades(tradesData);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const clientRows = useMemo(() => {
    return clients.map((client) => {
      const clientAccounts = accounts.filter((acc) => acc.userId === client.id);
      const clientTrades = trades.filter((t) => t.clientId === client.id);
      const openTrades = clientTrades.filter((t) => openTradeStatuses.includes(t.status)).length;
      const balance = clientAccounts
        .filter((acc) => acc.instrument?.code === "IRR")
        .reduce((sum, acc) => sum + Number(acc.balance || "0"), 0);
      const exposure = clientTrades
        .filter((t) => openTradeStatuses.includes(t.status))
        .reduce((sum, t) => sum + Number(t.quantity) * Number(t.pricePerUnit), 0);
      const riskScore = exposure / (balance + 1_000_000);
      const riskLevel: RiskLevel = riskScore > 1 ? "HIGH" : riskScore > 0.5 ? "MEDIUM" : "LOW";

      return {
        client,
        accountCount: clientAccounts.length,
        openTrades,
        riskLevel,
        balance,
        recentTrades: clientTrades.slice(0, 4),
      };
    });
  }, [accounts, clients, trades]);

  const filtered = useMemo(() => {
    return clientRows.filter((row) => {
      const matchSearch = [row.client.fullName, row.client.mobile]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "ALL" || row.client.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [clientRows, search, statusFilter]);

  const handleStatusToggle = async (user: BackendUser) => {
    const newStatus = user.status === UserStatus.BLOCKED ? UserStatus.ACTIVE : UserStatus.BLOCKED;
    const updated = await updateUser(user.id, { status: newStatus });
    setClients((prev) => prev.map((c) => (c.id === user.id ? updated : c)));
    toast({ title: newStatus === UserStatus.BLOCKED ? "کاربر مسدود شد" : "کاربر فعال شد" });
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">مشتریان من</h1>
          <p className="text-sm text-muted-foreground">مدیریت وضعیت و ریسک مشتریان زیرمجموعه</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="جستجو نام یا موبایل"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "ALL")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>فعال</SelectItem>
                <SelectItem value={UserStatus.BLOCKED}>مسدود</SelectItem>
                <SelectItem value={UserStatus.PENDING_APPROVAL}>در انتظار</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست مشتریان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>نام</TableHead>
                  <TableHead>موبایل</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تعداد حساب</TableHead>
                  <TableHead>معاملات باز</TableHead>
                  <TableHead>ریسک</TableHead>
                  <TableHead>اقدام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const statusBadge = mapUserStatus(row.client.status);
                  const riskBadge = mapRiskLevel(row.riskLevel);
                  return (
                    <TableRow key={row.client.id}>
                      <TableCell className="font-semibold">{row.client.fullName}</TableCell>
                      <TableCell>{row.client.mobile}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell>{row.accountCount}</TableCell>
                      <TableCell>{row.openTrades}</TableCell>
                      <TableCell>
                        <Badge variant={riskBadge.variant}>{riskBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="space-x-2 space-x-reverse">
                        <Button size="sm" variant="outline" onClick={() => setSelected(row.client)}>
                          مشاهده
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleStatusToggle(row.client)}>
                          {row.client.status === UserStatus.BLOCKED ? "رفع انسداد" : "مسدود کردن"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      مشتری مطابق فیلتر یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>پروفایل مشتری</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="font-semibold">{selected.fullName}</div>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                  <p className="text-xs text-muted-foreground">{selected.mobile}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-muted-foreground">وضعیت</div>
                  <Badge className="mt-1" variant={mapUserStatus(selected.status).variant}>
                    {mapUserStatus(selected.status).label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">حساب‌ها</span>
                  <Badge variant="outline">
                    {accounts.filter((a) => a.userId === selected.id).length}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {accounts
                    .filter((a) => a.userId === selected.id)
                    .map((acc) => (
                      <div key={acc.id} className="rounded-lg border p-3">
                        <div className="font-semibold">{acc.instrument?.name}</div>
                        <p className="text-xs text-muted-foreground">موجودی: {acc.balance}</p>
                      </div>
                    ))}
                  {accounts.filter((a) => a.userId === selected.id).length === 0 && (
                    <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                      حسابی ثبت نشده است.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">معاملات اخیر</span>
                  <Badge variant="outline">
                    {
                      trades.filter((t) => t.clientId === selected.id).length
                    }
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {trades
                    .filter((t) => t.clientId === selected.id)
                    .slice(0, 4)
                    .map((t) => (
                      <div key={t.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{t.instrument?.name}</span>
                          <Badge variant={t.side === "BUY" ? "secondary" : "outline"}>
                            {t.side === "BUY" ? "خرید" : "فروش"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.quantity} @ {t.pricePerUnit}</p>
                        <p className="text-[11px] text-muted-foreground">
                          وضعیت: {t.status}
                        </p>
                      </div>
                    ))}
                  {trades.filter((t) => t.clientId === selected.id).length === 0 && (
                    <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                      معامله‌ای ثبت نشده است.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
