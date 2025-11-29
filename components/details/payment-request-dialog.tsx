"use client";

import { DepositRequest, WithdrawRequest, DepositStatus, WithdrawStatus } from "@/lib/types/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

const depositStatusMap: Record<DepositStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  [DepositStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [DepositStatus.APPROVED]: { label: "تایید شده", variant: "success" },
  [DepositStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
  [DepositStatus.CANCELLED]: { label: "لغو شده", variant: "secondary" },
};

const withdrawStatusMap: Record<WithdrawStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  [WithdrawStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [WithdrawStatus.APPROVED]: { label: "تایید شده", variant: "success" },
  [WithdrawStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
  [WithdrawStatus.CANCELLED]: { label: "لغو شده", variant: "secondary" },
};

interface Props {
  deposit?: DepositRequest | null;
  withdraw?: WithdrawRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentRequestDialog({ deposit, withdraw, open, onOpenChange }: Props) {
  const mode = deposit ? "DEPOSIT" : "WITHDRAW";
  const request = deposit ?? withdraw ?? null;
  const statusBadge = deposit
    ? depositStatusMap[deposit.status]
    : withdraw
    ? withdrawStatusMap[withdraw.status]
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "DEPOSIT" ? "جزئیات واریز" : "جزئیات برداشت"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {request ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">مشتری</div>
                <div className="font-semibold">{request.user?.fullName ?? "--"}</div>
                <div className="text-[11px] text-muted-foreground">{request.user?.mobile}</div>
              </div>

              <div className="rounded-lg border p-3 space-y-1">
                <div className="text-xs text-muted-foreground">
                  {mode === "DEPOSIT" ? "روش پرداخت" : "حساب/بانک مقصد"}
                </div>
                {mode === "DEPOSIT" ? (
                  <div className="space-y-1">
                    <div className="font-semibold">{deposit?.method ?? "--"}</div>
                    <div className="text-[11px] text-muted-foreground">شماره پیگیری: {deposit?.refNo ?? "--"}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-semibold">{withdraw?.bankName ?? "--"}</div>
                    <div className="text-[11px] text-muted-foreground">{withdraw?.iban ?? withdraw?.cardNumber ?? "--"}</div>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مبلغ</div>
                  <div className="font-semibold">{Number(request.amount || 0).toLocaleString("fa-IR")} ریال</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">وضعیت</div>
                  {statusBadge ? <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge> : "--"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تاریخ ثبت</div>
                  <div className="font-semibold">{request.createdAt ? new Date(request.createdAt).toLocaleString("fa-IR") : "--"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">شناسه درخواست</div>
                  <div className="font-mono text-xs">{request.id}</div>
                </div>
              </div>

              {request.note && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">توضیحات</div>
                  <div className="text-muted-foreground">{request.note}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اطلاعات در دسترس نیست.</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
