"use client";

import { TahesabDocumentDetail, TahesabDocumentStatus } from "@/lib/types/backend";
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

interface Props {
  document: TahesabDocumentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusVariant: Record<TahesabDocumentStatus, "success" | "warning" | "destructive" | "secondary"> = {
  [TahesabDocumentStatus.POSTED]: "success",
  [TahesabDocumentStatus.PENDING]: "warning",
  [TahesabDocumentStatus.FAILED]: "destructive",
  [TahesabDocumentStatus.CANCELLED]: "secondary",
};

function formatNumber(value?: number) {
  if (value == null) return "--";
  return Number(value).toLocaleString("fa-IR");
}

export function TahesabDocumentDetailsDialog({ document, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>سند ته حساب</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2 text-sm">
          {document ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">شماره سند</div>
                  <div className="font-mono text-xs">{document.documentNumber}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(document.date).toLocaleString("fa-IR")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">نوع</div>
                  <div className="font-semibold">{document.type}</div>
                  <Badge className="mt-2" variant={statusVariant[document.status]}> 
                    {document.status}
                  </Badge>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مشتری / حساب</div>
                  <div className="font-semibold">{document.customerId ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">کد ته حساب: {document.tahesabAccountCode ?? "--"}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">جمع مبلغ</div>
                  <div className="font-semibold">{formatNumber(document.totalAmount)} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">جمع وزن</div>
                  <div className="font-semibold">{document.totalWeight ? `${formatNumber(document.totalWeight)} گرم` : "--"}</div>
                </div>
                {document.internalEntityRef && (
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">ارجاع داخلی</div>
                    <div className="font-semibold">{document.internalEntityRef.type}</div>
                    <div className="font-mono text-[11px]">{document.internalEntityRef.id}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">آیتم‌ها</div>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">دارایی</TableHead>
                        <TableHead className="text-right">مقدار</TableHead>
                        <TableHead className="text-right">قیمت واحد</TableHead>
                        <TableHead className="text-right">مالیات/کارمزد</TableHead>
                        <TableHead className="text-right">مبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {document.lines.map((line) => (
                        <TableRow key={line.lineId}>
                          <TableCell className="text-xs">{line.instrumentName ?? line.assetType}</TableCell>
                          <TableCell className="text-xs">
                            {line.weight != null
                              ? `${formatNumber(line.weight)} گرم`
                              : line.quantity != null
                              ? formatNumber(line.quantity)
                              : "--"}
                          </TableCell>
                          <TableCell className="text-xs">{line.unitPrice != null ? `${formatNumber(line.unitPrice)} ریال` : "--"}</TableCell>
                          <TableCell className="text-xs">{line.tax != null ? formatNumber(line.tax) : "--"}</TableCell>
                          <TableCell className="text-xs font-semibold">{formatNumber(line.amount)} ریال</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">سندی برای نمایش وجود ندارد.</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
