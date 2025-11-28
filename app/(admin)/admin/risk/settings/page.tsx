"use client";

import { useEffect, useState } from "react";
import { getRiskSettings, updateRiskSettings } from "@/lib/api/risk";
import { RiskSettingsConfig } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function RiskSettingsPage() {
  const [config, setConfig] = useState<RiskSettingsConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRiskSettings();
        setConfig(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت تنظیمات");
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof RiskSettingsConfig, value: number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await updateRiskSettings(config);
      setConfig(updated);
      toast({ title: "تنظیمات ذخیره شد" });
    } catch (err) {
      toast({ title: "خطا در ذخیره تنظیمات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!config && !error) {
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
      <div>
        <h1 className="text-2xl font-bold">تنظیمات ریسک</h1>
        <p className="text-sm text-muted-foreground">سقف‌های ریسک کلی و مشتری را مدیریت کنید</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>حدود مجاز</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">حداکثر مواجهه کل (ریال)</label>
            <Input
              type="number"
              value={config?.globalMaxExposure ?? 0}
              onChange={(e) => handleChange("globalMaxExposure", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">حداکثر مواجهه هر مشتری (ریال)</label>
            <Input
              type="number"
              value={config?.maxExposurePerClient ?? 0}
              onChange={(e) => handleChange("maxExposurePerClient", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">حداکثر معاملات باز هر مشتری</label>
            <Input
              type="number"
              value={config?.maxOpenTradesPerClient ?? 0}
              onChange={(e) => handleChange("maxOpenTradesPerClient", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
            آخرین بروزرسانی: {config ? new Date(config.updatedAt).toLocaleString("fa-IR") : "-"}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </div>
    </div>
  );
}
