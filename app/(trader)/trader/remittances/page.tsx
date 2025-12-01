"use client";

import { useEffect, useMemo, useState } from "react";

import { RemittanceDetailsDialog } from "@/components/details/remittance-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAccounts } from "@/lib/api/accounts";
import { getRemittances } from "@/lib/api/remittances";
import { getUsers } from "@/lib/api/users";
import { BackendUser, Account } from "@/lib/types/backend";
import { Remittance, RemittanceStatus } from "@/lib/mock-data";

export default function TraderRemittancesPage() {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Remittance | null>(null);
  const [statusFilter, setStatusFilter] = useState<RemittanceStatus | "ALL">("ALL");
  const [currencyFilter, setCurrencyFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getRemittances(), getUsers(), getAccounts()])
      .then(([remData, userData, accountData]) => {
        setRemittances(remData);
        setUsers(userData);
        setAccounts(accountData);
      })
      .catch(() => setRemittances([]));
  }, []);

  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);
  const currencies = useMemo(() => ["ALL", ...new Set(remittances.map(() => "IRR"))], [remittances]);

  const filteredRemittances = useMemo(() => {
    return remittances.filter((r) => {
      const matchesStatus = statusFilter === "ALL" ? true : r.status === statusFilter;
      const matchesCurrency = currencyFilter === "ALL" ? true : currencyFilter === "IRR";
      const customerName = userById[r.customerId]?.fullName ?? "";
      const matchesSearch = [customerName, r.fromAccountId, r.toAccountId].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      );
      return matchesStatus && matchesCurrency && matchesSearch;
    });
  }, [currencyFilter, remittances, search, statusFilter, userById]);

  const outgoing = remittances.reduce((sum, r) => sum + (r.fromAccountId.startsWith("acc-") ? r.amount : 0), 0);
  const incoming = remittances.reduce((sum, r) => sum + (r.toAccountId.startsWith("acc-") ? r.amount : 0), 0);

  const selectedWithRefs = selected
    ? {
        ...selected,
        customer: userById[selected.customerId],
        fromAccount: accountById[selected.fromAccountId],
        toAccount: accountById[selected.toAccountId],
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">حواله‌ها</h1>
        <p className="text-sm text-muted-foreground">مدیریت حواله‌های ارسال و دریافت شده.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">مجموع ارسال‌ها</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{outgoing.toLocaleString("fa-IR")} ریال</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">مجموع دریافتی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{incoming.toLocaleString("fa-IR")} ریال</CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>وضعیت</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RemittanceStatus | "ALL")}>
              <SelectTrigger>
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                {Object.values(RemittanceStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ارز</Label>
            <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="ارز" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "ALL" ? "همه" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>جستجو</Label>
            <Input placeholder="نام مشتری یا حساب" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست حواله‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="text-right">
                <th className="p-2">از</th>
                <th className="p-2">به</th>
                <th className="p-2">مبلغ</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRemittances.map((rem) => (
                <tr
                  key={rem.id}
                  className="border-t cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(rem)}
                >
                  <td className="p-2">
                    <div className="font-semibold">{accountById[rem.fromAccountId]?.id ?? rem.fromAccountId}</div>
                    <p className="text-xs text-muted-foreground">{userById[rem.customerId]?.fullName}</p>
                  </td>
                  <td className="p-2">{accountById[rem.toAccountId]?.id ?? rem.toAccountId}</td>
                  <td className="p-2 text-right font-semibold">{rem.amount.toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <Badge variant={badgeVariant(rem.status)}>{statusLabel(rem.status)}</Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(rem.createdAt).toLocaleDateString("fa-IR")}</td>
                </tr>
              ))}
              {!filteredRemittances.length && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">
                    حواله‌ای مطابق فیلتر یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <RemittanceDetailsDialog
        remittance={selectedWithRefs}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function badgeVariant(status: RemittanceStatus) {
  switch (status) {
    case RemittanceStatus.PENDING:
      return "warning" as const;
    case RemittanceStatus.SENT:
      return "secondary" as const;
    case RemittanceStatus.COMPLETED:
      return "success" as const;
    default:
      return "destructive" as const;
  }
}

function statusLabel(status: RemittanceStatus) {
  switch (status) {
    case RemittanceStatus.PENDING:
      return "در انتظار";
    case RemittanceStatus.SENT:
      return "ارسال شد";
    case RemittanceStatus.COMPLETED:
      return "تکمیل شده";
    default:
      return "ناموفق";
  }
}
