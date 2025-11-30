"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TahesabSyncStatusCard } from "@/components/tahesab/tahesab-sync-status-card";
import {
  getTahesabLogs,
  getTahesabSyncStatus,
  testTahesabConnection,
  triggerTahesabSync,
} from "@/lib/api/tahesab";
import type { TahesabLog } from "@/lib/api/tahesab";
import type { TahesabSyncStatus } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";

const levelVariant: Record<string, "secondary" | "outline" | "destructive"> = {
  INFO: "secondary",
  WARN: "outline",
  ERROR: "destructive",
};

export default function TahesabConnectionPage() {
  const [status, setStatus] = useState<TahesabSyncStatus | null>(null);
  const [logs, setLogs] = useState<TahesabLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [st, lg] = await Promise.all([getTahesabSyncStatus(), getTahesabLogs({ limit: 8 })]);
        setStatus(st);
        setLogs(lg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await testTahesabConnection();
      toast({ title: res.success ? "اتصال موفق" : "اتصال ناموفق", description: res.message, variant: res.success ? "default" : "destructive" });
      const refreshedLogs = await getTahesabLogs({ limit: 8 });
      setLogs(refreshedLogs);
    } catch (err) {
      toast({ title: "خطا در تست اتصال", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await triggerTahesabSync();
      if (res.status) setStatus(res.status);
      toast({ title: res.accepted ? "سینک دستی ثبت شد" : "عدم پذیرش سینک", variant: res.accepted ? "default" : "destructive" });
      const [st, refreshedLogs] = await Promise.all([getTahesabSyncStatus(), getTahesabLogs({ limit: 8 })]);
      setStatus(res.status ?? st);
      setLogs(refreshedLogs);
    } catch (err) {
      toast({ title: "خطا در شروع سینک", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">وضعیت اتصال تاهساب</h1>
        <p className="text-sm text-muted-foreground">کنترل اتصال، تست سلامت و مشاهده رخدادهای اخیر</p>
      </div>

      <TahesabSyncStatusCard status={status} description="آخرین موفقیت و برنامه همگام‌سازی" />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>اقدامات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleTest} disabled={testing || loading} variant="outline">
            {testing ? "در حال تست..." : "تست اتصال"}
          </Button>
          <Button onClick={handleSync} disabled={syncing || loading}>
            {syncing ? "در حال سینک..." : "سینک دستی"}
          </Button>
          <div className="hidden h-6 border-r sm:block" />
          <p className="text-sm text-muted-foreground">
            با این دکمه‌ها می‌توانید سلامت لینک را بسنجید یا یک سینک خارج از برنامه اجرا کنید.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>گزارش‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-right">زمان</th>
                <th className="p-2 text-right">سطح</th>
                <th className="p-2 text-right">عملیات</th>
                <th className="p-2 text-right">پیام</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2 text-xs text-muted-foreground">{new Date(log.time).toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <Badge variant={levelVariant[log.level] ?? "secondary"}>{log.level}</Badge>
                  </td>
                  <td className="p-2">{log.operation}</td>
                  <td className="p-2 text-muted-foreground">{log.message}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-sm text-muted-foreground">
                    گزارشی وجود ندارد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
