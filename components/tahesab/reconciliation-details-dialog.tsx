"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TahesabBalanceRecord, TahesabDocumentDetail } from "@/lib/types/backend";
import type { TahesabBalanceInternalItem } from "@/lib/api/tahesab";

interface ReconciliationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: TahesabBalanceRecord | null;
  internalItems: TahesabBalanceInternalItem[];
  documents: TahesabDocumentDetail[];
}

const typeLabel: Record<TahesabBalanceInternalItem["type"], string> = {
  trade: "معامله",
  deposit: "واریز",
  withdrawal: "برداشت",
  remittance: "حواله",
};

const docStatusVariant: Record<string, "secondary" | "success" | "destructive" | "outline"> = {
  POSTED: "success",
  PENDING: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
};

export function ReconciliationDetailsDialog({ open, onOpenChange, record, internalItems, documents }: ReconciliationDetailsDialogProps) {
  const title = useMemo(() => {
    if (!record) return "جزئیات حساب";
    return `${record.customerName ?? record.tahesabAccountCode} - ${record.assetType}`;
  }, [record]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl space-y-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {record && (
            <DialogDescription>
              اختلاف {record.difference.toLocaleString("fa-IR")} برای حساب {record.tahesabAccountCode}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">جزئیات داخلی</h3>
              <Badge variant="outline">{internalItems.length} رکورد</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {internalItems.length === 0 && <p className="text-muted-foreground">موردی ثبت نشده است.</p>}
              {internalItems.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{typeLabel[item.type]}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString("fa-IR")}</span>
                    </div>
                    <span className="font-semibold">{item.amount.toLocaleString("fa-IR")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description ?? "بدون توضیح"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">سندهای تاهساب</h3>
              <Badge variant="outline">{documents.length} سند</Badge>
            </div>
            <div className="space-y-3 text-sm">
              {documents.length === 0 && <p className="text-muted-foreground">سندی برای نمایش وجود ندارد.</p>}
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{doc.documentNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleString("fa-IR")}</p>
                    </div>
                    <Badge variant={docStatusVariant[doc.status] ?? "secondary"}>{doc.status}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{doc.type}</span>
                    <span className="font-semibold">{doc.totalAmount.toLocaleString("fa-IR")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {record && (
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-muted-foreground">مانده داخلی</p>
                <p className="font-semibold">{record.balanceInternal.toLocaleString("fa-IR")}</p>
              </div>
              <div className="hidden h-10 border-r md:block" />
              <div>
                <p className="text-muted-foreground">مانده تاهساب</p>
                <p className="font-semibold">{record.balanceTahesab.toLocaleString("fa-IR")}</p>
              </div>
              <div className="hidden h-10 border-r md:block" />
              <div>
                <p className="text-muted-foreground">اختلاف</p>
                <Badge variant={record.difference === 0 ? "secondary" : "destructive"}>
                  {record.difference.toLocaleString("fa-IR")}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
