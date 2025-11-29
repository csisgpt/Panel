"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/settings";
import { AdminUiSettings } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminUiSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const data = await getAdminSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError("خطا در دریافت تنظیمات");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await updateAdminSettings(settings);
      setSettings(updated);
      toast({ title: "تنظیمات ذخیره شد" });
    } catch (err) {
      toast({ title: "خطا در ذخیره تنظیمات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!settings && !error) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات سیستم</h1>
        <p className="text-sm text-muted-foreground">پیکربندی ظاهری و امکانات پنل ادمین</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>ظاهر و ترجیح نمایش</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-semibold">تم</div>
            <Select
              value={settings?.theme}
              onValueChange={(v) => setSettings((prev) => (prev ? { ...prev, theme: v as AdminUiSettings["theme"] } : prev))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب تم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">روشن</SelectItem>
                <SelectItem value="dark">تیره</SelectItem>
                <SelectItem value="system">خودکار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">قالب تاریخ</div>
            <Select
              value={settings?.dateFormat}
              onValueChange={(v) =>
                setSettings((prev) => (prev ? { ...prev, dateFormat: v as AdminUiSettings["dateFormat"] } : prev))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="قالب تاریخ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jalali">جلالی</SelectItem>
                <SelectItem value="gregorian">میلادی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-semibold">نمایش امکانات آزمایشی</div>
                <p className="text-xs text-muted-foreground">بخش‌های در حال توسعه را فعال می‌کند</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border border-input"
                checked={settings?.showExperimentalFeatures}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, showExperimentalFeatures: e.target.checked } : prev
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </div>
  );
}
