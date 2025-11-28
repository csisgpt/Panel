'use client';

import { transactions, customers, accounts } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const [customerId, setCustomerId] = useState("all");
  const router = useRouter();

  const filtered = useMemo(() => {
    return transactions.filter((t) => (customerId === "all" ? true : t.customerId === customerId));
  }, [customerId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
        <p className="text-sm text-muted-foreground">پیگیری تراکنش‌ها و وضعیت‌ها</p>
      </div>
      <Card className="p-4">
        <div className="grid max-w-md grid-cols-1 gap-3 md:grid-cols-2">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="all">همه مشتریان</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>شناسه</TableHead>
            <TableHead>مشتری</TableHead>
            <TableHead>حساب</TableHead>
            <TableHead>نوع</TableHead>
            <TableHead>مبلغ</TableHead>
            <TableHead>وضعیت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((t) => (
            <TableRow key={t.id} className="cursor-pointer" onClick={() => router.push(`/transactions/${t.id}`)}>
              <TableCell className="font-mono text-xs">{t.id}</TableCell>
              <TableCell>{customers.find((c) => c.id === t.customerId)?.name}</TableCell>
              <TableCell>{accounts.find((a) => a.id === t.accountId)?.accountName}</TableCell>
              <TableCell>{t.type}</TableCell>
              <TableCell>{t.amount.toLocaleString("fa-IR")} ریال</TableCell>
              <TableCell>
                <Badge variant={t.status === "success" ? "success" : t.status === "pending" ? "warning" : "destructive"}>
                  {t.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
