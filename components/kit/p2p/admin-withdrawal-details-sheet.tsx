"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";
import { P2PTimeline } from "@/components/kit/p2p/p2p-timeline";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { getAdminP2PWithdrawalDetail, listAdminP2PAllocations } from "@/lib/api/p2p";
import { copyToClipboard } from "@/lib/copy";

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

  const allocationsQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawal-details", withdrawal?.id],
    enabled: open && Boolean(withdrawal?.id) && !(detail?.allocations?.length),
    queryFn: () => listAdminP2PAllocations({ page: 1, limit: 20, filters: { withdrawalId: withdrawal!.id } }),
  });

  const allocations = detail?.allocations?.length ? detail.allocations : (allocationsQuery.data?.items ?? []);

  const timelineItems = useMemo(
    () => [
      { label: "ایجاد", value: detail?.createdAt },
      { label: "بروزرسانی", value: detail?.updatedAt },
    ],
    [detail?.createdAt, detail?.updatedAt]
  );

  if (!withdrawal || !detail) return null;
  const destinationValue = detail.destination?.fullValue ?? detail.destination?.masked;
  const destinationCopyAll = detail.destination?.copyText ?? [
    detail.destination?.title,
    detail.destination?.bankName,
    detail.destination?.ownerName,
    destinationValue,
  ].filter(Boolean).join(" | ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-4xl">
        <SheetHeader><SheetTitle>جزئیات برداشت</SheetTitle></SheetHeader>

        <div className="space-y-4 pb-20">
          <FormSection title="کاربر برداشت‌کننده">
            <div className="rounded-xl border p-3 text-sm">
              <p>{detail.withdrawer?.displayName ?? "-"}</p>
              <p>{detail.withdrawer?.mobile ?? "-"}</p>
              <div className="mt-2">
                {detail.withdrawer?.userId ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(detail.withdrawer!.userId, "شناسه کاربر کپی شد")}>کپی userId</Button> : null}
              </div>
            </div>
          </FormSection>

          <FormSection title="مقصد">
            <div className="rounded-xl border p-3 text-sm">
              <p>عنوان: {detail.destination?.title ?? "-"}</p>
              <p>بانک: {detail.destination?.bankName ?? "-"}</p>
              <p>صاحب حساب: {detail.destination?.ownerName ?? "-"}</p>
              <p>شماره: {destinationValue ?? "-"}</p>
              <div className="mt-2 flex gap-2">
                {destinationCopyAll ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(destinationCopyAll, "اطلاعات مقصد کپی شد")}>کپی همه</Button> : null}
                {destinationValue ? <Button size="sm" variant="outline" onClick={() => copyToClipboard(destinationValue, "شماره مقصد کپی شد")}>کپی شماره</Button> : null}
              </div>
            </div>
          </FormSection>

          <FormSection title="خلاصه">
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
            {allocations.length ? (
              <div className="space-y-2">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{allocation.id}</p>
                    <p>پرداخت‌کننده: {allocation.payer?.displayName ?? allocation.payerName ?? "-"} - {allocation.payer?.mobile ?? allocation.payerMobile ?? "-"}</p>
                    <p>دریافت‌کننده: {allocation.receiver?.displayName ?? allocation.receiverName ?? "-"} - {allocation.receiver?.mobile ?? allocation.receiverMobile ?? "-"}</p>
                    <p>مبلغ: {formatMoney(allocation.amount)}</p>
                    <p>انقضا: {allocation.expiresAt ?? "-"}</p>
                    <p>کد: {allocation.paymentCode ?? "-"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(allocation.allowedActions ?? []).map((action) => (
                        <Button key={action.key} size="sm" variant="outline" disabled={!action.enabled} title={action.reasonDisabled}>{action.key}</Button>
                      ))}
                      {onViewAllocation ? <Button size="sm" onClick={() => onViewAllocation(allocation.id)}>Open Allocation Details</Button> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState title="تخصیصی ثبت نشده است" description="ابتدا برداشت را تخصیص دهید." />}
          </FormSection>

          <FormSection title="تایم‌لاین"><P2PTimeline items={timelineItems} /></FormSection>
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
