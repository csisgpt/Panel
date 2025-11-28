'use client';

import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

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
              <Card className="space-y-2 p-4">
                <p className="text-sm text-muted-foreground">
                  این یک محیط نمایشی است و داده‌ها واقعی نیستند. برای نمایش قابلیت‌های رابط کاربری طراحی شده است.
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
