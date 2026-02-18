"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { P2PAllocation } from "@/lib/contracts/p2p";

interface Props {
  destinationToPay?: P2PAllocation["destinationToPay"];
  destinationCopyText?: string | null;
  paymentCode?: string | null;
  mode: "payer" | "receiver" | "admin";
}

export function DestinationCard({ destinationToPay, destinationCopyText, paymentCode, mode }: Props) {
  const destinationValue = mode === "payer" && destinationToPay?.fullValue ? destinationToPay.fullValue : destinationToPay?.masked;
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
        {destinationCopyText ? <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(destinationCopyText)}><Copy className="ms-1 h-4 w-4" />کپی اطلاعات مقصد</Button> : null}
        {paymentCode ? <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(paymentCode)}><Copy className="ms-1 h-4 w-4" />کپی کد تخصیص</Button> : null}
      </div>
      <ul className="list-disc space-y-1 ps-5 text-xs text-muted-foreground">
        <li>مبلغ را دقیق وارد کنید.</li>
        <li>پس از پرداخت، شناسه پیگیری را ثبت کنید.</li>
        <li>رسید باید واضح و کامل باشد.</li>
      </ul>
    </div>
  );
}
