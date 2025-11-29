"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getTahesabDocumentById,
  getTahesabDocumentsByRef,
} from "@/lib/api/tahesab";
import {
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  Trade,
  TradeSide,
  TradeStatus,
} from "@/lib/types/backend";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TahesabDocumentDetailsDialog } from "../tahesab/tahesab-document-details-dialog";

const tradeStatusLabel: Record<
  TradeStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "destructive"
      | "outline";
  }
> = {
  [TradeStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [TradeStatus.APPROVED]: { label: "تایید شده", variant: "success" },
  [TradeStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
  [TradeStatus.SETTLED]: { label: "تسویه شده", variant: "success" },
  [TradeStatus.CANCELLED_BY_ADMIN]: { label: "لغو توسط ادمین", variant: "secondary" },
  [TradeStatus.CANCELLED_BY_USER]: { label: "لغو توسط مشتری", variant: "secondary" },
};

const sideLabel: Record<TradeSide, string> = {
  [TradeSide.BUY]: "خرید",
  [TradeSide.SELL]: "فروش",
};

function formatNumber(value?: string | number | null) {
  const numeric = Number(value ?? 0);
  return numeric.toLocaleString("fa-IR");
}

function getSyncState(documents: TahesabDocumentSummary[]) {
  const hasPosted = documents.some((d) => d.status === TahesabDocumentStatus.POSTED);
  const hasPending = documents.some((d) => d.status === TahesabDocumentStatus.PENDING);
  const hasFailed = documents.some((d) => d.status === TahesabDocumentStatus.FAILED);

  if (hasPosted) return { label: "سینک با ته حساب: موفق", variant: "success" as const };
  if (hasPending) return { label: "سینک با ته حساب: در انتظار", variant: "warning" as const };
  if (hasFailed) return { label: "سینک با ته حساب: خطا", variant: "destructive" as const };
  return { label: "سند ته حساب موجود نیست", variant: "secondary" as const };
}

interface Props {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDetailsDialog({ trade, open, onOpenChange }: Props) {
  const [documents, setDocuments] = useState<TahesabDocumentSummary[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);

  useEffect(() => {
    if (!trade || !open) return;

    setDocLoading(true);
    setDocError(null);
    getTahesabDocumentsByRef("trade", trade.id)
      .then((docs) => setDocuments(docs))
      .catch(() => setDocError("خطا در دریافت سندهای ته حساب"))
      .finally(() => setDocLoading(false));
  }, [trade, open]);

  const syncState = useMemo(() => getSyncState(documents), [documents]);

  const handleOpenDocument = async (doc: TahesabDocumentSummary) => {
    try {
      const detail = await getTahesabDocumentById(doc.id);
      setSelectedDoc(detail);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>جزئیات معامله</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {trade ? (
            <div className="space-y-6 text-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">ابزار</div>
                  <div className="font-semibold">{trade.instrument?.name ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{trade.instrument?.code}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">جهت / تعداد</div>
                  <div className="font-semibold">{sideLabel[trade.side]}</div>
                  <div className="text-[11px] text-muted-foreground">{formatNumber(trade.quantity)} واحد</div>
                </div>
                <div className="rounded-lg border p-3 space-y-1 text-right">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>وضعیت</span>
                    <Badge variant={tradeStatusLabel[trade.status]?.variant ?? "secondary"}>
                      {tradeStatusLabel[trade.status]?.label ?? trade.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ثبت: {trade.createdAt ? new Date(trade.createdAt).toLocaleString("fa-IR") : "--"}
                  </div>
                  {trade.approvedAt && (
                    <div className="text-xs text-muted-foreground">
                      تایید: {new Date(trade.approvedAt).toLocaleString("fa-IR")}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">قیمت واحد</div>
                  <div className="font-semibold">{formatNumber(trade.pricePerUnit)} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">ارزش کل</div>
                  <div className="font-semibold">{formatNumber(trade.totalAmount || Number(trade.quantity || 0) * Number(trade.pricePerUnit || 0))} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تاریخ تسویه</div>
                  <div className="font-semibold">{trade.settlementDate ? new Date(trade.settlementDate).toLocaleDateString("fa-IR") : "--"}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>مشتری / حساب</span>
                  <Badge variant="outline">{trade.clientId}</Badge>
                </div>
                <div className="font-semibold">{trade.client?.fullName ?? "--"}</div>
                <div className="text-[11px] text-muted-foreground">{trade.client?.mobile}</div>
              </div>

              {(trade.clientNote || trade.adminNote) && (
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">توضیحات</div>
                  {trade.clientNote && <div>یادداشت مشتری: {trade.clientNote}</div>}
                  {trade.adminNote && <div className="text-muted-foreground">یادداشت ادمین: {trade.adminNote}</div>}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">جزئیات داخلی</h3>
                  <Badge variant="secondary">ماک</Badge>
                </div>
                <div className="rounded-lg border p-3 text-xs text-muted-foreground">
                  <div>تراکنش داخلی مرتبط برای این معامله هنوز پیاده‌سازی نشده است.</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">سندهای ته حساب</h3>
                  <Badge variant={syncState.variant}>{syncState.label}</Badge>
                </div>
                {docError && <div className="text-xs text-destructive">{docError}</div>}
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">شماره سند</TableHead>
                        <TableHead className="text-right">نوع</TableHead>
                        <TableHead className="text-right">وضعیت</TableHead>
                        <TableHead className="text-right">مبلغ</TableHead>
                        <TableHead className="text-right">تاریخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow
                          key={doc.id}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => handleOpenDocument(doc)}
                        >
                          <TableCell className="font-mono text-xs">{doc.documentNumber}</TableCell>
                          <TableCell className="text-xs">{doc.type}</TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant={
                                doc.status === TahesabDocumentStatus.POSTED
                                  ? "success"
                                  : doc.status === TahesabDocumentStatus.PENDING
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{formatNumber(doc.totalAmount)} ریال</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {new Date(doc.date).toLocaleString("fa-IR")}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!docLoading && documents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                            سندی ثبت نشده است
                          </TableCell>
                        </TableRow>
                      )}
                      {docLoading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                            در حال بارگذاری...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اطلاعات معامله در دسترس نیست.</div>
          )}
        </ScrollArea>
        <TahesabDocumentDetailsDialog
          document={selectedDoc}
          open={!!selectedDoc}
          onOpenChange={(open) => !open && setSelectedDoc(null)}
        />
      </DialogContent>
    </Dialog>
  );
}
