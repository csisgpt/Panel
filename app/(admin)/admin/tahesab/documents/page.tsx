"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TahesabDocumentDetailsDialog } from "@/components/tahesab/tahesab-document-details-dialog";
import { getTahesabDocumentById, getTahesabDocuments } from "@/lib/api/tahesab";
import type {
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  TahesabDocumentType,
} from "@/lib/types/backend";

const typeLabels: Record<TahesabDocumentType, string> = {
  BUY: "خرید",
  SELL: "فروش",
  REMITTANCE: "حواله",
  DEPOSIT: "واریز",
  WITHDRAW: "برداشت",
  ADJUSTMENT: "اصلاحیه",
  FEE: "کارمزد",
  TAX: "مالیات",
};

const statusVariant: Record<TahesabDocumentStatus, "success" | "secondary" | "destructive" | "outline"> = {
  POSTED: "success",
  PENDING: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
};

export default function TahesabDocumentsPage() {
  const [docs, setDocs] = useState<TahesabDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);
  const [filters, setFilters] = useState({
    type: "ALL" as TahesabDocumentType | "ALL" | "OTHER",
    status: "ALL" as TahesabDocumentStatus | "ALL",
    query: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getTahesabDocuments({
          type: filters.type === "ALL" || filters.type === "OTHER" ? undefined : (filters.type as TahesabDocumentType),
          status: filters.status === "ALL" ? undefined : (filters.status as TahesabDocumentStatus),
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
  }, [filters.type, filters.status, filters.dateFrom, filters.dateTo]);

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
    const base = filters.type === "OTHER" ? docs.filter((d) => !["BUY", "SELL", "REMITTANCE"].includes(d.type)) : docs;
    return base.filter((doc) => {
      const matchesQuery = filters.query
        ? `${doc.documentNumber} ${doc.tahesabAccountCode ?? ""}`.toLowerCase().includes(filters.query.toLowerCase())
        : true;
      return matchesQuery;
    });
  }, [docs, filters.query, filters.type]);

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
        <h1 className="text-2xl font-bold">سندهای تاهساب</h1>
        <p className="text-sm text-muted-foreground">مرور و بررسی جزئیات سندها</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
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
            <Select value={filters.type} onValueChange={(v) => setFilters((f) => ({ ...f, type: v as TahesabDocumentType | "ALL" | "OTHER" }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="نوع سند" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value={TahesabDocumentType.BUY}>خرید</SelectItem>
                <SelectItem value={TahesabDocumentType.SELL}>فروش</SelectItem>
                <SelectItem value={TahesabDocumentType.REMITTANCE}>حواله</SelectItem>
                <SelectItem value="OTHER">سایر</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v as TahesabDocumentStatus | "ALL" }))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه</SelectItem>
                <SelectItem value={TahesabDocumentStatus.POSTED}>ثبت شده</SelectItem>
                <SelectItem value={TahesabDocumentStatus.PENDING}>در انتظار</SelectItem>
                <SelectItem value={TahesabDocumentStatus.FAILED}>ناموفق</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="شماره سند یا مشتری"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              className="w-56"
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => setFilters({ type: "ALL", status: "ALL", query: "", dateFrom: "", dateTo: "" })}
          >
            ریست فیلتر
          </Button>
        </CardContent>
      </Card>

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
                <tr key={doc.id} className="cursor-pointer border-t transition hover:bg-muted/40" onClick={() => setSelected(doc.id)}>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fa-IR")}</td>
                  <td className="p-2 font-semibold">{doc.documentNumber}</td>
                  <td className="p-2">{typeLabels[doc.type]}</td>
                  <td className="p-2">{doc.tahesabAccountCode ?? "-"}</td>
                  <td className="p-2">{doc.totalAmount.toLocaleString("fa-IR")}</td>
                  <td className="p-2">{doc.totalWeight ?? "-"}</td>
                  <td className="p-2">
                    <Badge variant={statusVariant[doc.status] ?? "secondary"}>{doc.status}</Badge>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">
                    {doc.internalEntityRef ? `${doc.internalEntityRef.type} ${doc.internalEntityRef.id}` : "-"}
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-sm text-muted-foreground">
                    موردی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <TahesabDocumentDetailsDialog document={selectedDoc} open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
