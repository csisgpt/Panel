"use client";

import { Trade, TradeSide, TradeStatus } from "@/lib/types/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

const tradeStatusLabel: Record<TradeStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
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

interface Props {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footer?: React.ReactNode;
}

export function TradeDetailsDialog({ trade, open, onOpenChange, footer }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>جزئیات معامله</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {trade ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">مشتری</div>
                  <div className="font-semibold">{trade.client?.fullName ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{trade.client?.mobile}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">ابزار</div>
                  <div className="font-semibold">{trade.instrument?.name ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{trade.instrument?.code}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">جهت</div>
                  <div className="font-semibold">{sideLabel[trade.side]}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">وضعیت</div>
                  <Badge variant={tradeStatusLabel[trade.status]?.variant ?? "secondary"}>
                    {tradeStatusLabel[trade.status]?.label ?? trade.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تعداد / وزن</div>
                  <div className="font-semibold">{Number(trade.quantity || 0).toLocaleString("fa-IR")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">قیمت واحد</div>
                  <div className="font-semibold">{Number(trade.pricePerUnit || 0).toLocaleString("fa-IR")}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">ارزش کل</div>
                <div className="font-semibold">
                  {Number(
                    trade.totalAmount || Number(trade.quantity || 0) * Number(trade.pricePerUnit || 0)
                  ).toLocaleString("fa-IR")} ریال
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">زمان ثبت</div>
                  <div className="font-semibold">
                    {trade.createdAt ? new Date(trade.createdAt).toLocaleString("fa-IR") : "--"}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تسویه</div>
                  <div className="font-semibold">{trade.settlementDate ? new Date(trade.settlementDate).toLocaleDateString("fa-IR") : "--"}</div>
                </div>
              </div>

              {trade.notes && (
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">توضیحات</div>
                  <div className="text-muted-foreground">{trade.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اطلاعات معامله در دسترس نیست.</div>
          )}
        </ScrollArea>
        {footer}
      </DialogContent>
    </Dialog>
  );
}
