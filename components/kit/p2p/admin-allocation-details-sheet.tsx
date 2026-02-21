"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { DestinationCard } from "@/components/kit/p2p/destination-card";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";
import { P2PTimeline } from "@/components/kit/p2p/p2p-timeline";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { useQuery } from "@tanstack/react-query";
import { getAdminP2PAllocationDetail } from "@/lib/api/p2p";

export function AdminAllocationDetailsSheet({
  open,
  onOpenChange,
  allocation,
  onVerify,
  onFinalize,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: P2PAllocation | null;
  onVerify?: () => void;
  onFinalize?: () => void;
  onCancel?: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["admin", "p2p", "allocation", allocation?.id],
    enabled: open && Boolean(allocation?.id),
    queryFn: () => getAdminP2PAllocationDetail(allocation!.id),
  });

  const detail = detailQuery.data ?? allocation;

  const actionReason = useMemo(
    () => (key: string) => detail?.allowedActions?.find((a) => a.key === key)?.reasonDisabled,
    [detail?.allowedActions]
  );

  if (!detail) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>جزئیات تخصیص</SheetTitle>
        </SheetHeader>

        {detailQuery.isLoading && !detailQuery.data ? <LoadingState /> : null}
        {detailQuery.isError ? <ErrorState error={detailQuery.error as any} onAction={detailQuery.refetch} /> : null}

        <div className="space-y-4 pb-20">
          <FormSection title="خلاصه">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>شناسه: {detail.id}</p>
              <p>مبلغ: {formatMoney(detail.amount)}</p>
              <p>پرداخت‌کننده: {detail.payer?.displayName ?? detail.payerName ?? "-"} - {detail.payer?.mobile ?? detail.payerMobile ?? "-"}</p>
              <p>دریافت‌کننده: {detail.receiver?.displayName ?? detail.receiverName ?? "سیستمی"} - {detail.receiver?.mobile ?? detail.receiverMobile ?? "-"}</p>
              <p>کد تخصیص: {detail.paymentCode ?? "-"}</p>
              <div>وضعیت: <P2PStatusBadge status={detail.status} /></div>
            </div>
          </FormSection>

          <FormSection title="مقصد پرداخت">
            <DestinationCard
              destinationToPay={detail.destinationToPay}
              destinationCopyText={detail.destinationCopyText}
              paymentCode={detail.paymentCode}
              mode="admin"
            />
          </FormSection>

          <FormSection title="اطلاعات پرداخت">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>روش: {detail.payment?.method ?? detail.paymentMethod ?? "-"}</p>
              <p>شناسه پیگیری: {detail.payment?.bankRef ?? detail.bankRef ?? "-"}</p>
              <p>زمان پرداخت: {detail.payment?.paidAt ?? detail.paidAt ?? "-"}</p>
            </div>
          </FormSection>

          <FormSection title="پیوست‌ها">
            <AttachmentViewer files={detail.attachments ?? []} />
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {(detail.attachments ?? []).map((file) => (
                <p key={file.id}>{file.fileName} | {file.mimeType} | {file.sizeBytes} bytes</p>
              ))}
            </div>
          </FormSection>

          <FormSection title="تایم‌لاین">
            <P2PTimeline
              items={[
                { label: "ایجاد", value: detail.createdAt },
                { label: "ثبت رسید", value: detail.timestamps?.proofSubmittedAt },
                { label: "تأیید گیرنده", value: detail.timestamps?.receiverConfirmedAt },
                { label: "تأیید ادمین", value: detail.timestamps?.adminVerifiedAt },
                { label: "نهایی", value: detail.timestamps?.settledAt },
              ]}
            />
          </FormSection>
        </div>

        <StickyFormFooter className="-mx-6">
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={onVerify} disabled={!detail.actions?.canAdminVerify} title={actionReason("ADMIN_VERIFY")}>بررسی</Button>
            <Button variant="outline" onClick={onFinalize} disabled={!detail.actions?.canFinalize} title={actionReason("FINALIZE")}>نهایی‌سازی</Button>
            <Button variant="destructive" onClick={onCancel} disabled={!detail.actions?.canCancel} title={actionReason("CANCEL")}>لغو</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>بستن</Button>
          </div>
        </StickyFormFooter>
      </SheetContent>
    </Sheet>
  );
}
