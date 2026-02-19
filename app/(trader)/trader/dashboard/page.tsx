"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getMeOverview } from "@/lib/api/foundation";
import { faLabels } from "@/lib/i18n/fa";

export default function TraderDashboardPage() {
  const overview = useQuery({ queryKey: ["foundation-me-overview-dashboard"], queryFn: getMeOverview });
  if (overview.isLoading) return <div>{faLabels.common.loading}</div>;
  if (!overview.data) return <div>{faLabels.common.fetchError}</div>;

  const policy = overview.data.policy.summary;

  const renderPolicySection = (
    title: string,
    item: { daily: { limit: string | null; kycRequiredLevel: string | null; source: string }; monthly: { limit: string | null; kycRequiredLevel: string | null; source: string } }
  ) => (
    <div className="space-y-2 rounded border p-3">
      <p className="font-medium">{title}</p>
      <div className="text-sm">
        <p>روزانه — سقف: {item.daily.limit ?? "—"} | حداقل سطح احراز هویت: {item.daily.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.daily.source as keyof typeof faLabels.policySource] ?? item.daily.source}</p>
        <p>ماهانه — سقف: {item.monthly.limit ?? "—"} | حداقل سطح احراز هویت: {item.monthly.kycRequiredLevel ?? "—"} | منبع: {faLabels.policySource[item.monthly.source as keyof typeof faLabels.policySource] ?? item.monthly.source}</p>
      </div>
    </div>
  );

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
        <CardContent className="space-y-3">
          {renderPolicySection("برداشت ریالی", policy.withdrawIrr)}
          <Separator />
          {renderPolicySection("خرید", policy.tradeBuyNotionalIrr)}
          <Separator />
          {renderPolicySection("فروش", policy.tradeSellNotionalIrr)}
        </CardContent>
      </Card>
    </div>
  );
}
