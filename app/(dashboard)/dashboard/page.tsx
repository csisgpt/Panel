'use client';

import { KpiCard } from "@/components/ui/kpi-card";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import {
  dashboardChartData,
  transactionTypeData,
  getMockTransactions,
  getMockCustomers,
  getMockAccounts,
  Account,
  Customer,
  Transaction
} from "@/lib/mock-data";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, Activity, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const colors = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function DashboardPage() {
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);

  useEffect(() => {
    getMockCustomers().then(setCustomerList);
    getMockAccounts().then(setAccountList);
    getMockTransactions().then((data) =>
      setTransactionList(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }, []);

  const kpis = useMemo(() => {
    const totalBalance = accountList.reduce((s, a) => s + a.totalBalance, 0);
    const today = new Date().toDateString();
    const todayTransactions = transactionList.filter((tx) => new Date(tx.createdAt).toDateString() === today).length;
    return [
      { title: "تعداد مشتریان", value: customerList.length.toString(), subtitle: "فهرست مشتریان فعال و غیرفعال", icon: <Users /> },
      { title: "تعداد حساب‌ها", value: accountList.length.toString(), subtitle: "حساب‌های اصلی و جانبی", icon: <CreditCard /> },
      { title: "تراکنش‌های امروز", value: todayTransactions.toString(), subtitle: "همه انواع تراکنش", icon: <Activity /> },
      {
        title: "مجموع مانده حساب‌ها",
        value: `${totalBalance.toLocaleString("fa-IR")} ریال`,
        subtitle: "مجموع مانده قابل برداشت + بلوکه",
        icon: <Coins />
      }
    ];
  }, [accountList, customerList.length, transactionList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">داشبورد</h1>
          <p className="text-sm text-muted-foreground">نمای کلی وضعیت سیستم مالی</p>
        </div>
        <Badge variant="outline">داده‌های نمایشی</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartContainer title="روند تراکنش‌ها در ۳۰ روز گذشته">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboardChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#7c3aed" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="سهم انواع تراکنش‌ها">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie dataKey="value" data={transactionTypeData} innerRadius={60} outerRadius={100} paddingAngle={4}>
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">آخرین تراکنش‌ها</h3>
            <p className="text-sm text-muted-foreground">لیست تراکنش‌های اخیر</p>
          </div>
        </div>
        <TransactionTable data={transactionList.slice(0, 8)} />
      </div>
    </div>
  );
}
