"use client";

import { useEffect, useMemo, useState } from "react";
import { getRemittances, createRemittance } from "@/lib/api/remittances";
import { getUsers } from "@/lib/api/users";
import { getMyAccounts } from "@/lib/api/accounts";
import { BackendUser, UserRole } from "@/lib/types/backend";
import { Remittance, RemittanceStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const statusVariant: Record<RemittanceStatus, "outline" | "secondary" | "success" | "destructive"> = {
  PENDING: "outline",
  SENT: "secondary",
  COMPLETED: "success",
  FAILED: "destructive",
};

const statusLabel: Record<RemittanceStatus, string> = {
  PENDING: "در انتظار",
  SENT: "ارسال شد",
  COMPLETED: "تسویه شد",
  FAILED: "ناموفق",
};

export default function TraderRemittancesPage() {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
    status: RemittanceStatus.PENDING,
  });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [remit, userList, accList] = await Promise.all([getRemittances(), getUsers(), getMyAccounts()]);
        setRemittances(remit);
        setUsers(userList.filter((u) => u.role === UserRole.CLIENT));
        setAccounts(
          accList.map((a) => ({
            id: a.id,
            label: `${a.instrument?.name ?? "حساب"} - ${a.balance} ${a.instrument?.unit === "PIECE" ? "عدد" : ""}`,
          }))
        );
        setError(null);
      } catch (err) {
        setError("خطا در بارگذاری حواله‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.customerId || !form.fromAccountId || !form.toAccountId || !form.amount) {
      toast({ title: "همه فیلدها الزامی است", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const created = await createRemittance({
        customerId: form.customerId,
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
        amount: Number(form.amount),
        description: form.description,
        status: form.status,
      });
      setRemittances((prev) => [created, ...prev]);
      toast({ title: "حواله ثبت شد" });
      setOpen(false);
      setForm({ customerId: "", fromAccountId: "", toAccountId: "", amount: "", description: "", status: RemittanceStatus.PENDING });
    } catch (err) {
      toast({ title: "خطا در ثبت حواله", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const enrichedRemittances = useMemo(() => {
    return remittances.map((r) => ({
      ...r,
      customer: users.find((u) => u.id === r.customerId),
    }));
  }, [remittances, users]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
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
          <h1 className="text-2xl font-bold">حواله‌ها</h1>
          <p className="text-sm text-muted-foreground">مدیریت انتقالات بین حساب‌های مشتریان</p>
        </div>
        <Button onClick={() => setOpen(true)}>حواله جدید</Button>
      </div>

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
                <th className="p-2">وضعیت</th>
                <th className="p-2">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {enrichedRemittances.map((remit) => (
                <tr key={remit.id} className="border-t">
                  <td className="p-2">
                    <div className="font-semibold">{remit.customer?.fullName ?? "مشتری"}</div>
                    <p className="text-xs text-muted-foreground">{remit.customer?.mobile}</p>
                  </td>
                  <td className="p-2">{remit.fromAccountId}</td>
                  <td className="p-2">{remit.toAccountId}</td>
                  <td className="p-2">{remit.amount.toLocaleString()} ریال</td>
                  <td className="p-2">
                    <Badge variant={statusVariant[remit.status]}>{statusLabel[remit.status]}</Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(remit.createdAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
              {enrichedRemittances.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sm text-muted-foreground">
                    حواله‌ای ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>حواله جدید</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>مشتری</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب مشتری" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>از حساب</Label>
              <Select value={form.fromAccountId} onValueChange={(v) => setForm({ ...form, fromAccountId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="حساب مبدا" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>به حساب</Label>
              <Select value={form.toAccountId} onValueChange={(v) => setForm({ ...form, toAccountId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="حساب مقصد" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>مبلغ (ریال)</Label>
              <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>توضیحات</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "در حال ثبت..." : "ثبت حواله"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
