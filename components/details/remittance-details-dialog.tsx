"use client";

import type { BackendUser } from "@/lib/types/backend";
import type { Remittance, RemittanceStatus } from "@/lib/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

type WithOptionalAccount = {
  iban?: string | null;
  instrument?: { name?: string | null } | null;
};

type RemittanceWithRefs = Remittance & {
  customer?: BackendUser | null;
  fromAccount?: WithOptionalAccount | null;
  toAccount?: WithOptionalAccount | null;
};

const remittanceStatusMap: Record<RemittanceStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  [RemittanceStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [RemittanceStatus.SENT]: { label: "ارسال شده", variant: "secondary" },
  [RemittanceStatus.COMPLETED]: { label: "تسویه شده", variant: "success" },
  [RemittanceStatus.FAILED]: { label: "ناموفق", variant: "destructive" },
};

interface Props {
  remittance: RemittanceWithRefs | null;
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
                <div className="font-semibold">{remittance.customer?.fullName ?? "--"}</div>
                <div className="text-[11px] text-muted-foreground">{remittance.customer?.mobile}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">حساب مبدا</div>
                  <div className="font-semibold">{remittance.fromAccount?.iban ?? remittance.fromAccountId ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{remittance.fromAccount?.instrument?.name}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">حساب مقصد</div>
                  <div className="font-semibold">{remittance.toAccount?.iban ?? remittance.toAccountId ?? "--"}</div>
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
