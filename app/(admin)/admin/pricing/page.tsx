"use client";

import { useEffect, useState } from "react";
import { getInstruments, getInstrumentPrices } from "@/lib/api/instruments";
import { Instrument, InstrumentPrice } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PricingRow {
  instrumentId: string;
  basePrice: string;
  spread: string;
}

export default function PricingPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [prices, setPrices] = useState<InstrumentPrice[]>([]);
  const [rows, setRows] = useState<PricingRow[]>([]);

  useEffect(() => {
    Promise.all([getInstruments(), getInstrumentPrices()]).then(([ins, prs]) => {
      setInstruments(ins);
      setPrices(prs);
      setRows(
        ins.map((item) => ({
          instrumentId: item.id,
          basePrice: prs.find((p) => p.instrumentId === item.id)?.sellPrice ?? "0",
          spread: "0",
        }))
      );
    });
  }, []);

  const handleChange = (instrumentId: string, field: keyof PricingRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.instrumentId === instrumentId ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تنظیمات قیمت‌گذاری</h1>
        <p className="text-sm text-muted-foreground">همگام با مدل‌های قیمت ابزار</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>پایه قیمت و اسپرد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row) => {
            const instrument = instruments.find((i) => i.id === row.instrumentId);
            const latestPrice = prices.find((p) => p.instrumentId === row.instrumentId);
            return (
              <div key={row.instrumentId} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-4">
                <div>
                  <div className="font-semibold">{instrument?.name}</div>
                  <p className="text-xs text-muted-foreground">کد: {instrument?.code}</p>
                </div>
                <div className="space-y-1">
                  <Label>قیمت پایه</Label>
                  <Input value={row.basePrice} onChange={(e) => handleChange(row.instrumentId, "basePrice", e.target.value)} />
                  <p className="text-xs text-muted-foreground">آخرین فروش: {latestPrice?.sellPrice}</p>
                </div>
                <div className="space-y-1">
                  <Label>اسپرد</Label>
                  <Input value={row.spread} onChange={(e) => handleChange(row.instrumentId, "spread", e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button className="w-full" type="button">ذخیره (نمایشی)</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
