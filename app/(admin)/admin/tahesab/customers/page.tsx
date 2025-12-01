"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getTahesabCustomers, type TahesabCustomer } from "@/lib/api/tahesab";

export default function TahesabCustomersPage() {
  const [customers, setCustomers] = useState<TahesabCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ search: string; group: string }>(() => ({ search: "", group: "all" }));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getTahesabCustomers({
          search: filters.search || undefined,
          groupId: filters.group === "all" ? undefined : filters.group,
        });
        setCustomers(result);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت مشتریان");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters.search, filters.group]);

  const groups = useMemo(() => {
    const values = customers.map((c) => c.groupId && c.groupName ? { id: c.groupId, name: c.groupName } : null).filter(Boolean);
    const unique: Record<string, string> = {};
    values.forEach((g) => {
      if (g && !unique[g.id]) unique[g.id] = g.name;
    });
    return unique;
  }, [customers]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
    );
  }

  const filtered = customers.filter((c) =>
    filters.group === "all" ? true : c.groupId === filters.group
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">مشتریان تاهساب</h1>
          <p className="text-sm text-muted-foreground">لیست مشتریان و حساب‌های تاهساب</p>
        </div>
        <Button asChild>
          <Link href="/admin/tahesab/customers/new">+ مشتری جدید</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>فیلتر</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="جستجو بر اساس کد/نام/موبایل"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-56"
            />
            <Select value={filters.group} onValueChange={(v) => setFilters((f) => ({ ...f, group: v }))}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="گروه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه گروه‌ها</SelectItem>
                {Object.entries(groups).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={() => setFilters({ search: "", group: "all" })}>
            ریست
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست مشتریان</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2">کد</th>
                <th className="p-2">نام</th>
                <th className="p-2">گروه</th>
                <th className="p-2">موبایل</th>
                <th className="p-2">کد ملی</th>
                <th className="p-2">شهر</th>
                <th className="p-2">فلز پیش‌فرض</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust.code} className="border-t transition hover:bg-muted/40">
                  <td className="p-2 font-semibold">
                    <Link href={`/admin/tahesab/customers/${cust.code}`} className="underline">
                      {cust.code}
                    </Link>
                  </td>
                  <td className="p-2">{cust.name}</td>
                  <td className="p-2">{cust.groupName ?? "-"}</td>
                  <td className="p-2">{cust.mobile ?? "-"}</td>
                  <td className="p-2">{cust.nationalId ?? "-"}</td>
                  <td className="p-2">{cust.city ?? "-"}</td>
                  <td className="p-2">{cust.defaultMetal ?? "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    داده‌ای یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
