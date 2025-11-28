'use client';

import { useMemo, useState } from "react";
import { accounts, customers } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const [type, setType] = useState("all");
  const router = useRouter();

  const filtered = useMemo(() => {
    return accounts.filter((a) => (type === "all" ? true : a.type === type));
  }, [type]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حساب‌ها</h1>
          <p className="text-sm text-muted-foreground">مرور حساب‌های مشتریان</p>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid max-w-md grid-cols-1 gap-3 md:grid-cols-2">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">همه نوع حساب</option>
            <option value="main">اصلی</option>
            <option value="margin">مارجین</option>
            <option value="savings">پس‌انداز</option>
          </Select>
        </div>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>مشتری</TableHead>
            <TableHead>نام حساب</TableHead>
            <TableHead>نوع</TableHead>
            <TableHead>مانده کل</TableHead>
            <TableHead>وضعیت</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((acc) => (
            <TableRow key={acc.id} className="cursor-pointer" onClick={() => router.push(`/accounts/${acc.id}`)}>
              <TableCell>{customers.find((c) => c.id === acc.customerId)?.name}</TableCell>
              <TableCell className="font-medium">{acc.accountName}</TableCell>
              <TableCell>{acc.type}</TableCell>
              <TableCell>{acc.totalBalance.toLocaleString("fa-IR")} ریال</TableCell>
              <TableCell>
                <Badge variant={acc.status === "active" ? "success" : "destructive"}>{acc.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
