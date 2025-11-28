'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getMockTransaction, getMockCustomers, getMockAccounts, Transaction, Customer, Account } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [account, setAccount] = useState<Account | undefined>();

  useEffect(() => {
    if (!id) return;
    getMockTransaction(id).then((tx) => {
      setTransaction(tx);
      if (tx) {
        getMockCustomers().then((customers) => setCustomer(customers.find((c) => c.id === tx.customerId)));
        getMockAccounts().then((accs) => setAccount(accs.find((a) => a.id === tx.accountId)));
      }
    });
  }, [id]);

  if (!transaction) return <div>تراکنش یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">جزئیات تراکنش {transaction.id}</CardTitle>
            <p className="text-sm text-muted-foreground">{transaction.description ?? "بدون توضیح"}</p>
          </div>
          <Badge variant={transaction.status === "SUCCESS" ? "success" : transaction.status === "PENDING" ? "warning" : "destructive"}>
            {transaction.status === "SUCCESS" ? "موفق" : transaction.status === "PENDING" ? "در انتظار" : "ناموفق"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <DetailRow
            label="نوع"
            value={
              transaction.type === "DEPOSIT"
                ? "واریز"
                : transaction.type === "WITHDRAW"
                  ? "برداشت"
                  : transaction.type === "BUY_GOLD"
                    ? "خرید طلا"
                    : transaction.type === "SELL_GOLD"
                      ? "فروش طلا"
                      : "کارمزد"
            }
          />
          <DetailRow label="مبلغ" value={`${transaction.amount.toLocaleString("fa-IR")} ریال`} />
          <DetailRow label="مشتری" value={customer?.name ?? "نامشخص"} />
          <DetailRow label="حساب" value={account?.name ?? ""} />
          <DetailRow label="تاریخ" value={transaction.createdAt} />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">مشتری</p>
          <p className="text-sm font-semibold">{customer?.name ?? "نامشخص"}</p>
          <p className="text-xs text-muted-foreground">{customer?.phone}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">حساب مرتبط</p>
          <p className="text-sm font-semibold">{account?.name ?? "حساب ناشناس"}</p>
          <p className="text-xs text-muted-foreground">نوع حساب: {account?.type ?? "نامشخص"}</p>
        </Card>
      </div>
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
