"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
import { Badge, BadgeProps } from "../ui/badge";
import { Trade, TradeStatus } from "@/lib/types/backend";
import { getMyTrades } from "@/lib/api/trades";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type BadgeVariant = BadgeProps["variant"];

const statusMap: Record<TradeStatus, { label: string; variant: BadgeVariant }> =
  {
    [TradeStatus.PENDING]: { label: "در انتظار", variant: "warning" },
    [TradeStatus.APPROVED]: { label: "تایید شده", variant: "success" },
    [TradeStatus.SETTLED]: { label: "تسویه شده", variant: "success" },
    [TradeStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
    [TradeStatus.CANCELLED_BY_USER]: {
      label: "لغو توسط مشتری",
      variant: "secondary",
    },
    [TradeStatus.CANCELLED_BY_ADMIN]: {
      label: "لغو توسط ادمین",
      variant: "secondary",
    },
  };

export type TransactionTableRow = {
  id: string;
  type: "TRADE" | "DEPOSIT" | "WITHDRAW";
  typeLabel: string;
  customerName: string;
  accountCode?: string | null;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  statusLabel: string;
  statusVariant: BadgeVariant;
  date?: string | null;
  description?: string | null;
  actionLabel?: string;
  onClick?: () => void;
};

interface TransactionTableProps {
  onSelectTrade?: (trade: Trade) => void;
  transactions?: TransactionTableRow[];
  loading?: boolean;
  emptyMessage?: string;
}

export function TransactionTable({
  onSelectTrade,
  transactions,
  loading,
  emptyMessage = "هیچ تراکنشی برای نمایش وجود ندارد.",
}: TransactionTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactions) return;

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
          setInternalLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [transactions]);

  const tableRows = useMemo(() => {
    if (transactions) return transactions;

    return trades.map((trade) => {
      const status = statusMap[trade.status] ?? statusMap[TradeStatus.PENDING];
      const qty = Number(trade.quantity || 0);
      const price = Number(trade.pricePerUnit || 0);
      const total = Number(trade.totalAmount || qty * price);

      return {
        id: trade.id,
        type: "TRADE" as const,
        typeLabel: "معامله",
        customerName: trade.client?.fullName ?? "—",
        accountCode: trade.client?.username ?? trade.client?.mobile ?? "—",
        amount: total,
        status: status.variant === "success"
          ? "SUCCESS"
          : status.variant === "warning"
            ? "PENDING"
            : "FAILED",
        statusLabel: status.label,
        statusVariant: status.variant,
        date: trade.createdAt ?? null,
        description: trade.instrument?.name ?? undefined,
        actionLabel: "جزئیات",
        onClick: onSelectTrade ? () => onSelectTrade(trade) : undefined,
      } satisfies TransactionTableRow;
    });
  }, [onSelectTrade, trades, transactions]);

  const effectiveLoading = loading ?? internalLoading;

  if (effectiveLoading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        در حال بارگذاری تراکنش‌ها...
      </div>
    );
  }

  if (!transactions && error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        خطا در بارگذاری تراکنش‌ها: {error}
      </div>
    );
  }

  if (!tableRows.length) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-card">
      <div className="p-2 sm:p-4">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">نوع</TableHead>
              <TableHead className="text-right">مشتری / حساب</TableHead>
              <TableHead className="text-right">مبلغ</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row) => {
              const dateLabel = row.date
                ? format(new Date(row.date), "yyyy/MM/dd HH:mm", { locale: faIR })
                : "—";

              const isClickable = Boolean(row.onClick);

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "transition-colors",
                    isClickable && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={row.onClick}
                >
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {dateLabel}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-semibold">{row.typeLabel}</div>
                    {row.description ? (
                      <div className="text-xs text-muted-foreground">
                        {row.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="space-y-1 text-sm">
                    <div className="font-semibold">{row.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.accountCode ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {row.amount.toLocaleString("fa-IR")} ریال
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        row.onClick?.();
                      }}
                    >
                      {row.actionLabel ?? "جزئیات"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
