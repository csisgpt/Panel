"use client";

import { useEffect, useMemo, useState } from "react";

import { getTahesabDocumentById, getTahesabDocumentsByRef } from "@/lib/api/tahesab";
import {
  TahesabDocumentDetail,
  TahesabDocumentStatus,
  TahesabDocumentSummary,
  WithdrawRequest as Withdrawal,
  WithdrawStatus,
} from "@/lib/types/backend";
import { TahesabDocumentDetailsDialog } from "../tahesab/tahesab-document-details-dialog";
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

const statusVariant: Record<WithdrawStatus, "warning" | "success" | "destructive" | "secondary"> = {
  [WithdrawStatus.PENDING]: "warning",
  [WithdrawStatus.APPROVED]: "success",
  [WithdrawStatus.REJECTED]: "destructive",
  [WithdrawStatus.CANCELLED]: "secondary",
};

const statusLabel: Record<WithdrawStatus, string> = {
  [WithdrawStatus.PENDING]: "در انتظار",
  [WithdrawStatus.APPROVED]: "تایید شده",
  [WithdrawStatus.REJECTED]: "رد شده",
  [WithdrawStatus.CANCELLED]: "لغو شده",
};

function formatNumber(value?: string | number | null) {
  return Number(value ?? 0).toLocaleString("fa-IR");
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
  withdrawal: Withdrawal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawDetailsDialog({ withdrawal, open, onOpenChange }: Props) {
  const [documents, setDocuments] = useState<TahesabDocumentSummary[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);

  useEffect(() => {
    if (!withdrawal || !open) return;
    setDocLoading(true);
    getTahesabDocumentsByRef("withdrawal", withdrawal.id)
      .then((docs) => setDocuments(docs))
      .finally(() => setDocLoading(false));
  }, [withdrawal, open]);

  const syncState = useMemo(() => getSyncState(documents), [documents]);

  const handleOpenDocument = async (doc: TahesabDocumentSummary) => {
    const detail = await getTahesabDocumentById(doc.id);
    setSelectedDoc(detail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>جزئیات برداشت</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2 text-sm">
          {withdrawal ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مشتری</div>
                  <div className="font-semibold">{withdrawal.user?.fullName ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{withdrawal.user?.mobile}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مبلغ</div>
                  <div className="font-semibold">{formatNumber(withdrawal.amount)} ریال</div>
                  <div className="text-[11px] text-muted-foreground">بانک: {withdrawal.bankName ?? "--"}</div>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>وضعیت</span>
                    <Badge variant={statusVariant[withdrawal.status]}>{statusLabel[withdrawal.status]}</Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    ثبت: {withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleString("fa-IR") : "--"}
                  </div>
                  {withdrawal.processedAt && (
                    <div className="text-[11px] text-muted-foreground">
                      پردازش: {new Date(withdrawal.processedAt).toLocaleString("fa-IR")}
                    </div>
                  )}
                </div>
              </div>

              {(withdrawal.note || withdrawal.cardNumber || withdrawal.iban) && (
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">اطلاعات برداشت</div>
                  {withdrawal.cardNumber && <div>کارت: {withdrawal.cardNumber}</div>}
                  {withdrawal.iban && <div>شبا: {withdrawal.iban}</div>}
                  {withdrawal.note && <div className="text-muted-foreground">{withdrawal.note}</div>}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">سندهای ته حساب</h3>
                  <Badge variant={syncState.variant}>{syncState.label}</Badge>
                </div>
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
                            سندی یافت نشد
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
            <div className="text-sm text-muted-foreground">اطلاعات برداشت در دسترس نیست.</div>
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
