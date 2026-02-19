"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { DestinationCard } from "@/components/kit/p2p/destination-card";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";
import { P2PTimeline } from "@/components/kit/p2p/p2p-timeline";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";

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
  if (!allocation) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>جزئیات تخصیص</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-20">
          <FormSection title="خلاصه">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>شناسه: {allocation.id}</p>
              <p>مبلغ: {formatMoney(allocation.amount)}</p>
              <p>پرداخت‌کننده: {allocation.payerName ?? "-"}</p>
              <p>دریافت‌کننده: {allocation.receiverName ?? "سیستمی"}</p>
              <p>کد تخصیص: {allocation.paymentCode ?? "-"}</p>
              <div>
                وضعیت: <P2PStatusBadge status={allocation.status} />
              </div>
            </div>
          </FormSection>

          <FormSection title="مقصد پرداخت">
            <DestinationCard
              destinationToPay={allocation.destinationToPay}
              destinationCopyText={allocation.destinationCopyText}
              paymentCode={allocation.paymentCode}
              mode="admin"
            />
          </FormSection>

          <FormSection title="اطلاعات پرداخت">
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>روش: {allocation.payment?.method ?? allocation.paymentMethod ?? "-"}</p>
              <p>شناسه پیگیری: {allocation.payment?.bankRef ?? allocation.bankRef ?? "-"}</p>
              <p>زمان پرداخت: {allocation.payment?.paidAt ?? allocation.paidAt ?? "-"}</p>
            </div>
          </FormSection>

          <FormSection title="پیوست‌ها">
            <AttachmentViewer files={allocation.attachments ?? []} />
          </FormSection>

          <FormSection title="تایم‌لاین">
            <P2PTimeline
              items={[
                { label: "ایجاد", value: allocation.createdAt },
                { label: "ثبت رسید", value: allocation.timestamps?.proofSubmittedAt },
                { label: "تأیید گیرنده", value: allocation.timestamps?.receiverConfirmedAt },
                { label: "تأیید ادمین", value: allocation.timestamps?.adminVerifiedAt },
                { label: "نهایی", value: allocation.timestamps?.settledAt },
              ]}
            />
          </FormSection>
        </div>

        <StickyFormFooter className="-mx-6">
          <div className="flex flex-wrap justify-end gap-2">
            {allocation.actions?.canAdminVerify ? <Button onClick={onVerify}>بررسی</Button> : null}
            {allocation.actions?.canFinalize ? <Button variant="outline" onClick={onFinalize}>نهایی‌سازی</Button> : null}
            {allocation.actions?.canCancel ? <Button variant="destructive" onClick={onCancel}>لغو</Button> : null}
            <Button variant="outline" onClick={() => onOpenChange(false)}>بستن</Button>
          </div>
        </StickyFormFooter>
      </SheetContent>
    </Sheet>
  );
}
