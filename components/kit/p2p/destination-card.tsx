"use client";

import { Button } from "@/components/ui/button";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { copyText, destinationAllText, destinationValue } from "@/lib/utils/clipboard";

interface Props {
  destinationToPay?: P2PAllocation["destinationToPay"];
  destinationCopyText?: string | null;
  paymentCode?: string | null;
  mode: "payer" | "receiver" | "admin";
}

export function DestinationCard({ destinationToPay, destinationCopyText, paymentCode, mode }: Props) {
  const value = destinationValue(destinationToPay);
  const allText = destinationCopyText || destinationAllText(destinationToPay);

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold">اطلاعات مقصد</h3>
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <p>عنوان: {destinationToPay?.title ?? "-"}</p>
        <p>بانک: {destinationToPay?.bankName ?? "-"}</p>
        <p>صاحب حساب: {destinationToPay?.ownerName ?? "-"}</p>
        <p>شماره: {value || "-"}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copyText(allText)} disabled={!allText}>کپی اطلاعات</Button>
        <Button variant="outline" size="sm" onClick={() => copyText(value)} disabled={!value}>کپی شماره</Button>
        {paymentCode ? <Button variant="outline" size="sm" onClick={() => copyText(paymentCode)}>کپی کد تخصیص</Button> : null}
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
