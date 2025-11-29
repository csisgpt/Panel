"use client";

import { useEffect, useMemo, useState } from "react";

import { getTahesabDocumentById, getTahesabDocumentsByRef } from "@/lib/api/tahesab";
import { BackendUser, TahesabDocumentDetail, TahesabDocumentStatus, TahesabDocumentSummary } from "@/lib/types/backend";
import { Remittance, RemittanceStatus } from "@/lib/mock-data";
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

interface RemittanceWithRefs extends Remittance {
  updatedAt?: string;
  customer?: BackendUser | null;
  fromAccount?: { iban?: string | null; instrument?: { name?: string | null } | null } | null;
  toAccount?: { iban?: string | null; instrument?: { name?: string | null } | null } | null;
}

const statusVariant: Record<RemittanceStatus, "outline" | "secondary" | "success" | "destructive"> = {
  [RemittanceStatus.PENDING]: "outline",
  [RemittanceStatus.SENT]: "secondary",
  [RemittanceStatus.COMPLETED]: "success",
  [RemittanceStatus.FAILED]: "destructive",
};

const statusLabel: Record<RemittanceStatus, string> = {
  [RemittanceStatus.PENDING]: "در انتظار",
  [RemittanceStatus.SENT]: "ارسال شد",
  [RemittanceStatus.COMPLETED]: "تسویه شد",
  [RemittanceStatus.FAILED]: "ناموفق",
};

function formatNumber(value?: number | string | null) {
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
  remittance: RemittanceWithRefs | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemittanceDetailsDialog({ remittance, open, onOpenChange }: Props) {
  const [documents, setDocuments] = useState<TahesabDocumentSummary[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TahesabDocumentDetail | null>(null);

  useEffect(() => {
    if (!remittance || !open) return;
    setDocLoading(true);
    getTahesabDocumentsByRef("remittance", remittance.id)
      .then((docs) => setDocuments(docs))
      .finally(() => setDocLoading(false));
  }, [remittance, open]);

  const syncState = useMemo(() => getSyncState(documents), [documents]);

  const handleOpenDocument = async (doc: TahesabDocumentSummary) => {
    const detail = await getTahesabDocumentById(doc.id);
    setSelectedDoc(detail);
  };

  const statusBadge = remittance ? statusVariant[remittance.status] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>جزئیات حواله</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {remittance ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مشتری</div>
                  <div className="font-semibold">{remittance.customer?.fullName ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.customer?.mobile}</div>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>وضعیت</span>
                    {statusBadge ? <Badge variant={statusBadge}>{statusLabel[remittance.status]}</Badge> : "--"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">ثبت: {new Date(remittance.createdAt).toLocaleString("fa-IR")}</div>
                  {remittance.updatedAt && (
                    <div className="text-[11px] text-muted-foreground">به‌روزرسانی: {new Date(remittance.updatedAt).toLocaleString("fa-IR")}</div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">از حساب</div>
                  <div className="font-semibold">{remittance.fromAccount?.iban ?? remittance.fromAccountId ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.fromAccount?.instrument?.name}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">به حساب</div>
                  <div className="font-semibold">{remittance.toAccount?.iban ?? remittance.toAccountId ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.toAccount?.instrument?.name}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مبلغ</div>
                  <div className="font-semibold">{formatNumber(remittance.amount)} ریال</div>
                </div>
                {remittance.description && (
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">یادداشت</div>
                    <div className="text-muted-foreground">{remittance.description}</div>
                  </div>
                )}
              </div>

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
                          <TableCell className="text-[11px] text-muted-foreground">{new Date(doc.date).toLocaleString("fa-IR")}</TableCell>
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
            <div className="text-sm text-muted-foreground">اطلاعات حواله در دسترس نیست.</div>
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
