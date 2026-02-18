"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AttachmentViewer } from "@/components/kit/files/attachment-viewer";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { listMyAllocationsAsReceiver, confirmAllocationReceipt } from "@/lib/api/p2p";
import type { P2PAllocation } from "@/lib/contracts/p2p";

export default function TraderReceiverPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PAllocation | null>(null);
  const [decision, setDecision] = useState<"confirm"|"dispute">("confirm");
  const [reason, setReason] = useState("");
  const columns: ColumnDef<P2PAllocation>[] = [{id:"id",header:"شناسه",cell:({row})=>row.original.id},{id:"amount",header:"مبلغ",cell:({row})=>row.original.amount}];

  const submit = async () => {
    if (!selected) return;
    await confirmAllocationReceipt(selected.id, { confirmed: decision === "confirm", reason: decision === "dispute" ? reason : undefined });
    qc.invalidateQueries({ queryKey: ["p2p", "allocations", "receiver"] });
    setOpen(false);
  };

  return <div className="space-y-4">
    <ServerTableView<P2PAllocation> title="دریافت‌های P2P" description="" storageKey="trader.p2p.receiver" columns={columns} queryKeyFactory={(p)=>["p2p","allocations","receiver",p]} queryFn={listMyAllocationsAsReceiver} defaultParams={{page:1,limit:10}} rowActions={(row)=><Button size="sm" onClick={()=>{setSelected(row);setOpen(true);}}>تأیید دریافت</Button>} />
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="w-full sm:max-w-2xl"><SheetHeader><SheetTitle>تأیید دریافت</SheetTitle></SheetHeader>
      {selected ? <div className="space-y-4 text-sm"><div className="rounded-2xl border p-4"><p>مبلغ: {selected.amount}</p><p>تاریخ پرداخت: {selected.payment?.paidAt ?? selected.paidAt ?? "-"}</p><p>شناسه پیگیری: {selected.payment?.bankRef ?? selected.bankRef ?? "-"}</p><p>روش: {selected.payment?.method ?? selected.paymentMethod ?? "-"}</p></div><AttachmentViewer files={selected.attachments ?? []} /><div className="flex gap-2"><Button variant={decision==="confirm"?"default":"outline"} onClick={()=>setDecision("confirm")}>تأیید دریافت</Button><Button variant={decision==="dispute"?"default":"outline"} onClick={()=>setDecision("dispute")}>اعتراض</Button></div>{decision==="dispute"?<div className="space-y-2"><label>علت اعتراض</label><Textarea value={reason} onChange={(e)=>setReason(e.target.value)} /><p className="text-xs text-muted-foreground">حداقل ۱۰ کاراکتر وارد کنید.</p></div>:null}</div>:null}
      <StickyFormFooter className="-mx-6"><div className="flex justify-end"><Button onClick={submit} disabled={decision==="dispute" && reason.trim().length<10}>ثبت</Button></div></StickyFormFooter>
    </SheetContent></Sheet>
  </div>;
}
