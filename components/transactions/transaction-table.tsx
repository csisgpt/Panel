"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Trade, TradeSide, TradeStatus } from "@/lib/types/backend";
import { getMyTrades } from "@/lib/api/trades";
import { Button } from "../ui/button";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

const statusMap: Record<TradeStatus, { label: string; variant: BadgeVariant }> =
  {
    [TradeStatus.PENDING]: { label: "در انتظار", variant: "warning" },
    [TradeStatus.APPROVED]: { label: "تایید شده", variant: "success" },
    [TradeStatus.SETTLED]: { label: "تسویه شده", variant: "success" },
    [TradeStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
    [TradeStatus.CANCELLED_BY_USER]: {
      label: "لغو توسط مشتری",
      variant: "default",
    },
    [TradeStatus.CANCELLED_BY_ADMIN]: {
      label: "لغو توسط ادمین",
      variant: "default",
    },
  };

const sideLabel: Record<TradeSide, string> = {
  [TradeSide.BUY]: "خرید",
  [TradeSide.SELL]: "فروش",
};

interface TransactionTableProps {
  onSelectTrade?: (trade: Trade) => void;
}

export function TransactionTable({ onSelectTrade }: TransactionTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getMyTrades()
      .then((data) => {
        if (mounted) {
          setTrades(data);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "خطا در دریافت داده‌ها"
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        در حال بارگذاری تراکنش‌ها...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        خطا در بارگذاری تراکنش‌ها: {error}
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        هنوز هیچ معامله‌ای ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px] text-right">کد</TableHead>
            <TableHead className="text-right">مشتری</TableHead>
            <TableHead className="text-right">ابزار</TableHead>
            <TableHead className="text-right">جهت</TableHead>
            <TableHead className="text-right">تعداد / وزن</TableHead>
            <TableHead className="text-right">قیمت واحد</TableHead>
            <TableHead className="text-right">ارزش کل</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-right">تاریخ</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const status = statusMap[trade.status] ?? statusMap[TradeStatus.PENDING];

            const qty = Number(trade.quantity || 0);
            const price = Number(trade.pricePerUnit || 0);
            const total = Number(trade.totalAmount || qty * price);

            return (
              <TableRow
                key={trade.id}
                className={onSelectTrade ? "cursor-pointer hover:bg-muted/60" : undefined}
                onClick={onSelectTrade ? () => onSelectTrade(trade) : undefined}
              >
                <TableCell className="font-mono text-xs">{trade.id}</TableCell>
                <TableCell className="text-sm">
                  {trade.client?.fullName ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {trade.instrument?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {sideLabel[trade.side]}
                </TableCell>
                <TableCell className="text-sm">
                  {qty.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell className="text-sm">
                  {price.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell className="text-sm">
                  {total.toLocaleString("fa-IR")}
                </TableCell>
                <TableCell className="text-sm">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {trade.createdAt
                    ? format(new Date(trade.createdAt), "PPP", { locale: faIR })
                    : "—"}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrade?.(trade);
                    }}
                  >
                    جزئیات
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
