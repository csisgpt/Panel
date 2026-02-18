"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { createAdminP2PAllocationsListConfig } from "@/lib/screens/admin/p2p-allocations.list";
import { cancelAllocation, finalizeAllocation, verifyAllocation } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";

export default function AdminP2PAllocationsPage() {
  const cfg = useMemo(()=>createAdminP2PAllocationsListConfig(),[]);
  const qc = useQueryClient();
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState<P2PAllocation|null>(null);
  const [approved,setApproved]=useState(true);
  const [note,setNote]=useState("");

  const submit = async ()=>{
    if(!selected) return;
    await verifyAllocation(selected.id,{approved,note:note||undefined});
    qc.invalidateQueries({queryKey:["admin","p2p","allocations"]});
    setOpen(false);
  };

  return <div className="space-y-4"><ServerTableView<P2PAllocation> {...cfg}
    rowActions={(row)=><div className="flex gap-2"><Button size="sm" onClick={()=>{setSelected(row);setOpen(true);}}>بررسی</Button>{row.actions?.canFinalize?<Button size="sm" variant="outline" onClick={()=>finalizeAllocation(row.id)}>نهایی‌سازی</Button>:null}{row.actions?.canCancel?<Button size="sm" variant="outline" onClick={()=>cancelAllocation(row.id)}>لغو</Button>:null}</div>}
  />
  <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="w-full sm:max-w-3xl"><SheetHeader><SheetTitle>بررسی تخصیص</SheetTitle></SheetHeader>
  {selected?<div className="space-y-4 text-sm"><div className="rounded-2xl border p-4"><p>مبلغ: {selected.amount}</p><p>وضعیت: {selected.status}</p><p>پرداخت‌کننده: {selected.payerName || "-"}</p><p>گیرنده: {selected.receiverName || "-"}</p><p>روش: {selected.payment?.method ?? selected.paymentMethod ?? "-"}</p><p>شناسه پیگیری: {selected.payment?.bankRef ?? selected.bankRef ?? "-"}</p><p>تاریخ پرداخت: {selected.payment?.paidAt ?? selected.paidAt ?? "-"}</p></div><AttachmentViewer files={selected.attachments ?? []} /><div className="flex gap-2"><Button variant={approved?"default":"outline"} onClick={()=>setApproved(true)}>تأیید</Button><Button variant={!approved?"default":"outline"} onClick={()=>setApproved(false)}>لغو</Button></div><Textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="یادداشت" /></div>:null}
  <StickyFormFooter className="-mx-6"><div className="flex justify-end"><Button onClick={submit}>ثبت</Button></div></StickyFormFooter>
  </SheetContent></Sheet></div>;
}
