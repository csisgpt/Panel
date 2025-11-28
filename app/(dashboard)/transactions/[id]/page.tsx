'use client';

import { useParams } from "next/navigation";
import { transactions, customers, accounts } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const transaction = transactions.find((t) => t.id === id);
  const customer = customers.find((c) => c.id === transaction?.customerId);
  const account = accounts.find((a) => a.id === transaction?.accountId);

  if (!transaction) return <div>تراکنش یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">جزئیات تراکنش {transaction.id}</CardTitle>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
          </div>
          <Badge variant={transaction.status === "success" ? "success" : transaction.status === "pending" ? "warning" : "destructive"}>
            {transaction.status}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow label="نوع" value={transaction.type} />
          <DetailRow label="مبلغ" value={`${transaction.amount.toLocaleString("fa-IR")} ریال`} />
          <DetailRow label="مشتری" value={customer?.name ?? "نامشخص"} />
          <DetailRow label="حساب" value={account?.accountName ?? ""} />
          <DetailRow label="تاریخ" value={transaction.createdAt} />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
