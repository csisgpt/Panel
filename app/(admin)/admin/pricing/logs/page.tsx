"use client";

import { useEffect, useMemo, useState } from "react";
import { getPricingLogs } from "@/lib/api/pricing";
import { getUsers } from "@/lib/api/users";
import { getInstruments } from "@/lib/api/instruments";
import { PricingLog } from "@/lib/mock-data";
import { BackendUser, Instrument } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const dateOptions = [
  { label: "۳۰ روز اخیر", days: 30 },
  { label: "۷ روز اخیر", days: 7 },
  { label: "امروز", days: 0 },
];

export default function PricingLogsPage() {
  const [logs, setLogs] = useState<PricingLog[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PricingLog | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [l, u, ins] = await Promise.all([getPricingLogs(), getUsers(), getInstruments()]);
      setLogs(l);
      setUsers(u);
      setInstruments(ins);
      setError(null);
    } catch (err) {
      setError("خطا در دریافت تاریخچه قیمت");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - range);
    return logs.filter((log) => {
      const matchSearch = log.description.toLowerCase().includes(search.toLowerCase());
      const inRange = range === 30 || new Date(log.createdAt) >= start;
      return matchSearch && inRange;
    });
  }, [logs, range, search]);

  const resolveUser = (id: string) => users.find((u) => u.id === id)?.fullName || "-";
  const resolveInstruments = (ids: string[]) =>
    ids
      .map((id) => instruments.find((ins) => ins.id === id)?.name || id)
      .filter(Boolean)
      .join("، ");

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/10">
        <CardContent className="flex items-center justify-between gap-3 p-4 text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={load}>
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تاریخچه قیمت‌گذاری</h1>
          <p className="text-sm text-muted-foreground">رصد تغییرات اعمال شده روی ابزارها</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="جستجو در توضیحات"
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={range.toString()} onValueChange={(v) => setRange(Number(v))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="بازه" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((opt) => (
                  <SelectItem key={opt.days} value={opt.days.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست تغییرات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>تاریخ</TableHead>
                  <TableHead>کاربر</TableHead>
                  <TableHead>شرح</TableHead>
                  <TableHead>تعداد ابزار</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelected(log)}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("fa-IR")}
                    </TableCell>
                    <TableCell>{resolveUser(log.userId)}</TableCell>
                    <TableCell className="max-w-md text-sm leading-6">{log.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.affectedInstrumentIds.length} ابزار</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      موردی برای این فیلترها وجود ندارد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات تغییر قیمت</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">تاریخ</span>
                <span>{new Date(selected.createdAt).toLocaleString("fa-IR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">کاربر</span>
                <span>{resolveUser(selected.userId)}</span>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 leading-6">{selected.description}</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">ابزارهای متاثر</span>
                  <Badge variant="outline">{selected.affectedInstrumentIds.length}</Badge>
                </div>
                <div className="space-y-1">
                  {selected.affectedInstrumentIds.map((id) => (
                    <div key={id} className="rounded border p-2 text-xs">
                      {resolveInstruments([id])}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
