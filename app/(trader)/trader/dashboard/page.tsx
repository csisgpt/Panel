"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { listMyAllocationsAsPayer, listMyAllocationsAsReceiver } from "@/lib/api/p2p";
import { getMyWithdrawals } from "@/lib/api/withdrawals";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import type { WithdrawRequest } from "@/lib/types/backend";

export default function TraderDashboardPage() {
  const router = useRouter();
  const [payerAllocations, setPayerAllocations] = useState<P2PAllocation[]>([]);
  const [receiverAllocations, setReceiverAllocations] = useState<P2PAllocation[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    Promise.all([
      listMyAllocationsAsPayer({ page: 1, limit: 50 }),
      listMyAllocationsAsReceiver({ page: 1, limit: 50 }),
      getMyWithdrawals(),
    ])
      .then(([payer, receiver, userWithdrawals]) => {
        if (!mounted) return;
        setPayerAllocations(payer.items);
        setReceiverAllocations(receiver.items);
        setWithdrawals(userWithdrawals);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const payerPending = payerAllocations.filter((item) => item.status === "ASSIGNED").length;
    const receiverPending = receiverAllocations.filter((item) => item.status === "PROOF_SUBMITTED").length;
    const withdrawalsPending = withdrawals.filter((item) => item.status === "PENDING").length;
    return {
      payerPending,
      receiverPending,
      withdrawalsPending,
    };
  }, [payerAllocations, receiverAllocations, withdrawals]);

  if (loading) {
    return <LoadingState lines={4} />;
  }

  if (error) {
    return <ErrorState description="خطا در دریافت اطلاعات داشبورد" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">پرداخت‌های منتظر اقدام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.payerPending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">دریافت‌های منتظر تایید</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.receiverPending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">برداشت‌های در انتظار تخصیص</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.withdrawalsPending}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>اقدامات سریع</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/trader/withdrawals/new")}>ثبت برداشت</Button>
            <Button variant="outline" onClick={() => router.push("/trader/deposits/new")}>ثبت واریز</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>عملیات P2P</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/trader/p2p/payer")}>پرداخت‌ها</Button>
            <Button variant="outline" onClick={() => router.push("/trader/p2p/receiver")}>دریافت‌ها</Button>
            <Button variant="outline" onClick={() => router.push("/trader/history")}>تاریخچه</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
