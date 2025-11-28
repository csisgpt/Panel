"use client";

import { useEffect, useMemo, useState } from "react";
import { getTahesabLogs } from "@/lib/api/tahesab";
import { TahesabLog, TahesabLogLevel } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const levelLabels: Record<TahesabLogLevel, string> = {
  info: "اطلاع",
  warn: "هشدار",
  error: "خطا",
};

const levelVariant: Record<TahesabLogLevel, "outline" | "secondary" | "destructive"> = {
  info: "secondary",
  warn: "outline",
  error: "destructive",
};

export default function TahesabLogsPage() {
  const [logs, setLogs] = useState<TahesabLog[]>([]);
  const [level, setLevel] = useState<TahesabLogLevel | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getTahesabLogs();
        setLogs(result);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت گزارش‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = level === "ALL" || log.level === level;
      const matchesQuery = query
        ? `${log.message} ${log.entityRef ?? ""}`.toLowerCase().includes(query.toLowerCase())
        : true;
      return matchesLevel && matchesQuery;
    });
  }, [logs, level, query]);

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
          <h1 className="text-2xl font-bold">گزارش‌های همگام‌سازی تاهساب</h1>
          <p className="text-sm text-muted-foreground">پیگیری آخرین رخدادها و خطاها</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="جستجو پیام یا شناسه"
            className="w-48"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={level} onValueChange={(v) => setLevel(v as TahesabLogLevel | "ALL")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="سطح" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه</SelectItem>
              <SelectItem value="info">اطلاع</SelectItem>
              <SelectItem value="warn">هشدار</SelectItem>
              <SelectItem value="error">خطا</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>آخرین رخدادها</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] space-y-3 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1 rounded-xl border bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Badge variant={levelVariant[log.level]}>{levelLabels[log.level]}</Badge>
                  <span>{new Date(log.time).toLocaleString("fa-IR")}</span>
                </div>
                <p className="text-sm text-foreground">{log.message}</p>
                {log.entityRef && <p className="text-xs text-muted-foreground">مرجع: {log.entityRef}</p>}
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">موردی یافت نشد</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
