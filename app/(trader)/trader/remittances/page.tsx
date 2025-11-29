"use client";

import { useEffect, useMemo, useState } from "react";

import { RemittanceDetailsDialog } from "@/components/details/remittance-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMyAccounts } from "@/lib/api/accounts";
import { getRemittances } from "@/lib/api/remittances";
import { getUsers } from "@/lib/api/users";
import { BackendUser } from "@/lib/types/backend";
import { Remittance, RemittanceStatus } from "@/lib/mock-data";

interface AccountRef {
  id: string;
  iban?: string | null;
  instrument?: { name?: string | null } | null;
}

const statusVariant: Record<RemittanceStatus, "outline" | "secondary" | "success" | "destructive"> = {
  [RemittanceStatus.PENDING]: "outline",
  [RemittanceStatus.SENT]: "secondary",
  [RemittanceStatus.COMPLETED]: "success",
  [RemittanceStatus.FAILED]: "destructive",
};

const statusLabel: Record<RemittanceStatus, string> = {
  [RemittanceStatus.PENDING]: "در انتظار",
  [RemittanceStatus.SENT]: "ارسال شد",
  [RemittanceStatus.COMPLETED]: "تسویه شد",
  [RemittanceStatus.FAILED]: "ناموفق",
};

export default function TraderRemittancesPage() {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<AccountRef[]>([]);
  const [selected, setSelected] = useState<Remittance | null>(null);
  const [statusFilter, setStatusFilter] = useState<RemittanceStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getRemittances(), getUsers(), getMyAccounts()])
      .then(([rem, userList, accList]) => {
        setRemittances(rem);
        setUsers(userList);
        setAccounts(accList.map((a) => ({ id: a.id, instrument: a.instrument })));
      })
      .catch(() => {
        setRemittances([]);
      });
  }, []);

  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const filteredRemittances = useMemo(() => {
    return remittances.filter((r) => {
      const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
      const customerName = userById[r.customerId]?.fullName ?? "";
      const matchesSearch = customerName.includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [remittances, statusFilter, search, userById]);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">حواله‌ها</h1>
          <p className="text-sm text-muted-foreground">مدیریت انتقالات بین حساب‌های مشتریان</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>وضعیت</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RemittanceStatus | "all")}> 
                <SelectTrigger>
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  {Object.values(RemittanceStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>جستجو بر اساس نام مشتری</Label>
              <Input
                placeholder="مثلاً علی رضایی"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست حواله‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">مشتری</th>
                <th className="p-2">از حساب</th>
                <th className="p-2">به حساب</th>
                <th className="p-2">مبلغ</th>
                <th className="p-2">ارز</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">تاریخ</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRemittances.map((remit) => {
                const customer = userById[remit.customerId];
                return (
                  <tr
                    key={remit.id}
                    className="border-t hover:bg-muted/40"
                    onClick={() => setSelected(remit)}
                  >
                    <td className="p-2">
                      <div className="font-semibold">{customer?.fullName ?? "مشتری"}</div>
                      <p className="text-xs text-muted-foreground">{customer?.mobile}</p>
                    </td>
                    <td className="p-2">
                      {accountById[remit.fromAccountId]?.iban ||
                        accountById[remit.fromAccountId]?.instrument?.name ||
                        remit.fromAccountId}
                    </td>
                    <td className="p-2">
                      {accountById[remit.toAccountId]?.iban ||
                        accountById[remit.toAccountId]?.instrument?.name ||
                        remit.toAccountId}
                    </td>
                    <td className="p-2">{remit.amount.toLocaleString("fa-IR")}</td>
                    <td className="p-2">ریال</td>
                    <td className="p-2">
                      <Badge variant={statusVariant[remit.status]}>{statusLabel[remit.status]}</Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{new Date(remit.createdAt).toLocaleString("fa-IR")}</td>
                    <td className="p-2 text-left">
                      <Badge variant="outline">جزئیات</Badge>
                    </td>
                  </tr>
                );
              })}
              {filteredRemittances.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-muted-foreground">
                    حواله‌ای ثبت نشده است
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
