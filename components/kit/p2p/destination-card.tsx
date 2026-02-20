"use client";

import { Button } from "@/components/ui/button";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { copyToClipboard } from "@/lib/copy";

interface Props {
  destinationToPay?: P2PAllocation["destinationToPay"];
  destinationCopyText?: string | null;
  paymentCode?: string | null;
  mode: "payer" | "receiver" | "admin";
}

export function DestinationCard({ destinationToPay, destinationCopyText, paymentCode, mode }: Props) {
  const destinationValue = destinationToPay?.fullValue ?? destinationToPay?.masked;
  const copyAll = destinationCopyText ?? [
    destinationToPay?.title,
    destinationToPay?.bankName,
    destinationToPay?.ownerName,
    destinationValue,
  ].filter(Boolean).join(" | ");

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">اطلاعات مقصد</h3>
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <p>عنوان: {destinationToPay?.title ?? "-"}</p>
        <p>بانک: {destinationToPay?.bankName ?? "-"}</p>
        <p>صاحب حساب: {destinationToPay?.ownerName ?? "-"}</p>
        <p>شماره: {destinationValue ?? "-"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {copyAll ? <Button variant="outline" size="sm" onClick={() => copyToClipboard(copyAll, "اطلاعات مقصد کپی شد")}>کپی همه اطلاعات مقصد</Button> : null}
        {destinationValue ? <Button variant="outline" size="sm" onClick={() => copyToClipboard(destinationValue, "شماره مقصد کپی شد")}>کپی شماره مقصد</Button> : null}
        {paymentCode ? <Button variant="outline" size="sm" onClick={() => copyToClipboard(paymentCode, "کد تخصیص کپی شد")}>کپی کد تخصیص</Button> : null}
      </div>
      {mode === "payer" ? (
        <ul className="list-disc space-y-1 ps-5 text-xs text-muted-foreground">
          <li>مبلغ را دقیق وارد کنید.</li>
          <li>پس از پرداخت، شناسه پیگیری را ثبت کنید.</li>
          <li>رسید باید واضح و کامل باشد.</li>
        </ul>
      ) : null}
    </div>
  );
}
