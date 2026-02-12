"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMeOverview, getMePolicySummary } from "@/lib/api/me";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TraderDashboardPage() {
  const overview = useQuery({ queryKey: ["me-overview"], queryFn: getMeOverview });
  const policy = useQuery({ queryKey: ["me-policy"], queryFn: getMePolicySummary });
  if (overview.isLoading) return <div>در حال بارگذاری...</div>;

  const capabilities = (overview.data as any)?.capabilities || {};
  const reasons = capabilities.reasons || [];

  return <div className="grid gap-4 md:grid-cols-2">
    <Card><CardHeader><CardTitle>Wallet summary</CardTitle></CardHeader><CardContent>{overview.data?.wallet?.summary?.balancesHiddenByUserSetting ? "***" : JSON.stringify(overview.data?.wallet?.summary?.balancesForAdmin || [])}</CardContent></Card>
    <Card><CardHeader><CardTitle>KYC</CardTitle></CardHeader><CardContent className="space-y-2"><p>{overview.data?.kyc?.status || "UNKNOWN"}</p><Button asChild size="sm"><Link href="/trader/profile">تکمیل KYC</Link></Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Capabilities</CardTitle></CardHeader><CardContent><div className="space-y-2"><p>Trade: {String(capabilities.canTrade)}</p><p>Withdraw: {String(capabilities.canWithdraw)}</p>{reasons.map((r: any, i: number) => <div key={i}><Badge variant="outline">{r.code || "reason"}</Badge> <span className="text-xs">{r.message} {r.meta?.requiredLevel ? `(level: ${r.meta.requiredLevel})` : ""}</span></div>)}</div></CardContent></Card>
    <Card><CardHeader><CardTitle>Policy summary</CardTitle></CardHeader><CardContent className="text-xs"><pre>{JSON.stringify(policy.data, null, 2)}</pre></CardContent></Card>
  </div>;
}
