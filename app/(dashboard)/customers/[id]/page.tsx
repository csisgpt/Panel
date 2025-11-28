'use client';

import { useParams } from "next/navigation";
import { customers, accounts, transactions } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { TransactionTable } from "@/components/transactions/transaction-table";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customer = customers.find((c) => c.id === id);
  const customerAccounts = accounts.filter((a) => a.customerId === id);
  const customerTransactions = transactions.filter((t) => t.customerId === id);

  if (!customer) return <div>مشتری یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card className="border bg-gradient-to-l from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <Badge variant={customer.status === "active" ? "success" : "destructive"}>{customer.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>کد ملی: {customer.nationalId}</span>
          <span>تاریخ ایجاد: {customer.createdAt}</span>
        </CardContent>
      </Card>
      <Tabs
        items={[
          {
            value: "accounts",
            label: "حساب‌ها",
            content: (
              <div className="grid gap-3 md:grid-cols-2">
                {customerAccounts.map((acc) => (
                  <Card key={acc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{acc.accountName}</p>
                        <p className="text-lg font-semibold">{acc.totalBalance.toLocaleString("fa-IR")} ریال</p>
                      </div>
                      <Badge variant={acc.status === "active" ? "success" : "destructive"}>{acc.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )
          },
          {
            value: "transactions",
            label: "تراکنش‌ها",
            content: <TransactionTable data={customerTransactions} />
          }
        ]}
      />
    </div>
  );
}
