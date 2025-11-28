'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getMockAccount,
  getMockCustomers,
  getMockTransactions,
  Account,
  Customer,
  Transaction
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/transactions/transaction-table";

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | undefined>();
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!id) return;
    getMockAccount(id).then((data) => {
      setAccount(data);
      if (data) {
        getMockCustomers().then((customers) => setCustomer(customers.find((c) => c.id === data.customerId)));
      }
    });
    getMockTransactions({ accountId: id }).then(setAccountTransactions);
  }, [id]);

  if (!account) return <div>حساب یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <p className="text-sm text-muted-foreground">مشتری: {customer?.name}</p>
            </div>
            <Badge variant={account.status === "ACTIVE" ? "success" : account.status === "BLOCKED" ? "warning" : "outline"}>
              {account.status === "ACTIVE" ? "فعال" : account.status === "BLOCKED" ? "مسدود" : "غیرفعال"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Stat label="مانده قابل برداشت" value={account.availableBalance} />
          <Stat label="مانده بلوکه‌شده" value={account.blockedBalance} />
          <Stat label="مانده کل" value={account.totalBalance} />
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button onClick={() => alert("این فقط محیط نمایشی است")}>واریز</Button>
        <Button variant="outline" onClick={() => alert("این فقط محیط نمایشی است")}>برداشت</Button>
        <Button variant="secondary" onClick={() => alert("این فقط محیط نمایشی است")}>ثبت تراکنش دستی</Button>
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
