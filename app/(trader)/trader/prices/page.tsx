"use client";

import { useEffect, useMemo, useState } from "react";
import { getInstruments, getInstrumentPrices } from "@/lib/api/instruments";
import { getUsers } from "@/lib/api/users";
import { createTrade } from "@/lib/api/trades";
import { Instrument, InstrumentPrice, CreateTradeDto, TradeSide, SettlementMethod, InstrumentType, BackendUser, UserRole } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function TraderPricesPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [prices, setPrices] = useState<InstrumentPrice[]>([]);
  const [customers, setCustomers] = useState<BackendUser[]>([]);
  const [filterType, setFilterType] = useState<InstrumentType | "ALL">("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [form, setForm] = useState<CreateTradeDto>({
    instrumentCode: "",
    side: TradeSide.BUY,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "0",
    pricePerUnit: "0",
    clientNote: "",
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [ins, prs, users] = await Promise.all([getInstruments(), getInstrumentPrices(), getUsers()]);
        setInstruments(ins);
        setPrices(prs);
        setCustomers(users.filter((u) => u.role === UserRole.CLIENT));
        if (ins.length) {
          setForm((prev) => ({ ...prev, instrumentCode: ins[0].code, pricePerUnit: prs[0]?.sellPrice ?? "0" }));
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visiblePrices = useMemo(() => {
    if (filterType === "ALL") return prices;
    return prices.filter((p) => p.instrument?.type === filterType);
  }, [prices, filterType]);

  const priceForInstrument = prices.find((p) => p.instrument?.code === form.instrumentCode);

  const handleSubmit = async () => {
    if (!form.instrumentCode || !form.quantity) {
      toast({ title: "ورود اطلاعات الزامی است", variant: "destructive" });
      return;
    }
    const customerName = customers.find((c) => c.id === selectedCustomerId)?.fullName;
    const payload: CreateTradeDto = {
      ...form,
      clientNote: form.clientNote || (customerName ? `مشتری: ${customerName}` : undefined),
    };

    const created = await createTrade(payload);
    toast({ title: "درخواست معامله ثبت شد", description: created.id });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تابلوی قیمت</h1>
        <p className="text-sm text-muted-foreground">ثبت معامله بر اساس DTOهای بک‌اند</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>قیمت‌ها</CardTitle>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as InstrumentType | "ALL") }>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="همه ابزارها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه</SelectItem>
              <SelectItem value={InstrumentType.GOLD}>طلا</SelectItem>
              <SelectItem value={InstrumentType.COIN}>سکه</SelectItem>
              <SelectItem value={InstrumentType.FIAT}>ارز</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {visiblePrices.map((p) => (
            <div key={p.id} className="flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{p.instrument?.name}</div>
                <Badge variant="outline">{p.instrument?.code}</Badge>
              </div>
              <div className="text-muted-foreground">خرید: {p.buyPrice} | فروش: {p.sellPrice}</div>
              <Button size="sm" onClick={() => { setForm((prev) => ({ ...prev, instrumentCode: p.instrument?.code || "", pricePerUnit: p.sellPrice })); setDialogOpen(true); }}>ثبت سفارش</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تیکت معامله</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>مشتری</Label>
              <Select value={selectedCustomerId} onValueChange={(v) => setSelectedCustomerId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب مشتری" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ابزار</Label>
              <Select
                value={form.instrumentCode}
                onValueChange={(v) => setForm((prev) => ({ ...prev, instrumentCode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((ins) => (
                    <SelectItem key={ins.id} value={ins.code}>
                      {ins.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>جهت معامله</Label>
                <Select value={form.side} onValueChange={(v) => setForm((prev) => ({ ...prev, side: v as TradeSide }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TradeSide.BUY}>خرید</SelectItem>
                    <SelectItem value={TradeSide.SELL}>فروش</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>روش تسویه</Label>
                <Select
                  value={form.settlementMethod}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, settlementMethod: v as SettlementMethod }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SettlementMethod.WALLET}>کیف پول</SelectItem>
                    <SelectItem value={SettlementMethod.EXTERNAL}>انتقال بانکی</SelectItem>
                    <SelectItem value={SettlementMethod.CASH}>نقدی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>مقدار</Label>
                <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>قیمت واحد</Label>
                <Input value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
                <p className="text-xs text-muted-foreground">آخرین: {priceForInstrument?.sellPrice}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Label>توضیح مشتری</Label>
              <Input value={form.clientNote} onChange={(e) => setForm({ ...form, clientNote: e.target.value })} />
            </div>
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              جمع کل تقریبی: {(Number(form.quantity || "0") * Number(form.pricePerUnit || "0")).toLocaleString()} ریال
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSubmit} disabled={!form.instrumentCode || !form.quantity}>
              ثبت معامله
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
