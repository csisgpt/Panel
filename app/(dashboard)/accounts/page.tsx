'use client';

import { useEffect, useMemo, useState } from "react";
import { Account, Customer, getMockAccounts, getMockCustomers } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const [type, setType] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => {
    getMockAccounts().then(setAccountList);
    getMockCustomers().then(setCustomerList);
  }, []);

  const filtered = useMemo(() => {
    return accountList.filter((a) => {
      const matchesType = type === "all" ? true : a.type === type;
      const matchesCustomer = customerId === "all" ? true : a.customerId === customerId;
      return matchesType && matchesCustomer;
    });
  }, [accountList, customerId, type]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حساب‌ها</h1>
          <p className="text-sm text-muted-foreground">مرور حساب‌های مشتریان</p>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-3">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="all">همه مشتریان</option>
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">همه نوع حساب</option>
            <option value="MAIN">اصلی</option>
            <option value="MARGIN">مارجین</option>
            <option value="SAVINGS">پس‌انداز</option>
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
              <TableCell>{customerList.find((c) => c.id === acc.customerId)?.name}</TableCell>
              <TableCell className="font-medium">{acc.name}</TableCell>
              <TableCell>{acc.type === "MAIN" ? "اصلی" : acc.type === "MARGIN" ? "مارجین" : "پس‌انداز"}</TableCell>
              <TableCell>{acc.totalBalance.toLocaleString("fa-IR")} ریال</TableCell>
              <TableCell>
                <Badge variant={acc.status === "ACTIVE" ? "success" : acc.status === "BLOCKED" ? "warning" : "outline"}>
                  {acc.status === "ACTIVE" ? "فعال" : acc.status === "BLOCKED" ? "مسدود" : "غیرفعال"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
