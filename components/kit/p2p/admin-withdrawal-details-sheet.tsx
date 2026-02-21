"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";
import { P2PTimeline } from "@/components/kit/p2p/p2p-timeline";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { getAdminP2PWithdrawalDetail } from "@/lib/api/p2p";
import { copyText, destinationAllText, destinationValue } from "@/lib/utils/clipboard";

const allocationRiskItems = [
  { key: "isExpired", label: "منقضی" },
  { key: "hasProof", label: "رسید دارد" },
  { key: "expiresSoon", label: "نزدیک انقضا" },
] as const;

export function AdminWithdrawalDetailsSheet({
  open,
  onOpenChange,
  withdrawal,
  onAssign,
  onViewAllocation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: P2PWithdrawal | null;
  onAssign?: () => void;
  onViewAllocation?: (allocationId: string) => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawal", withdrawal?.id],
    enabled: open && Boolean(withdrawal?.id),
    queryFn: () => getAdminP2PWithdrawalDetail(withdrawal!.id),
  });

  const detail = detailQuery.data ?? withdrawal;

  const timelineItems = useMemo(
    () => [
      { label: "ایجاد", value: detail?.createdAt },
      { label: "بروزرسانی", value: detail?.updatedAt },
    ],
    [detail?.createdAt, detail?.updatedAt]
  );

  if (!withdrawal || !detail) return null;
  const destination = detail.destination;
  const destValue = destinationValue(destination);
  const destAll = destination?.copyText || destinationAllText(destination);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>جزئیات برداشت</SheetTitle>
        </SheetHeader>

        {detailQuery.isLoading && !detailQuery.data ? <LoadingState /> : null}
        {detailQuery.isError ? <ErrorState error={detailQuery.error as any} onAction={detailQuery.refetch} /> : null}

        <div className="space-y-4 pb-20">
          <FormSection title="کاربر برداشت‌کننده">
            <div className="rounded-xl border p-3 text-sm space-y-1">
              <p>{detail.withdrawer?.displayName ?? "-"}</p>
              <p>{detail.withdrawer?.mobile ?? "-"}</p>
              <p>شناسه کاربر: {detail.withdrawer?.userId ?? "-"}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {detail.withdrawer?.userStatus ? <Badge variant="secondary">وضعیت: {detail.withdrawer.userStatus}</Badge> : null}
                {detail.withdrawer?.kycLevel ? <Badge variant="secondary">سطح احراز: {detail.withdrawer.kycLevel}</Badge> : null}
                {detail.withdrawer?.kycStatus ? <Badge variant="secondary">احراز: {detail.withdrawer.kycStatus}</Badge> : null}
              </div>
              <Button size="sm" variant="outline" onClick={() => copyText(detail.withdrawer?.userId ?? "")} disabled={!detail.withdrawer?.userId}>کپی userId</Button>
            </div>
          </FormSection>

          <FormSection title="مقصد">
            <div className="rounded-xl border p-3 text-sm space-y-1">
              <p>عنوان: {destination?.title ?? "-"}</p>
              <p>بانک: {destination?.bankName ?? "-"}</p>
              <p>صاحب حساب: {destination?.ownerName ?? "-"}</p>
              <p>شماره: {destValue || "-"}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(destAll)} disabled={!destAll}>کپی اطلاعات</Button>
                <Button size="sm" variant="outline" onClick={() => copyText(destValue)} disabled={!destValue}>کپی شماره</Button>
              </div>
            </div>
          </FormSection>

          <FormSection title="خلاصه و پیشرفت">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>مبلغ: {formatMoney(detail.amount)}</p>
              <p>تخصیص‌شده: {formatMoney(detail.totals?.assigned ?? "0")}</p>
              <p>تسویه‌شده: {formatMoney(detail.totals?.settled ?? "0")}</p>
              <p>باقی‌مانده تخصیص: {formatMoney(detail.totals?.remainingToAssign ?? detail.remainingToAssign)}</p>
              <div>وضعیت: <P2PStatusBadge status={detail.status} /></div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(detail.riskFlags ?? []).map((flag) => <Badge key={flag}>{flag}</Badge>)}
            </div>
          </FormSection>

          <FormSection title="تخصیص‌ها">
            {(detail.allocations ?? []).length ? (
              <div className="space-y-2">
                {(detail.allocations ?? []).map((allocation) => (
                  <div key={allocation.id} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{allocation.id}</p>
                    <p>پرداخت‌کننده: {allocation.payer?.displayName ?? allocation.payerName ?? "-"} - {allocation.payer?.mobile ?? allocation.payerMobile ?? "-"}</p>
                    <p>دریافت‌کننده: {allocation.receiver?.displayName ?? allocation.receiverName ?? "-"} - {allocation.receiver?.mobile ?? allocation.receiverMobile ?? "-"}</p>
                    <p>مبلغ: {formatMoney(allocation.amount)}</p>
                    <p>انقضا: {allocation.expiresAt ?? "-"}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {allocation.status === "DISPUTED" ? <Badge variant="destructive">اختلاف</Badge> : null}
                      {allocationRiskItems.map((item) => (allocation[item.key] ? <Badge key={item.key} variant="secondary">{item.label}</Badge> : null))}
                    </div>
                    {onViewAllocation ? <Button className="mt-2" size="sm" onClick={() => onViewAllocation(allocation.id)}>جزئیات تخصیص</Button> : null}
                  </div>
                ))}
              </div>
            ) : <EmptyState title="تخصیصی ثبت نشده است" description="برای این برداشت هنوز تخصیصی وجود ندارد." />}
          </FormSection>

          <FormSection title="تایم‌لاین">
            <P2PTimeline items={timelineItems} />
          </FormSection>
        </div>

        <StickyFormFooter className="-mx-6">
          <div className="flex flex-wrap justify-end gap-2">
            {detail.actions?.canAssign ? <Button onClick={onAssign}>تخصیص برداشت</Button> : null}
            <Button variant="outline" onClick={() => onOpenChange(false)}>بستن</Button>
          </div>
        </StickyFormFooter>
      </SheetContent>
    </Sheet>
  );
}
