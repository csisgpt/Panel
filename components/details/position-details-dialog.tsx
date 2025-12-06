"use client";

import { Instrument, Trade } from "@/lib/types/backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

type PositionLike = {
  instrumentId: string;
  instrument?: Instrument;
  netQuantity?: number | string | null;
  averagePrice?: number | string | null;
  markPrice?: number | string | null;
  unrealizedPnl?: number | string | null;
};

interface Props {
  position: PositionLike | null;
  trades: Trade[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PositionDetailsDialog({ position, trades, open, onOpenChange }: Props) {
  const relatedTrades = position
    ? trades.filter((t) => t.instrumentId === position.instrumentId)
    : [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>جزئیات موقعیت</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          {position ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">ابزار</div>
                  <div className="font-semibold">{position.instrument?.name ?? "--"}</div>
                  <div className="text-[11px] text-muted-foreground">{position.instrument?.code}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">تعداد خالص</div>
                  <div className="font-semibold">{Number(position.netQuantity || 0).toLocaleString("fa-IR")}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">قیمت میانگین</div>
                  <div className="font-semibold">{Number(position.averagePrice || 0).toLocaleString("fa-IR")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">قیمت بازار</div>
                  <div className="font-semibold">{Number(position.markPrice || 0).toLocaleString("fa-IR")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">پی‌اند‌ال شناور</div>
                  <div className="font-semibold">{Number(position.unrealizedPnl || 0).toLocaleString("fa-IR")}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">معاملات مرتبط</span>
                  <Badge variant="outline">{relatedTrades.length}</Badge>
                </div>
                <div className="grid gap-2">
                  {relatedTrades.map((trade) => (
                    <div key={trade.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{trade.instrument?.name}</span>
                        <Badge variant={trade.side === "BUY" ? "secondary" : "outline"}>
                          {trade.side === "BUY" ? "خرید" : "فروش"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{trade.quantity} @ {trade.pricePerUnit}</div>
                      <div className="text-[11px] text-muted-foreground">{trade.createdAt ? new Date(trade.createdAt).toLocaleString("fa-IR") : "--"}</div>
                    </div>
                  ))}
                  {relatedTrades.length === 0 && (
                    <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">تراکنشی یافت نشد.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">اطلاعات موقعیت در دسترس نیست.</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
