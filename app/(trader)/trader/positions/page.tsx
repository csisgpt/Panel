"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyTrades } from "@/lib/api/trades";
import { getInstrumentPrices, getInstruments } from "@/lib/api/instruments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Instrument, InstrumentPrice, Trade, TradeSide, TradeStatus } from "@/lib/types/backend";

interface PositionRow {
  instrument: Instrument;
  netQuantity: number;
  avgEntry: number;
  markPrice: number;
  unrealizedPnl: number;
}

const openStatuses = [TradeStatus.PENDING, TradeStatus.APPROVED];

export default function TraderPositionsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [prices, setPrices] = useState<InstrumentPrice[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [t, p, ins] = await Promise.all([getMyTrades(), getInstrumentPrices(), getInstruments()]);
        setTrades(t);
        setPrices(p);
        setInstruments(ins);
        setError(null);
      } catch (err) {
        setError("خطا در دریافت پوزیشن‌ها");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const positions: PositionRow[] = useMemo(() => {
    const groups: Record<string, { qty: number; cost: number }> = {};
    const openTrades = trades.filter((t) => openStatuses.includes(t.status));
    openTrades.forEach((trade) => {
      const sign = trade.side === TradeSide.BUY ? 1 : -1;
      const qty = Number(trade.quantity) * sign;
      const price = Number(trade.pricePerUnit);
      if (!groups[trade.instrumentId]) {
        groups[trade.instrumentId] = { qty: 0, cost: 0 };
      }
      groups[trade.instrumentId].qty += qty;
      groups[trade.instrumentId].cost += qty * price;
    });

    return Object.entries(groups)
      .filter(([, value]) => value.qty !== 0)
      .map(([instrumentId, value]) => {
        const instrument = instruments.find((i) => i.id === instrumentId)!;
        const priceInfo = prices.find((p) => p.instrumentId === instrumentId);
        const mark = priceInfo
          ? (Number(priceInfo.buyPrice) + Number(priceInfo.sellPrice)) / 2
          : 0;
        const avgEntry = value.cost / value.qty;
        const pnl = (mark - avgEntry) * value.qty;
        return {
          instrument,
          netQuantity: value.qty,
          avgEntry,
          markPrice: mark,
          unrealizedPnl: pnl,
        };
      });
  }, [trades, prices, instruments]);

  const filteredPositions = useMemo(
    () =>
      positions.filter((p) =>
        p.instrument.name.toLowerCase().includes(search.toLowerCase()) ||
        p.instrument.code.toLowerCase().includes(search.toLowerCase())
      ),
    [positions, search]
  );

  const summary = useMemo(() => {
    const totalExposure = positions.reduce((sum, p) => sum + p.netQuantity * p.markPrice, 0);
    const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    return { totalExposure, totalPnl, count: positions.length };
  }, [positions]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">پوزیشن‌های باز</h1>
        <p className="text-sm text-muted-foreground">برآورد سود/زیان و موقعیت خالص هر ابزار</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">تعداد ابزار دارای پوزیشن</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.count}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">مواجهه کل تقریبی</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.totalExposure.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">سود/زیان تحقق نیافته</CardTitle>
          </CardHeader>
          <CardContent className={`text-2xl font-bold ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-destructive"}`}>
            {summary.totalPnl.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="جستجو بر اساس نام یا کد ابزار"
            className="w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>خلاصه پوزیشن‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>ابزار</TableHead>
                  <TableHead>مقدار خالص</TableHead>
                  <TableHead>میانگین ورود</TableHead>
                  <TableHead>قیمت لحظه‌ای</TableHead>
                  <TableHead>سود/زیان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.map((pos) => (
                  <TableRow key={pos.instrument.id}>
                    <TableCell>
                      <div className="font-semibold">{pos.instrument.name}</div>
                      <p className="text-xs text-muted-foreground">{pos.instrument.code}</p>
                    </TableCell>
                    <TableCell>{pos.netQuantity.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{pos.avgEntry.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{pos.markPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={pos.unrealizedPnl >= 0 ? "success" : "destructive"}>
                        {pos.unrealizedPnl.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPositions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      پوزیشن بازی موجود نیست.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
