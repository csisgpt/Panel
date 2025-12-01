"use client";

import * as React from "react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Trade, DepositRequest, WithdrawRequest } from "@/lib/types/backend";

export type TransactionKind = "TRADE" | "DEPOSIT" | "WITHDRAW";

export interface TransactionRow {
  id: string;
  kind: TransactionKind;
  customer: string;
  contact?: string;
  account?: string;
  instrument?: string;
  quantity?: string;
  pricePerUnit?: string;
  amount: number;
  statusLabel: string;
  statusVariant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  createdAt?: string;
  trade?: Trade;
  deposit?: DepositRequest;
  withdrawal?: WithdrawRequest;
}

interface TransactionTableProps {
  data: TransactionRow[];
  onSelectTrade?: (trade: Trade) => void;
  onSelectDeposit?: (deposit: DepositRequest) => void;
  onSelectWithdraw?: (withdrawal: WithdrawRequest) => void;
}

export function TransactionTable({ data, onSelectTrade, onSelectDeposit, onSelectWithdraw }: TransactionTableProps) {
  const handleSelect = (row: TransactionRow) => {
    if (row.kind === "TRADE" && row.trade) onSelectTrade?.(row.trade);
    if (row.kind === "DEPOSIT" && row.deposit) onSelectDeposit?.(row.deposit);
    if (row.kind === "WITHDRAW" && row.withdrawal) onSelectWithdraw?.(row.withdrawal);
  };

  if (!data.length) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">تراکنشی یافت نشد.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px] text-right">نوع</TableHead>
            <TableHead className="text-right">مشتری</TableHead>
            <TableHead className="text-right">حساب / ابزار</TableHead>
            <TableHead className="text-right">تعداد / وزن</TableHead>
            <TableHead className="text-right">قیمت واحد</TableHead>
            <TableHead className="text-right">مبلغ کل</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-right">تاریخ</TableHead>
            <TableHead className="text-right">جزئیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={`${row.kind}-${row.id}`}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSelect(row)}
            >
              <TableCell className="font-semibold text-primary">{labelForKind(row.kind)}</TableCell>
              <TableCell>
                <div className="font-semibold">{row.customer}</div>
                <p className="text-xs text-muted-foreground">{row.contact}</p>
              </TableCell>
              <TableCell>
                <div className="font-medium">{row.instrument ?? "-"}</div>
                <p className="text-xs text-muted-foreground">{row.account ?? ""}</p>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {row.quantity ? Number(row.quantity).toLocaleString("fa-IR") : "-"}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {row.pricePerUnit ? Number(row.pricePerUnit).toLocaleString("fa-IR") : "-"}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {Number(row.amount || 0).toLocaleString("fa-IR")}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {row.createdAt ? format(new Date(row.createdAt), "PPP", { locale: faIR }) : "-"}
              </TableCell>
              <TableCell className="text-left">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(row);
                  }}
                >
                  مشاهده
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function labelForKind(kind: TransactionKind) {
  if (kind === "TRADE") return "معامله";
  if (kind === "DEPOSIT") return "واریز";
  return "برداشت";
}
