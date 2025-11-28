"use client";

import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser } from "@/lib/api/users";
import { BackendUser, CreateUserDto, UpdateUserDto, UserRole, UserStatus } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [form, setForm] = useState<CreateUserDto>({
    fullName: "",
    mobile: "",
    email: "",
    password: "mock123",
    role: UserRole.TRADER,
  });
  const { toast } = useToast();

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleCreate = async () => {
    const created = await createUser(form);
    setUsers((prev) => [...prev, created]);
    toast({ title: "کاربر ایجاد شد" });
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    const updated = await updateUser(userId, { status } as UpdateUserDto);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
        <p className="text-sm text-muted-foreground">همگام با DTOهای بک‌اند</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ایجاد کاربر جدید</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>نام کامل</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>موبایل</Label>
            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>رمز عبور</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="space-y-2">
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
          <div className="flex items-end">
            <Button onClick={handleCreate} className="w-full">
              ثبت کاربر
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <th className="p-2">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.fullName}</td>
                  <td className="p-2">{user.mobile}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">{user.status}</td>
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
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
