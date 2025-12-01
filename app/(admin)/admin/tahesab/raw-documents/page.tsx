"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getTahesabRawDocuments, type TahesabRawDocumentSummary } from "@/lib/api/tahesab";

type Filters = {
  countLast: string;
  customerCode: string;
  fromDate: string;
  toDate: string;
  metal: string;
  documentType: string;
};

export default function TahesabRawDocumentsPage() {
  const [docs, setDocs] = useState<TahesabRawDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    countLast: "",
    customerCode: "",
    fromDate: "",
    toDate: "",
    metal: "",
    documentType: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTahesabRawDocuments({
          countLast: filters.countLast ? Number(filters.countLast) : undefined,
          customerCode: filters.customerCode || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          metal: filters.metal || undefined,
          type: filters.documentType || undefined,
        });
        setDocs(data);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت اسناد خام");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters.countLast, filters.customerCode, filters.fromDate, filters.toDate, filters.metal, filters.documentType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">اسناد خام تاهساب</h1>
        <p className="text-sm text-muted-foreground">نمایش مستقیم اسناد ثبت‌شده در تاهساب</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="تعداد آخر"
            value={filters.countLast}
            onChange={(e) => setFilters((p) => ({ ...p, countLast: e.target.value }))}
            className="w-32"
            type="number"
          />
          <Input
            placeholder="کد مشتری"
            value={filters.customerCode}
            onChange={(e) => setFilters((p) => ({ ...p, customerCode: e.target.value }))}
            className="w-40"
          />
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
            className="w-40"
          />
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
            className="w-40"
          />
          <Input
            placeholder="فلز"
            value={filters.metal}
            onChange={(e) => setFilters((p) => ({ ...p, metal: e.target.value }))}
            className="w-32"
          />
          <Input
            placeholder="نوع سند"
            value={filters.documentType}
            onChange={(e) => setFilters((p) => ({ ...p, documentType: e.target.value }))}
            className="w-40"
          />
          <Button variant="ghost" onClick={() => setFilters({ countLast: "", customerCode: "", fromDate: "", toDate: "", metal: "", documentType: "" })}>
            ریست
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست اسناد</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">شماره سند</th>
                <th className="p-2">تاریخ</th>
                <th className="p-2">مشتری</th>
                <th className="p-2">نوع</th>
                <th className="p-2">فلز</th>
                <th className="p-2">مبلغ/وزن</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-t transition hover:bg-muted/40">
                  <td className="p-2 font-semibold">
                    <Link href={`/admin/tahesab/raw-documents/${doc.id}`} className="underline">
                      {doc.documentNo}
                    </Link>
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fa-IR")}</td>
                  <td className="p-2">{doc.customerName ?? doc.customerCode ?? "-"}</td>
                  <td className="p-2">{doc.type}</td>
                  <td className="p-2">{doc.metal ?? "-"}</td>
                  <td className="p-2">{doc.amount ?? doc.weight ?? "-"}</td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    داده‌ای یافت نشد.
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
