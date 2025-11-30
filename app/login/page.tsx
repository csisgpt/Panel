"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMockUsers } from "@/lib/mock-data";
import { saveSession } from "@/lib/session";
import { BackendUser, UserRole } from "@/lib/types/backend";

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [role, setRole] = useState<UserRole>(UserRole.TRADER);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    getMockUsers().then((list) => {
      setUsers(list);
      const defaultUser = list.find((u) => u.role === UserRole.TRADER);
      setUserId(defaultUser?.id);
    });
  }, []);

  const filteredUsers = useMemo(() => users.filter((u) => u.role === role), [users, role]);
  const selectedUser = filteredUsers.find((u) => u.id === userId) ?? filteredUsers[0];

  const handleLogin = () => {
    if (!selectedUser) return;
    saveSession({ role: role === UserRole.ADMIN ? "ADMIN" : "TRADER", userId: selectedUser.id }, selectedUser);
    const nextPath = role === UserRole.ADMIN ? "/admin/dashboard" : "/trader/dashboard";
    router.replace(nextPath);
  };

  useEffect(() => {
    if (!filteredUsers.find((u) => u.id === userId)) {
      setUserId(filteredUsers[0]?.id);
    }
  }, [filteredUsers, userId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4" dir="rtl">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Gold Nest Panel</p>
          <CardTitle className="text-2xl font-bold">ورود آزمایشی</CardTitle>
          <p className="text-sm text-muted-foreground">ورود آزمایشی با داده‌های شبیه‌سازی‌شده</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>نقش</Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.TRADER}>معامله‌گر</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>ادمین</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>کاربر</Label>
              <Select value={selectedUser?.id} onValueChange={(val) => setUserId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب کاربر" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleLogin} disabled={!selectedUser}>
            <LogIn className="ml-2 h-4 w-4" />
            ورود سریع
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
