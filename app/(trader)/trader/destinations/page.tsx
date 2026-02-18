"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { FormSection } from "@/components/kit/forms/form-section";
import { MaskedInput } from "@/components/ui/masked-input";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { createUserDestinationsListConfig } from "@/lib/screens/user/destinations.list";
import { createUserDestination, makeUserDestinationDefault, updateUserDestination } from "@/lib/api/payment-destinations";
import type { DestinationForm } from "@/lib/contracts/p2p";
import type { PaymentDestinationView } from "@/lib/types/backend";

export default function TraderDestinationsPage() {
  const config = useMemo(() => createUserDestinationsListConfig(), []);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentDestinationView | null>(null);
  const [form, setForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });
  const [asDefault, setAsDefault] = useState(false);

  const submit = async () => {
    if (editing) await updateUserDestination(editing.id, { ...form, value: undefined });
    else {
      const created = await createUserDestination(form);
      if (asDefault) await makeUserDestinationDefault(created.id);
    }
    if (editing && asDefault) await makeUserDestinationDefault(editing.id);
    qc.invalidateQueries({ queryKey: ["user", "destinations"] });
    setOpen(false);
  };

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-lg font-semibold">مقاصد پرداخت</h1><Button onClick={()=>{setEditing(null);setForm({type:"IBAN",title:"",value:"",bankName:""});setOpen(true);}}>افزودن مقصد</Button></div>
    <ServerTableView<PaymentDestinationView> {...config}
      renderCard={(row)=><div className="rounded-2xl border bg-card p-4 shadow-sm text-sm space-y-2"><div className="flex justify-between"><div><p className="font-medium">{row.title||"-"}</p><p>{row.maskedValue}</p><p className="text-muted-foreground">{row.bankName||"-"}</p></div>{row.isDefault?<span className="text-xs">پیش‌فرض</span>:null}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>{setEditing(row);setForm({type:row.type,title:row.title||"",value:row.maskedValue,bankName:row.bankName||""});setOpen(true);}}>ویرایش</Button></div></div>}
    />
    <WizardSheet open={open} onOpenChange={setOpen} title={editing?"ویرایش مقصد":"ثبت مقصد"} description="" steps={[{key:"f",title:"فرم"}]} activeIndex={0} completedKeys={[]} onBack={()=>{}} onNext={()=>{}} onSubmit={submit} isNextDisabled isSubmitDisabled={!form.title || (!editing && !form.value)} submitLabel="ذخیره">
      <FormSection title="اطلاعات مقصد">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2"><label className="text-sm">نوع</label><Select value={form.type} onValueChange={(v)=>setForm((p)=>({...p,type:v as DestinationForm['type']}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="IBAN">شبا</SelectItem><SelectItem value="CARD">کارت</SelectItem><SelectItem value="ACCOUNT">حساب</SelectItem></SelectContent></Select></div>
          <MaskedInput maskType="numeric" label="عنوان" value={form.title||""} onChange={(v)=>setForm((p)=>({...p,title:v}))} />
          <MaskedInput maskType={form.type==="CARD"?"card":form.type==="IBAN"?"iban":"account"} label="شماره مقصد" value={form.value||""} onChange={(v)=>setForm((p)=>({...p,value:v}))} readOnly={!!editing} hint={editing?"برای تغییر شماره مقصد، یک مقصد جدید بسازید.":undefined} />
          <MaskedInput maskType="numeric" label="نام بانک" value={form.bankName||""} onChange={(v)=>setForm((p)=>({...p,bankName:v}))} />
          <div className="flex items-center gap-2"><Switch checked={asDefault} onCheckedChange={setAsDefault}/><span className="text-sm">پیش‌فرض</span></div>
        </div>
      </FormSection>
    </WizardSheet>
  </div>;
}
