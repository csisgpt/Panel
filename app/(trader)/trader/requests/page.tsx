"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TraderRequestsPage() {
  const router = useRouter();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>برداشت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">ثبت درخواست برداشت برای تسویه سریع.</p>
          <Button onClick={() => router.push("/trader/withdrawals/new")}>ثبت برداشت</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>واریز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">ثبت درخواست واریز و ثبت روش پرداخت.</p>
          <Button variant="outline" onClick={() => router.push("/trader/deposits/new")}>ثبت واریز</Button>
        </CardContent>
      </Card>
    </div>
  );
}
