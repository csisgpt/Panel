"use client";

import { useEffect, useState } from "react";
import { getInstruments, getInstrumentPrices } from "@/lib/api/instruments";
import { createTrade } from "@/lib/api/trades";
import { Instrument, InstrumentPrice, CreateTradeDto, TradeSide, SettlementMethod } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TraderPricesPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [prices, setPrices] = useState<InstrumentPrice[]>([]);
  const [form, setForm] = useState<CreateTradeDto>({
    instrumentCode: "",
    side: TradeSide.BUY,
    settlementMethod: SettlementMethod.WALLET,
    quantity: "0",
    pricePerUnit: "0",
    clientNote: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([getInstruments(), getInstrumentPrices()]).then(([ins, prs]) => {
      setInstruments(ins);
      setPrices(prs);
      if (ins.length) {
        setForm((prev) => ({ ...prev, instrumentCode: ins[0].code, pricePerUnit: prs[0]?.sellPrice ?? "0" }));
      }
    });
  }, []);

  const handleSubmit = async () => {
    const created = await createTrade(form);
    toast({ title: "درخواست معامله ثبت شد", description: created.id });
  };

  const priceForInstrument = prices.find((p) => p.instrument?.code === form.instrumentCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تابلوی قیمت</h1>
        <p className="text-sm text-muted-foreground">ثبت معامله بر اساس DTOهای بک‌اند</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قیمت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {prices.map((p) => (
            <div key={p.id} className="rounded-lg border p-3 text-sm">
              <div className="font-semibold">{p.instrument?.name}</div>
              <div className="text-muted-foreground">خرید: {p.buyPrice} | فروش: {p.sellPrice}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>فرم معامله</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
            <Label>مقدار</Label>
            <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>قیمت واحد</Label>
            <Input value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
            <p className="text-xs text-muted-foreground">آخرین: {priceForInstrument?.sellPrice}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
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
          <div className="space-y-1 sm:col-span-2">
            <Label>توضیح مشتری</Label>
            <Input value={form.clientNote} onChange={(e) => setForm({ ...form, clientNote: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleSubmit} className="w-full">ثبت معامله</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
