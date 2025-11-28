import { getUsers } from "@/lib/api/users";
import { getInstruments } from "@/lib/api/instruments";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [users, instruments, deposits, withdrawals] = await Promise.all([
    getUsers(),
    getInstruments(),
    getDeposits(),
    getWithdrawals(),
  ]);

  const metrics = [
    { title: "کاربران", value: users.length.toString() },
    { title: "ابزارها", value: instruments.length.toString() },
    { title: "واریزها", value: deposits.length.toString() },
    { title: "برداشت‌ها", value: withdrawals.length.toString() },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">داشبورد ادمین</h1>
        <p className="text-sm text-muted-foreground">اطلاعات بر اساس داده‌های نمایشی</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
