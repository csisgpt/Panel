"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { MoneyInput } from "@/components/ui/money-input";
import { MaskedInput } from "@/components/ui/masked-input";
import { createDeposit } from "@/lib/api/deposits";
import { PaymentMethod } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";

const methodOptions = [
  { value: PaymentMethod.CARD_TO_CARD, label: "کارت به کارت" },
  { value: PaymentMethod.PAYA, label: "پایا" },
  { value: PaymentMethod.SATNA, label: "ساتنا" },
  { value: PaymentMethod.TRANSFER, label: "انتقال" },
  { value: PaymentMethod.UNKNOWN, label: "نامشخص" },
];

export default function CreateDepositPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>();
  const [method, setMethod] = useState<string>("");
  const [refNo, setRefNo] = useState("");
  const [note, setNote] = useState("");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!amount || amount <= 0 || !method) return;
    setPending(true);
    try {
      await createDeposit({ amount: String(amount), method, purpose: "DIRECT", refNo: refNo || undefined, note: note || undefined, fileIds: fileIds.length ? fileIds : undefined });
      toast({ title: "ثبت شد" });
      router.push("/trader/history?tab=deposits");
    } catch {
      toast({ title: "خطا", variant: "destructive" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 overflow-auto px-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">ثبت واریز</h1>
        <p className="text-sm text-muted-foreground">اطلاعات واریز را وارد کنید و در صورت نیاز رسید را بارگذاری کنید.</p>
      </header>
      <FormSection title="مبلغ و روش">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MoneyInput value={amount} onChange={setAmount} error={amount !== undefined && amount <= 0 ? "مبلغ باید بزرگتر از صفر باشد." : undefined} />
          <div className="space-y-2">
            <label className="text-sm">روش پرداخت</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue placeholder="انتخاب روش" /></SelectTrigger>
              <SelectContent>{methodOptions.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </FormSection>
      <FormSection title="اطلاعات تکمیلی">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MaskedInput maskType="bankRef" value={refNo} onChange={setRefNo} label="شناسه پیگیری / کد رهگیری" placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰" hint="فقط عدد وارد کنید." />
          <div className="space-y-2 md:col-span-2"><label className="text-sm">توضیحات</label><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
      </FormSection>
      <FormSection title="رسید / پیوست‌ها"><FileUploader maxFiles={3} accept="image/*,application/pdf" label="رسید / پیوست‌ها" onUploaded={setFileIds} /></FormSection>
      <StickyFormFooter><div className="flex justify-end"><Button onClick={submit} disabled={pending || !amount || amount <= 0 || !method}>{pending ? "در حال ثبت..." : "ثبت"}</Button></div></StickyFormFooter>
    </div>
  );
}
