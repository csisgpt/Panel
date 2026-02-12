"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMeOverview } from "@/lib/api/foundation";
import { faLabels } from "@/lib/i18n/fa";

export default function TraderDashboardPage() {
  const overview = useQuery({ queryKey: ["foundation-me-overview-dashboard"], queryFn: getMeOverview });
  if (overview.isLoading) return <div>{faLabels.common.loading}</div>;
  if (!overview.data) return <div>{faLabels.common.fetchError}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>کیف پول</CardTitle></CardHeader>
        <CardContent>{overview.data.wallet.summary.balancesHiddenByUserSetting ? "***" : (overview.data.wallet.summary.irrAvailable ?? "—")}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>وضعیت احراز هویت</CardTitle></CardHeader>
        <CardContent className="space-y-2"><p>{overview.data.kyc ? faLabels.kycStatus[overview.data.kyc.status] : faLabels.kycStatus.NONE}</p><Button asChild size="sm"><Link href="/trader/profile">رفتن به پروفایل</Link></Button></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>قابلیت‌ها</CardTitle></CardHeader>
        <CardContent><p>امکان معامله: {String(overview.data.capabilities?.canTrade)}</p><p>امکان برداشت: {String(overview.data.capabilities?.canWithdraw)}</p>{(overview.data.capabilities?.reasons ?? []).map((reason, index) => <div key={`${reason.code}-${index}`}><Badge variant="outline">{reason.code}</Badge> <span className="text-xs">{reason.message}</span></div>)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>خلاصه پالیسی</CardTitle></CardHeader>
        <CardContent><pre className="text-xs">{JSON.stringify(overview.data.policy.summary, null, 2)}</pre></CardContent>
      </Card>
    </div>
  );
}
