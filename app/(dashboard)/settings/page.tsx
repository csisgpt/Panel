'use client';

import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getMockSystemStatus, SystemStatus } from "@/lib/mock-data";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    getMockSystemStatus().then(setSystemStatus);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات</h1>
        <p className="text-sm text-muted-foreground">پیکربندی ظاهر و تنظیمات عمومی</p>
      </div>
      <Tabs
        items={[
          {
            value: "general",
            label: "تنظیمات عمومی",
            content: (
              <Card className="space-y-3 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">واحد پول پیش‌فرض</p>
                    <Input defaultValue="ریال ایران" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">نمایش هشدارهای ریسک</p>
                    <Select defaultValue="on">
                      <option value="on">فعال</option>
                      <option value="off">غیرفعال</option>
                    </Select>
                  </div>
                </div>
                <Button className="mt-2">ذخیره تنظیمات</Button>
              </Card>
            )
          },
          {
            value: "appearance",
            label: "ظاهر و تم",
            content: (
              <Card className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">انتخاب تم</p>
                <div className="flex gap-2">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                    روشن
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                    تاریک
                  </Button>
                  <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                    سیستم
                  </Button>
                </div>
              </Card>
            )
          },
          {
            value: "about",
            label: "درباره سیستم",
            content: (
              <Card className="space-y-3 p-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/70 p-3">
                  <div>
                    <p className="text-sm font-semibold">وضعیت اتصال به تاهساب</p>
                    <p className="text-xs text-muted-foreground">بررسی همگام‌سازی با سیستم حسابداری محلی</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: systemStatus?.tahesabOnline ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
                      color: systemStatus?.tahesabOnline ? "#15803d" : "#b91c1c"
                    }}
                  >
                    {systemStatus?.tahesabOnline ? "آنلاین" : "آفلاین"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {systemStatus
                    ? `آخرین همگام‌سازی: ${new Date(systemStatus.lastSyncAt).toLocaleString("fa-IR")}`
                    : "در حال بارگذاری وضعیت سیستم..."}
                </p>
                <p className="text-xs text-muted-foreground">نسخه سیستم: 1.0.0</p>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
