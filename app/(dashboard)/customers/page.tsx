'use client';

import { useEffect, useMemo, useState } from "react";
import { Customer, Account, getMockAccounts, getMockCustomers } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const statusLabels: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  BLOCKED: "مسدود"
};

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const router = useRouter();

  useEffect(() => {
    getMockCustomers().then(setCustomerList);
    getMockAccounts().then(setAccountList);
  }, []);

  const filtered = useMemo(() => {
    return customerList.filter((c) => {
      const matchesQuery = c.name.includes(query) || c.phone.includes(query);
      const matchesStatus = status === "all" ? true : c.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [customerList, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مشتریان</h1>
          <p className="text-sm text-muted-foreground">مدیریت و مشاهده مشتریان</p>
        </div>
        <Button>ایجاد مشتری جدید</Button>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input placeholder="جستجوی مشتری بر اساس نام یا شماره موبایل" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="blocked">مسدود</option>
          </Select>
        </div>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>نام</TableHead>
            <TableHead>شماره موبایل</TableHead>
            <TableHead>کد ملی</TableHead>
            <TableHead>تعداد حساب‌ها</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>تاریخ ایجاد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.nationalId}</TableCell>
              <TableCell>{accountList.filter((a) => a.customerId === c.id).length}</TableCell>
              <TableCell>
                <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "INACTIVE" ? "outline" : "destructive"}>
                  {statusLabels[c.status]}
                </Badge>
              </TableCell>
              <TableCell>{c.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
