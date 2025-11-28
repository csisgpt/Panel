'use client';

import { useRouter } from "next/navigation";
import { transactions, customers } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  success: { label: "موفق", variant: "success" },
  pending: { label: "در انتظار", variant: "warning" },
  failed: { label: "ناموفق", variant: "destructive" }
};

export function TransactionTable({ data = transactions.slice(0, 5) }: { data?: typeof transactions }) {
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
            <TableCell>{customers.find((c) => c.id === tx.customerId)?.name}</TableCell>
            <TableCell>{tx.type}</TableCell>
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
