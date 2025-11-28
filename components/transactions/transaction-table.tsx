'use client';

import { useRouter } from "next/navigation";
import { mockTransactions, mockCustomers, Transaction } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

const statusMap: Record<Transaction["status"], { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  SUCCESS: { label: "موفق", variant: "success" },
  PENDING: { label: "در انتظار", variant: "warning" },
  FAILED: { label: "ناموفق", variant: "destructive" }
};

const typeLabel: Record<Transaction["type"], string> = {
  DEPOSIT: "واریز",
  WITHDRAW: "برداشت",
  BUY_GOLD: "خرید طلا",
  SELL_GOLD: "فروش طلا",
  FEE: "کارمزد"
};

export function TransactionTable({ data = mockTransactions.slice(0, 8) }: { data?: Transaction[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>شناسه</TableHead>
          <TableHead>مشتری</TableHead>
          <TableHead>نوع</TableHead>
          <TableHead>مبلغ</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>تاریخ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((tx) => (
          <TableRow key={tx.id} className="cursor-pointer" onClick={() => router.push(`/transactions/${tx.id}`)}>
            <TableCell className="font-mono text-xs">{tx.id}</TableCell>
            <TableCell>{mockCustomers.find((c) => c.id === tx.customerId)?.name}</TableCell>
            <TableCell>{typeLabel[tx.type]}</TableCell>
            <TableCell>{tx.amount.toLocaleString("fa-IR")}</TableCell>
            <TableCell>
              <Badge variant={statusMap[tx.status].variant}>{statusMap[tx.status].label}</Badge>
            </TableCell>
            <TableCell>{format(new Date(tx.createdAt), "PPP", { locale: faIR })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
