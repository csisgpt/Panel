'use client';

import { useParams } from "next/navigation";
import { accounts, customers, transactions } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/transactions/transaction-table";

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const account = accounts.find((a) => a.id === id);
  const customer = customers.find((c) => c.id === account?.customerId);
  const accountTransactions = transactions.filter((t) => t.accountId === id);

  if (!account) return <div>حساب یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{account.accountName}</CardTitle>
              <p className="text-sm text-muted-foreground">مشتری: {customer?.name}</p>
            </div>
            <Badge variant={account.status === "active" ? "success" : "destructive"}>{account.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Stat label="مانده قابل برداشت" value={account.availableBalance} />
          <Stat label="مانده بلوکه‌شده" value={account.blockedBalance} />
          <Stat label="مانده کل" value={account.totalBalance} />
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button>واریز</Button>
        <Button variant="outline">برداشت</Button>
        <Button variant="secondary">ثبت تراکنش دستی</Button>
      </div>
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">تراکنش‌های حساب</h3>
        </div>
        <TransactionTable data={accountTransactions} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 shadow-none">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value.toLocaleString("fa-IR")} ریال</p>
    </Card>
  );
}
