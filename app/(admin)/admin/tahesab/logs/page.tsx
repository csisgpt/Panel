"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TahesabDocumentDetailsDialog } from "@/components/tahesab/tahesab-document-details-dialog";
import { getTahesabDocumentById } from "@/lib/api/tahesab";
import { getTahesabLogs } from "@/lib/api/tahesab";
import type { TahesabLog } from "@/lib/api/tahesab";
import type { TahesabDocumentDetail } from "@/lib/types/backend";

const levelVariant: Record<string, "secondary" | "outline" | "destructive"> = {
  INFO: "secondary",
  WARN: "outline",
  ERROR: "destructive",
};

const levelLabels: Record<string, string> = {
  INFO: "اطلاع",
  WARN: "هشدار",
  ERROR: "خطا",
};

const operations = ["ALL", "SYNC_BALANCE", "SYNC_TRADE", "SYNC_REMITTANCE", "FETCH_DOCUMENTS", "MANUAL_SYNC", "TEST_CONNECTION"];
const entityTypes = ["ALL", "trade", "deposit", "withdrawal", "remittance", "balance", "none"];

export default function TahesabLogsPage() {
  const [logs, setLogs] = useState<TahesabLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ level: "ALL", operation: "ALL", entityType: "ALL", search: "", dateFrom: "", dateTo: "" });
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTahesabLogs();
        setLogs(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت گزارش‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadDoc = async () => {
      if (!selectedDocId) {
        setSelectedDoc(null);
        return;
      }
      try {
        const doc = await getTahesabDocumentById(selectedDocId);
        setSelectedDoc(doc);
      } catch (err) {
        setSelectedDoc(null);
      }
    };
    loadDoc();
  }, [selectedDocId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = filters.level === "ALL" ? true : log.level === filters.level;
      const matchesOp = filters.operation === "ALL" ? true : log.operation === filters.operation;
      const matchesEntity = filters.entityType === "ALL" ? true : log.entityType === filters.entityType;
      const matchesSearch = filters.search
        ? `${log.message} ${log.internalRef ?? ""}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesFrom = filters.dateFrom ? new Date(log.time) >= new Date(filters.dateFrom) : true;
      const matchesTo = filters.dateTo ? new Date(log.time) <= new Date(filters.dateTo) : true;
      return matchesLevel && matchesOp && matchesEntity && matchesSearch && matchesFrom && matchesTo;
    });
  }, [logs, filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">گزارش‌های همگام‌سازی تاهساب</h1>
        <p className="text-sm text-muted-foreground">پیگیری آخرین رخدادها و خطاها</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="متن جستجو"
              className="w-48"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="w-40"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-40"
            />
            <Select value={filters.level} onValueChange={(v) => setFilters((f) => ({ ...f, level: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="سطح" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value="INFO">اطلاع</SelectItem>
                <SelectItem value="WARN">هشدار</SelectItem>
                <SelectItem value="ERROR">خطا</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.operation} onValueChange={(v) => setFilters((f) => ({ ...f, operation: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="عملیات" />
              </SelectTrigger>
              <SelectContent>
                {operations.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op === "ALL" ? "همه عملیات" : op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.entityType} onValueChange={(v) => setFilters((f) => ({ ...f, entityType: v }))}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="نوع رکورد" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et === "ALL" ? "همه" : et}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            onClick={() => setFilters({ level: "ALL", operation: "ALL", entityType: "ALL", search: "", dateFrom: "", dateTo: "" })}
          >
            ریست فیلتر
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>آخرین رخدادها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">زمان</th>
                <th className="p-2">سطح</th>
                <th className="p-2">عملیات</th>
                <th className="p-2">نوع</th>
                <th className="p-2">ارجاع داخلی</th>
                <th className="p-2">سند تاهساب</th>
                <th className="p-2">پیام</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2 text-xs text-muted-foreground">{new Date(log.time).toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <Badge variant={levelVariant[log.level] ?? "secondary"}>{levelLabels[log.level] ?? log.level}</Badge>
                  </td>
                  <td className="p-2">{log.operation}</td>
                  <td className="p-2 text-xs text-muted-foreground">{log.entityType ?? "-"}</td>
                  <td className="p-2 text-xs text-muted-foreground">{log.internalRef ?? "-"}</td>
                  <td className="p-2 text-xs text-blue-600">
                    {log.tahesabDocumentId ? (
                      <button className="underline" onClick={() => setSelectedDocId(log.tahesabDocumentId)}>
                        {log.tahesabDocumentId}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2 text-muted-foreground">{log.message}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-muted-foreground">
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <TahesabDocumentDetailsDialog document={selectedDoc} open={Boolean(selectedDocId)} onOpenChange={(o) => !o && setSelectedDocId(null)} />
    </div>
  );
}
