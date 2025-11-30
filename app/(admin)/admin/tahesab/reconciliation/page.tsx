"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ReconciliationDetailsDialog } from "@/components/tahesab/reconciliation-details-dialog";
import {
  getTahesabBalanceBreakdown,
  getTahesabBalanceRecords,
  type TahesabBalanceInternalItem,
} from "@/lib/api/tahesab";
import type { TahesabDocumentDetail, TahesabAssetType, TahesabBalanceRecord } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";

const assetTypeOptions: (TahesabAssetType | "ALL")[] = ["ALL", "GOLD", "COIN", "CURRENCY", "SILVER", "PLATINUM"];

export default function TahesabReconciliationPage() {
  const [records, setRecords] = useState<TahesabBalanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ asset: "ALL" as TahesabAssetType | "ALL", onlyMismatch: false, query: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TahesabBalanceRecord | null>(null);
  const [internalItems, setInternalItems] = useState<TahesabBalanceInternalItem[]>([]);
  const [tahesabDocs, setTahesabDocs] = useState<TahesabDocumentDetail[]>([]);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTahesabBalanceRecords();
        setRecords(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesAsset = filters.asset === "ALL" ? true : rec.assetType === filters.asset;
      const matchesDiff = filters.onlyMismatch ? rec.difference !== 0 : true;
      const matchesQuery = filters.query
        ? `${rec.customerName ?? rec.tahesabAccountCode}`.toLowerCase().includes(filters.query.toLowerCase())
        : true;
      return matchesAsset && matchesDiff && matchesQuery;
    });
  }, [filters, records]);

  const openDetails = async (record: TahesabBalanceRecord) => {
    setSelectedRecord(record);
    setDialogOpen(true);
    setLoadingBreakdown(true);
    try {
      const breakdown = await getTahesabBalanceBreakdown(record.id);
      setInternalItems(breakdown.internalItems);
      setTahesabDocs(breakdown.tahesabDocuments);
    } catch (err) {
      toast({ title: "خطا در دریافت جزئیات", variant: "destructive" });
      setInternalItems([]);
      setTahesabDocs([]);
    } finally {
      setLoadingBreakdown(false);
    }
  };

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
        <h1 className="text-2xl font-bold">مغایرت حساب‌ها</h1>
        <p className="text-sm text-muted-foreground">مقایسه تراز داخلی با تاهساب و مشاهده جزئیات اختلاف</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="نام مشتری / کد حساب"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              className="w-52"
            />
            <Select value={filters.asset} onValueChange={(v) => setFilters((f) => ({ ...f, asset: v as TahesabAssetType | "ALL" }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="نوع دارایی" />
              </SelectTrigger>
              <SelectContent>
                {assetTypeOptions.map((asset) => (
                  <SelectItem key={asset} value={asset}>
                    {asset === "ALL" ? "همه" : asset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={filters.onlyMismatch ? "secondary" : "outline"}
              onClick={() => setFilters((f) => ({ ...f, onlyMismatch: !f.onlyMismatch }))}
            >
              فقط دارای مغایرت
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setFilters({ asset: "ALL", onlyMismatch: false, query: "" })}>
            ریست فیلتر
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست حساب‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">مشتری/کد</th>
                <th className="p-2">دارایی</th>
                <th className="p-2">مانده داخلی</th>
                <th className="p-2">مانده تاهساب</th>
                <th className="p-2">اختلاف</th>
                <th className="p-2">آخرین سینک</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="cursor-pointer border-t transition hover:bg-muted/50"
                  onClick={() => openDetails(rec)}
                >
                  <td className="p-2 font-semibold">
                    {rec.customerName ?? "حساب سیستمی"}
                    <p className="text-xs text-muted-foreground">{rec.tahesabAccountCode}</p>
                  </td>
                  <td className="p-2">{rec.assetType}</td>
                  <td className="p-2">{rec.balanceInternal.toLocaleString("fa-IR")}</td>
                  <td className="p-2">{rec.balanceTahesab.toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <Badge variant={rec.difference === 0 ? "secondary" : "destructive"}>
                      {rec.difference.toLocaleString("fa-IR")}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(rec.lastSyncedAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sm text-muted-foreground">
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ScrollArea className="max-h-[70vh]">
        <ReconciliationDetailsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          record={selectedRecord}
          internalItems={loadingBreakdown ? [] : internalItems}
          documents={loadingBreakdown ? [] : tahesabDocs}
        />
      </ScrollArea>
    </div>
  );
}
