"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsers, createUser, updateUser } from "@/lib/api/users";
import { BackendUser, CreateUserDto, UpdateUserDto, UserRole, UserStatus } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateUserDto>({
    fullName: "",
    mobile: "",
    email: "",
    password: "mock123",
    role: UserRole.TRADER,
  });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت کاربران");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCreate = async () => {
    if (!form.fullName || !form.mobile || !form.email) {
      toast({ title: "همه فیلدها الزامی است", variant: "destructive" });
      return;
    }
    setSaving(true);
    const created = await createUser(form);
    setUsers((prev) => [...prev, created]);
    toast({ title: "کاربر ایجاد شد" });
    setOpen(false);
    setSaving(false);
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    const updated = await updateUser(userId, { status } as UpdateUserDto);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch = [user.fullName, user.mobile, user.email].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      );
      const matchRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
        <p className="text-sm text-muted-foreground">همگام با DTOهای بک‌اند</p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="جستجو نام/موبایل/ایمیل" className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "ALL") }>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="نقش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه نقش‌ها</SelectItem>
              <SelectItem value={UserRole.ADMIN}>ادمین</SelectItem>
              <SelectItem value={UserRole.TRADER}>معامله‌گر</SelectItem>
              <SelectItem value={UserRole.CLIENT}>مشتری</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "ALL") }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>فعال</SelectItem>
              <SelectItem value={UserStatus.BLOCKED}>مسدود</SelectItem>
              <SelectItem value={UserStatus.PENDING_APPROVAL}>در انتظار تایید</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setOpen(true)}>کاربر جدید</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">نام</th>
                <th className="p-2">موبایل</th>
                <th className="p-2">نقش</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">تاریخ ایجاد</th>
                <th className="p-2">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">
                    <div className="font-semibold">{user.fullName}</div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="p-2">{user.mobile}</td>
                  <td className="p-2">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={user.status === UserStatus.ACTIVE ? "success" : user.status === UserStatus.BLOCKED ? "destructive" : "secondary"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("fa-IR")}</td>
                  <td className="p-2">
                    <Select value={user.status} onValueChange={(v) => handleStatusChange(user.id, v as UserStatus)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserStatus.ACTIVE}>فعال</SelectItem>
                        <SelectItem value={UserStatus.BLOCKED}>مسدود</SelectItem>
                        <SelectItem value={UserStatus.PENDING_APPROVAL}>در انتظار تایید</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-sm text-muted-foreground" colSpan={6}>
                    هیچ کاربری یافت نشد
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
            <DialogTitle>کاربر جدید</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>نام کامل</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>موبایل</Label>
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>ایمیل</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>رمز عبور</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>نقش</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger>
                  <SelectValue placeholder="نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>ادمین</SelectItem>
                  <SelectItem value={UserRole.TRADER}>معامله‌گر</SelectItem>
                  <SelectItem value={UserRole.CLIENT}>مشتری</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "در حال ثبت..." : "ثبت کاربر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
