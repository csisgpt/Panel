"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { MaskedInput } from "@/components/ui/masked-input";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { createWithdrawal } from "@/lib/api/withdrawals";
import { createUserDestination, listUserDestinations } from "@/lib/api/payment-destinations";
import type { DestinationForm } from "@/lib/contracts/p2p";
import type { PaymentDestinationView } from "@/lib/types/backend";

export default function CreateWithdrawalPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>();
  const [note, setNote] = useState("");
  const [destinations, setDestinations] = useState<PaymentDestinationView[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });

  useEffect(() => { listUserDestinations().then((items) => { setDestinations(items); setSelectedId(items.find((i)=>i.isDefault)?.id ?? items[0]?.id ?? ""); }); }, []);

  const selected = destinations.find((d) => d.id === selectedId);
  const submit = async () => {
    if (!amount || !selectedId) return;
    await createWithdrawal({ amount: String(amount), purpose: "P2P", payoutDestinationId: selectedId, note: note || undefined });
    router.push("/trader/history?tab=withdrawals");
  };

  const createDestination = async () => {
    const d = await createUserDestination(form);
    setDestinations((p) => [d, ...p]);
    setSelectedId(d.id);
    setOpen(false);
  };

  return <div className="mx-auto max-w-3xl space-y-6">
    <FormSection title="مبلغ"><MoneyInput value={amount} onChange={setAmount} error={amount !== undefined && amount <= 0 ? "مبلغ باید بزرگتر از صفر باشد." : undefined} /></FormSection>
    <FormSection title="انتخاب مقصد" description="ابتدا مقصد پیش‌فرض نمایش داده می‌شود.">
      <div className="space-y-3">{destinations.map((d)=><Card key={d.id} className={`cursor-pointer rounded-2xl p-4 ${d.id===selectedId?"border-primary":""}`} onClick={()=>setSelectedId(d.id)}><p className="font-medium">{d.title || "-"}</p><p className="text-sm text-muted-foreground">{d.maskedValue}</p></Card>)}</div>
      <Button variant="outline" className="mt-3" onClick={()=>setOpen(true)}>مدیریت مقصدها</Button>
    </FormSection>
    <FormSection title="بازبینی"><p className="text-sm">مبلغ: {amount ?? "-"}</p><p className="text-sm">مقصد: {selected?.maskedValue ?? "-"}</p><div className="space-y-2"><label className="text-sm">توضیحات</label><Textarea value={note} onChange={(e)=>setNote(e.target.value)} /></div></FormSection>
    <StickyFormFooter><div className="flex justify-end"><Button onClick={submit} disabled={!amount || !selectedId}>ثبت</Button></div></StickyFormFooter>
    <WizardSheet open={open} onOpenChange={setOpen} title="ثبت مقصد جدید" description="" steps={[{key:"1",title:"فرم"},{key:"2",title:"بازبینی"}]} activeIndex={0} completedKeys={[]} onBack={()=>{}} onNext={()=>{}} onSubmit={createDestination} isNextDisabled isSubmitDisabled={!form.title || !form.value} submitLabel="ذخیره">
      <div className="space-y-4">
        <Select value={form.type} onValueChange={(v)=>setForm((p)=>({...p,type:v as DestinationForm['type']}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="IBAN">IBAN</SelectItem><SelectItem value="CARD">CARD</SelectItem><SelectItem value="ACCOUNT">ACCOUNT</SelectItem></SelectContent></Select>
        <MaskedInput maskType="account" label="عنوان" value={form.title||""} onChange={(v)=>setForm((p)=>({...p,title:v}))} />
        <MaskedInput maskType={form.type==="CARD"?"card":form.type==="IBAN"?"iban":"account"} label="شماره مقصد" value={form.value||""} onChange={(v)=>setForm((p)=>({...p,value:v}))} />
      </div>
    </WizardSheet>
  </div>;
}
