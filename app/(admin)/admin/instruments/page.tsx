import { getInstruments, getInstrumentPrices } from "@/lib/api/instruments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminInstrumentsPage() {
  const [instruments, prices] = await Promise.all([getInstruments(), getInstrumentPrices()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ابزارها و قیمت‌ها</h1>
        <p className="text-sm text-muted-foreground">همگام با مدل‌های Prisma</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>لیست ابزارها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {instruments.map((ins) => (
            <div key={ins.id} className="rounded-lg border p-3">
              <div className="font-semibold">{ins.name} ({ins.code})</div>
              <p className="text-sm text-muted-foreground">نوع: {ins.type} | واحد: {ins.unit}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>آخرین قیمت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {prices.map((price) => (
            <div key={price.id} className="rounded-lg border p-3 text-sm">
              <div className="font-semibold">{price.instrument?.name}</div>
              <div className="text-muted-foreground">خرید: {price.buyPrice} | فروش: {price.sellPrice}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
