"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTahesabBalances, getTahesabDocumentsByInternalRef } from "@/lib/api/tahesab";
import { TahesabBalanceRecord } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";
import { TahesabDocumentDetailsDialog } from "@/components/tahesab/tahesab-document-details-dialog";

export default function TahesabReconciliationPage() {
  const [records, setRecords] = useState<TahesabBalanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [assetType, setAssetType] = useState<string>("ALL");
  const [onlyMismatch, setOnlyMismatch] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<{ id: string; label: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getTahesabBalances()
      .then((data) => {
        setRecords(data);
        setError(null);
      })
      .catch(() => setError("خطا در دریافت داده‌ها"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesQuery = query
        ? `${r.customerName ?? r.tahesabAccountCode}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesAsset = assetType === "ALL" ? true : r.assetType === assetType;
      const matchesDiff = onlyMismatch ? r.difference !== 0 : true;
      return matchesQuery && matchesAsset && matchesDiff;
    });
  }, [records, query, assetType, onlyMismatch]);

  const openDetails = async (record: TahesabBalanceRecord) => {
    setRelatedDocs([]);
    if (record.customerId) {
      try {
        const docs = await getTahesabDocumentsByInternalRef("trade", record.customerId);
        setRelatedDocs(docs.map((d) => ({ id: d.id, label: `${d.documentNumber} (${d.type})` })));
      } catch (err) {
        toast({ title: "دریافت سندهای مرتبط با خطا مواجه شد", variant: "destructive" });
      }
    }
    if (record.customerId) setSelectedDoc(null);
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
    return <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">مغایرت حساب‌ها</h1>
          <p className="text-sm text-muted-foreground">مقایسه تراز داخلی با تاهساب</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="جستجو مشتری" value={query} onChange={(e) => setQuery(e.target.value)} className="w-48" />
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="نوع دارایی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه</SelectItem>
              <SelectItem value="GOLD">طلا</SelectItem>
              <SelectItem value="COIN">سکه</SelectItem>
              <SelectItem value="CURRENCY">ارز</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={onlyMismatch ? "secondary" : "outline"} onClick={() => setOnlyMismatch((prev) => !prev)}>
            فقط اختلاف‌ها
          </Button>
        </div>
      </div>

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
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t transition hover:bg-muted/40"
                  onClick={() => openDetails(r)}
                >
                  <td className="p-2 font-semibold">
                    {r.customerName ?? "حساب سیستمی"}
                    <p className="text-xs text-muted-foreground">{r.tahesabAccountCode}</p>
                  </td>
                  <td className="p-2">{r.assetType}</td>
                  <td className="p-2">{r.balanceInternal.toLocaleString("fa-IR")}</td>
                  <td className="p-2">{r.balanceTahesab.toLocaleString("fa-IR")}</td>
                  <td className="p-2">
                    <Badge variant={r.difference === 0 ? "secondary" : "destructive"}>
                      {r.difference.toLocaleString("fa-IR")}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(r.lastSyncedAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">موردی یافت نشد</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="internal" className="space-y-3">
        <TabsList>
          <TabsTrigger value="internal">جزئیات داخلی</TabsTrigger>
          <TabsTrigger value="tahesab">سندهای تاهساب</TabsTrigger>
        </TabsList>
        <TabsContent value="internal">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>جزئیات انتخاب شده</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              برای مشاهده جزئیات حساب روی ردیف کلیک کنید.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tahesab">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>سندهای مرتبط</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64 space-y-2">
                {relatedDocs.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    سندی انتخاب نشده است
                  </div>
                )}
                {relatedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div className="text-sm font-semibold">{doc.label}</div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedDoc(doc.id)}>
                      مشاهده جزئیات
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TahesabDocumentDetailsDialog documentId={selectedDoc} open={Boolean(selectedDoc)} onOpenChange={(o) => !o && setSelectedDoc(null)} />
    </div>
  );
}
