"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getTahesabDocumentById, getTahesabDocuments } from "@/lib/api/tahesab";
import {
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  TahesabDocumentType,
} from "@/lib/types/backend";
import { TahesabDocumentDetailsDialog } from "@/components/tahesab/tahesab-document-details-dialog";

const typeOptions: { label: string; value: TahesabDocumentType | "ALL" }[] = [
  { label: "همه", value: "ALL" },
  { label: "خرید", value: TahesabDocumentType.BUY },
  { label: "فروش", value: TahesabDocumentType.SELL },
  { label: "حواله", value: TahesabDocumentType.REMITTANCE },
  { label: "واریز", value: TahesabDocumentType.DEPOSIT },
  { label: "برداشت", value: TahesabDocumentType.WITHDRAW },
];

export default function TahesabDocumentsPage() {
  const [docs, setDocs] = useState<TahesabDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "ALL" as TahesabDocumentType | "ALL",
    status: "ALL" as TahesabDocumentStatus | "ALL",
    customer: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getTahesabDocuments({
          type: filters.type === "ALL" ? undefined : (filters.type as TahesabDocumentType),
          status: filters.status === "ALL" ? undefined : (filters.status as TahesabDocumentStatus),
          customerId: filters.customer || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        });
        setDocs(result);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت سندها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  useEffect(() => {
    const loadSelected = async () => {
      if (!selected) {
        setSelectedDoc(null);
        return;
      }

      try {
        const detail = await getTahesabDocumentById(selected);
        setSelectedDoc(detail);
      } catch (err) {
        setSelectedDoc(null);
      }
    };

    loadSelected();
  }, [selected]);

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) =>
      filters.customer ? doc.tahesabAccountCode?.toLowerCase().includes(filters.customer.toLowerCase()) : true
    );
  }, [docs, filters.customer]);

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
          <h1 className="text-2xl font-bold">سندهای تاهساب</h1>
          <p className="text-sm text-muted-foreground">مرور و بررسی جزئیات سندها</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
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
          <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v as TahesabDocumentType | "ALL" }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="نوع سند" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v as TahesabDocumentStatus | "ALL" }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه</SelectItem>
              <SelectItem value={TahesabDocumentStatus.POSTED}>ثبت شده</SelectItem>
              <SelectItem value={TahesabDocumentStatus.PENDING}>در انتظار</SelectItem>
              <SelectItem value={TahesabDocumentStatus.FAILED}>ناموفق</SelectItem>
              <SelectItem value={TahesabDocumentStatus.CANCELLED}>لغو</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="کد حساب/مشتری"
            value={filters.customer}
            onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))}
            className="w-48"
          />
          <Button variant="outline" onClick={() => setFilters({ type: "ALL", status: "ALL", customer: "", dateFrom: "", dateTo: "" })}>
            ریست فیلتر
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست سندها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">تاریخ</th>
                <th className="p-2">شماره سند</th>
                <th className="p-2">نوع</th>
                <th className="p-2">مشتری/کد</th>
                <th className="p-2">مبلغ کل</th>
                <th className="p-2">وزن کل</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">ارجاع داخلی</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-t transition hover:bg-muted/40" onClick={() => setSelected(doc.id)}>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fa-IR")}</td>
                  <td className="p-2 font-semibold">{doc.documentNumber}</td>
                  <td className="p-2">{doc.type}</td>
                  <td className="p-2">{doc.tahesabAccountCode ?? "-"}</td>
                  <td className="p-2">{doc.totalAmount.toLocaleString("fa-IR")}</td>
                  <td className="p-2">{doc.totalWeight ?? "-"}</td>
                  <td className="p-2">
                    <Badge variant={doc.status === TahesabDocumentStatus.POSTED ? "success" : "secondary"}>{doc.status}</Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">
                    {doc.internalEntityRef ? `${doc.internalEntityRef.type} ${doc.internalEntityRef.id}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocs.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">موردی یافت نشد</div>
          )}
        </CardContent>
      </Card>

      <TahesabDocumentDetailsDialog document={selectedDoc} open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
