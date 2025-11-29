"use client";

import { Remittance, RemittanceStatus } from "@/lib/types/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

const remittanceStatusMap: Record<RemittanceStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  [RemittanceStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [RemittanceStatus.COMPLETED]: { label: "انجام شده", variant: "success" },
  [RemittanceStatus.CANCELLED]: { label: "لغو شده", variant: "secondary" },
};

interface Props {
  remittance: Remittance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemittanceDetailsDialog({ remittance, open, onOpenChange }: Props) {
  const statusBadge = remittance ? remittanceStatusMap[remittance.status] : undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>جزئیات حواله</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {remittance ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">مشتری</div>
                <div className="font-semibold">{remittance.client?.fullName ?? "--"}</div>
                <div className="text-[11px] text-muted-foreground">{remittance.client?.mobile}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">حساب مبدا</div>
                  <div className="font-semibold">{remittance.fromAccount?.iban ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.fromAccount?.instrument?.name}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">حساب مقصد</div>
                  <div className="font-semibold">{remittance.toAccount?.iban ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.toAccount?.instrument?.name}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مبلغ</div>
                  <div className="font-semibold">{Number(remittance.amount || 0).toLocaleString("fa-IR")} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">وضعیت</div>
                  {statusBadge ? <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge> : "--"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تاریخ ثبت</div>
                  <div className="font-semibold">{remittance.createdAt ? new Date(remittance.createdAt).toLocaleString("fa-IR") : "--"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">شناسه</div>
                  <div className="font-mono text-xs">{remittance.id}</div>
                </div>
              </div>

              {remittance.description && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">توضیحات</div>
                  <div className="text-muted-foreground">{remittance.description}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اطلاعات حواله در دسترس نیست.</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
