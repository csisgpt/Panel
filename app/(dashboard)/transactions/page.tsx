'use client';

import { useEffect, useMemo, useState } from "react";
import {
  getMockTransactions,
  getMockCustomers,
  getMockAccounts,
  Transaction,
  Customer,
  Account,
  TransactionType
} from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function TransactionsPage() {
  const [customerId, setCustomerId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getMockTransactions().then((txs) =>
      setTransactionList(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
    getMockCustomers().then(setCustomerList);
    getMockAccounts().then(setAccountList);
  }, []);

  const filteredAccounts = useMemo(() => {
    return customerId === "all" ? accountList : accountList.filter((a) => a.customerId === customerId);
  }, [accountList, customerId]);

  const filtered = useMemo(() => {
    return transactionList.filter((t) => {
      const byCustomer = customerId === "all" ? true : t.customerId === customerId;
      const byAccount = accountId === "all" ? true : t.accountId === accountId;
      const byType = type === "all" ? true : t.type === type;
      const afterFrom = dateFrom ? new Date(t.createdAt) >= new Date(dateFrom) : true;
      const beforeTo = dateTo ? new Date(t.createdAt) <= new Date(dateTo) : true;
      return byCustomer && byAccount && byType && afterFrom && beforeTo;
    });
  }, [accountId, customerId, dateFrom, dateTo, transactionList, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
          <p className="text-sm text-muted-foreground">پیگیری تراکنش‌ها و وضعیت‌ها</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 md:hidden" onClick={() => setFiltersOpen((p) => !p)}>
          <SlidersHorizontal className="h-4 w-4" />
          فیلترها
          <ChevronDown className={`h-4 w-4 transition ${filtersOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>
      <Card className={`p-4 ${filtersOpen ? "block" : "hidden md:block"}`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setAccountId("all"); }}>
            <option value="all">همه مشتریان</option>
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="all">همه حساب‌ها</option>
            {filteredAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value as TransactionType | "all")}>
            <option value="all">همه انواع</option>
            <option value="DEPOSIT">واریز</option>
            <option value="WITHDRAW">برداشت</option>
            <option value="BUY_GOLD">خرید طلا</option>
            <option value="SELL_GOLD">فروش طلا</option>
            <option value="FEE">کارمزد</option>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="از تاریخ" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="تا تاریخ" />
        </div>
      </Card>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <Table className="min-w-[860px]">
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
                <TableCell>{customerList.find((c) => c.id === t.customerId)?.name}</TableCell>
                <TableCell>{accountList.find((a) => a.id === t.accountId)?.name}</TableCell>
                <TableCell>
                  {t.type === "DEPOSIT"
                    ? "واریز"
                    : t.type === "WITHDRAW"
                      ? "برداشت"
                      : t.type === "BUY_GOLD"
                        ? "خرید طلا"
                        : t.type === "SELL_GOLD"
                          ? "فروش طلا"
                          : "کارمزد"}
                </TableCell>
                <TableCell>{t.amount.toLocaleString("fa-IR")} ریال</TableCell>
                <TableCell>
                  <Badge variant={t.status === "SUCCESS" ? "success" : t.status === "PENDING" ? "warning" : "destructive"}>
                    {t.status === "SUCCESS" ? "موفق" : t.status === "PENDING" ? "در انتظار" : "ناموفق"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
