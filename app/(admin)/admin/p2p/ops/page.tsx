"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { getOpsSummary } from "@/lib/api/p2p";

export default function AdminP2POpsPage() {
  const query = useQuery({ queryKey: ["admin", "p2p", "ops-summary"], queryFn: getOpsSummary });

  if (query.isLoading) return <LoadingState lines={4} />;
  if (query.error) return <ErrorState description="خطا در دریافت وضعیت عملیات" onAction={() => query.refetch()} />;

  const summary = query.data;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="نیازمند تخصیص" value={String(summary.needsAssignment)} />
        <KpiCard title="رسیدهای ثبت شده" value={String(summary.proofSubmitted)} />
        <KpiCard title="اختلاف‌ها" value={String(summary.disputes)} />
        <KpiCard title="نزدیک به انقضا" value={String(summary.expiringSoon)} />
        {summary.finalizable !== undefined ? <KpiCard title="آماده نهایی‌سازی" value={String(summary.finalizable)} /> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/p2p/withdrawals">صف برداشت‌ها</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/p2p/allocations">تخصیص‌ها</Link>
        </Button>
      </div>
    </div>
  );
}
