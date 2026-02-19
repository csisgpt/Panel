"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
    enabled: open && Boolean(withdrawal?.id),
    queryFn: () => listAdminP2PAllocations({ page: 1, limit: 20, filters: { withdrawalId: withdrawal!.id } }),
  });

  const allocations = allocationsQuery.data?.items ?? [];

  const timelineItems = useMemo(
    () => [
      { label: "ایجاد", value: detail?.createdAt },
      { label: "بروزرسانی", value: detail?.updatedAt },
    ],
    [detail?.createdAt, detail?.updatedAt]
  );

  if (!withdrawal) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle>جزئیات برداشت</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-20">
          <FormSection title="خلاصه">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>شناسه: {detail.id}</p>
              <p>مبلغ: {formatMoney(detail.amount)}</p>
              <p>باقی‌مانده: {formatMoney(detail.remainingToAssign)}</p>
              <div>
                وضعیت: <P2PStatusBadge status={detail.status} />
              </div>
              <p>کانال: {detail.channel ?? "-"}</p>
              <p>هدف: {detail.purpose ?? "-"}</p>
            </div>
          </FormSection>

          <FormSection title="مقصد">
            <div className="rounded-xl border p-3 text-sm">
              <p>{detail.destinationSummary ?? "اطلاعات مقصد موجود نیست."}</p>
            </div>
          </FormSection>

          <FormSection title="تخصیص‌ها">
            {allocations.length ? (
              <div className="space-y-2">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                    <div>
                      <p className="font-medium">{allocation.id}</p>
                      <p>مبلغ: {formatMoney(allocation.amount)}</p>
                      <p>کد: {allocation.paymentCode ?? "-"}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <P2PStatusBadge status={allocation.status} />
                      {onViewAllocation ? (
                        <Button size="sm" variant="outline" onClick={() => onViewAllocation(allocation.id)}>
                          جزئیات تخصیص
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="تخصیصی ثبت نشده است"
                description="ابتدا برداشت را تخصیص دهید یا فیلترها را بررسی کنید."
              />
            )}
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
