"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { FileUploader } from "@/components/kit/files/file-uploader";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { DestinationCard } from "@/components/kit/p2p/destination-card";
import { FormSection } from "@/components/kit/forms/form-section";
import { MaskedInput } from "@/components/ui/masked-input";
import { JalaliDateTimePicker } from "@/components/ui/jalali-datetime-picker";
import { listMyAllocationsAsPayer, submitAllocationProof } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { PaymentMethod } from "@/lib/types/backend";

const methods = [PaymentMethod.CARD_TO_CARD, PaymentMethod.PAYA, PaymentMethod.SATNA, PaymentMethod.TRANSFER, PaymentMethod.UNKNOWN];

export default function TraderPayerPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [bankRef, setBankRef] = useState("");
  const [paidAt, setPaidAt] = useState<string>();
  const [fileIds, setFileIds] = useState<string[]>([]);

  const submit = async () => {
    if (!selected || !method || !bankRef || !paidAt) return;
    await submitAllocationProof(selected.id, { method, bankRef, paidAt, fileIds });
    qc.invalidateQueries({ queryKey: ["p2p", "allocations", "payer"] });
    setOpen(false);
  };

  const columns: ColumnDef<P2PAllocation>[] = [{id:"id",header:"شناسه",cell:({row})=>row.original.id},{id:"amount",header:"مبلغ",cell:({row})=>row.original.amount}];

  return <div className="space-y-4">
    <ServerTableView<P2PAllocation> title="پرداخت‌های P2P" description="" storageKey="trader.p2p.payer" columns={columns} queryKeyFactory={(p)=>["p2p","allocations","payer",p]} queryFn={listMyAllocationsAsPayer} defaultParams={{page:1,limit:10}}
      rowActions={(row)=><Button size="sm" onClick={()=>{setSelected(row);setOpen(true);setStep(0);}}>ثبت پرداخت</Button>} />
    <WizardSheet open={open} onOpenChange={setOpen} title="ثبت پرداخت" description="" steps={[{key:"d",title:"مقصد پرداخت"},{key:"i",title:"اطلاعات پرداخت"},{key:"a",title:"بارگذاری رسید"},{key:"r",title:"بازبینی"}]} activeIndex={step} completedKeys={[]} onBack={()=>setStep((s)=>Math.max(s-1,0))} onNext={()=>setStep((s)=>Math.min(s+1,3))} onSubmit={submit} isNextDisabled={(step===1 && (!method || !bankRef || !paidAt))} isSubmitDisabled={!method || !bankRef || !paidAt} submitLabel="ثبت">
      {step===0 && selected ? <DestinationCard destinationToPay={selected.destinationToPay} destinationCopyText={selected.destinationCopyText} paymentCode={selected.paymentCode} mode="payer" />:null}
      {step===1 ? <FormSection title="اطلاعات پرداخت"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="space-y-2"><label className="text-sm">روش پرداخت</label><Select value={method} onValueChange={(v)=>setMethod(v as PaymentMethod)}><SelectTrigger><SelectValue placeholder="انتخاب"/></SelectTrigger><SelectContent>{methods.map((m)=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div><MaskedInput maskType="bankRef" value={bankRef} onChange={setBankRef} label="شناسه پیگیری / کد رهگیری" placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰" hint="فقط عدد وارد کنید." /><JalaliDateTimePicker value={paidAt} onChange={setPaidAt} error={!paidAt?"تاریخ پرداخت الزامی است.":undefined} /></div></FormSection> : null}
      {step===2 ? <FormSection title="رسید / پیوست‌ها"><FileUploader maxFiles={5} accept="image/*,application/pdf" label="رسید / پیوست‌ها" onUploaded={setFileIds} /></FormSection> : null}
      {step===3 && selected ? <FormSection title="بازبینی"><p>مبلغ: {selected.amount}</p><p>کد تخصیص: {selected.paymentCode || "-"}</p><p>روش: {method}</p><p>شناسه پیگیری: {bankRef}</p><AttachmentViewer files={selected.attachments ?? []} /></FormSection> : null}
    </WizardSheet>
  </div>;
}
