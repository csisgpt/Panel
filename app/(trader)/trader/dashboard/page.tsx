import { getMyTrades } from "@/lib/api/trades";
import { getMyAccounts } from "@/lib/api/accounts";
import { getMockSystemStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TraderDashboardPage() {
  const [trades, accounts, systemStatus] = await Promise.all([getMyTrades(), getMyAccounts(), getMockSystemStatus()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">داشبورد معامله‌گر</h1>
        <p className="text-sm text-muted-foreground">اطلاعات از لایه API ماک</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">تعداد معاملات</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{trades.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">حساب‌ها</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{accounts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">اتصال تاهساب</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{systemStatus.tahesabOnline ? "فعال" : "قطع"}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>آخرین معاملات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {trades.map((trade) => (
            <div key={trade.id} className="rounded-lg border p-3">
              <div className="font-semibold">{trade.instrument?.name}</div>
              <div className="text-muted-foreground">
                {trade.side} | مقدار: {trade.quantity} | وضعیت: {trade.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
