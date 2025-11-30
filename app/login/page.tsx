"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMockUsers } from "@/lib/mock-data";
import { saveSession } from "@/lib/session";
import { BackendUser, UserRole } from "@/lib/types/backend";

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    getMockUsers().then((list) => {
      setUsers(list);
      const defaultUser = list.find((u) => u.role === UserRole.TRADER) ?? list[0];
      setUserId(defaultUser?.id);
    });
  }, []);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => a.fullName.localeCompare(b.fullName, "fa", { sensitivity: "base" })),
    [users],
  );
  const selectedUser = sortedUsers.find((u) => u.id === userId) ?? sortedUsers[0];

  const handleLogin = () => {
    if (!selectedUser) return;
    saveSession({ role: selectedUser.role, userId: selectedUser.id }, selectedUser);
    const nextPath = selectedUser.role === UserRole.ADMIN ? "/admin/dashboard" : "/trader/dashboard";
    router.replace(nextPath);
  };

  useEffect(() => {
    if (!sortedUsers.find((u) => u.id === userId)) {
      setUserId(sortedUsers[0]?.id);
    }
  }, [sortedUsers, userId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 px-4" dir="rtl">
      <Card className="w-full max-w-md border border-slate-200 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Gold Nest Panel</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              ورود سریع با کاربران شبیه‌سازی شده برای بررسی محیط پنل
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">انتخاب کاربر</Label>
            <Select value={selectedUser?.id} onValueChange={(val) => setUserId(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="یک کاربر را برگزینید" />
              </SelectTrigger>
              <SelectContent>
                {sortedUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName} {user.role === UserRole.ADMIN ? "(ادمین)" : "(معامله‌گر)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" size="lg" onClick={handleLogin} disabled={!selectedUser}>
            <LogIn className="ml-2 h-4 w-4" />
            ورود به پنل
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
