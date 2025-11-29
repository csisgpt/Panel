"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getTahesabDocumentById } from "@/lib/api/tahesab";
import { TahesabDocumentDetail } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";

interface Props {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TahesabDocumentDetailsDialog({ documentId, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TahesabDocumentDetail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !documentId) return;
    setLoading(true);
    getTahesabDocumentById(documentId)
      .then(setDetail)
      .catch(() => toast({ title: "خطا در دریافت جزئیات سند", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [documentId, open, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>جزئیات سند ته‌حساب</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            مشاهده اطلاعات سند و ردیف‌ها
          </DialogDescription>
        </DialogHeader>
        {loading && <div className="text-sm text-muted-foreground">در حال بارگذاری...</div>}
        {!loading && detail && (
          <ScrollArea className="max-h-[70vh] space-y-4">
            <div className="grid gap-3 rounded-xl bg-muted/40 p-3 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground">شماره سند</p>
                <p className="font-semibold">{detail.documentNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">تاریخ</p>
                <p className="font-semibold">{new Date(detail.date).toLocaleString("fa-IR")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">نوع</p>
                <p className="font-semibold">{detail.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">وضعیت</p>
                <Badge
                  variant={
                    detail.status === "POSTED"
                      ? "success"
                      : detail.status === "FAILED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {detail.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">مبلغ کل</p>
                <p className="font-semibold">{detail.totalAmount.toLocaleString("fa-IR")}</p>
              </div>
              {detail.totalWeight !== undefined && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">وزن کل</p>
                  <p className="font-semibold">{detail.totalWeight}</p>
                </div>
              )}
              {detail.tahesabAccountCode && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">کد حساب تاهساب</p>
                  <p className="font-semibold">{detail.tahesabAccountCode}</p>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-border" />

            <div className="space-y-3">
              <div className="text-sm font-semibold">ردیف‌ها</div>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-right text-sm">
                  <thead className="bg-muted/60 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2">دارایی</th>
                      <th className="p-2">وزن/تعداد</th>
                      <th className="p-2">قیمت واحد</th>
                      <th className="p-2">تخفیف</th>
                      <th className="p-2">مالیات</th>
                      <th className="p-2">مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lines.map((line) => (
                      <tr key={line.lineId} className="border-t">
                        <td className="p-2 font-medium">
                          {line.instrumentName ?? line.assetType}
                          {line.note && <p className="text-xs text-muted-foreground">{line.note}</p>}
                        </td>
                        <td className="p-2">
                          {line.weight ?? line.quantity ?? "-"}
                        </td>
                        <td className="p-2">{line.unitPrice ? line.unitPrice.toLocaleString("fa-IR") : "-"}</td>
                        <td className="p-2">{line.discount ? line.discount.toLocaleString("fa-IR") : 0}</td>
                        <td className="p-2">{line.tax ? line.tax.toLocaleString("fa-IR") : 0}</td>
                        <td className="p-2 font-semibold">{line.amount.toLocaleString("fa-IR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {detail.internalEntityRef && (
              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">لینک داخلی</p>
                  <p className="font-semibold">{`مرتبط با ${detail.internalEntityRef.type} ${detail.internalEntityRef.id}`}</p>
                </div>
                <Button variant="outline" size="sm">
                  مشاهده در سیستم داخلی
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
