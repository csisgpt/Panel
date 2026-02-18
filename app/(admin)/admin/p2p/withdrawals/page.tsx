"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";
import { assignToWithdrawal, listWithdrawalCandidates } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MoneyInput } from "@/components/ui/money-input";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";

export default function AdminP2PWithdrawalsPage() {
  const cfg = useMemo(()=>createAdminP2PWithdrawalsListConfig(),[]);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PWithdrawal | null>(null);
  const [amounts, setAmounts] = useState<Record<string, number | undefined>>({});
  const q = useQuery({ queryKey:["cand",selected?.id], enabled: open && !!selected, queryFn: ()=>listWithdrawalCandidates(selected!.id,{page:1,limit:20}) });
  const remaining = Number(selected?.remainingToAssign || 0);
  const total: number = Object.values(amounts).reduce<number>((a,b)=>a + (b ?? 0),0);

  const submit = async () => {
    if (!selected || total<=0 || total>remaining) return;
    await assignToWithdrawal(selected.id,{items:Object.entries(amounts).filter(([,v])=>(v||0)>0).map(([id,v])=>({depositId:id,amount:String(v)}))});
    qc.invalidateQueries({queryKey:["admin","p2p","withdrawals"]});
    setOpen(false);
  };

  return <div className="space-y-4"><ServerTableView<P2PWithdrawal> {...cfg} rowActions={(row)=><Button size="sm" onClick={()=>{setSelected(row);setOpen(true);setAmounts({});}}>تخصیص برداشت</Button>} />
  <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="w-full sm:max-w-3xl"><SheetHeader><SheetTitle>تخصیص برداشت</SheetTitle></SheetHeader>
    <div className="rounded-2xl border p-4 text-sm"><p>مبلغ: {selected?.amount}</p><p>باقی‌مانده: {selected?.remainingToAssign}</p><p>مقصد: {selected?.destinationSummary ?? "-"}</p></div>
    <div className="space-y-3">{(q.data?.items||[]).map((c)=>{const av=Number(c.remainingAmount);return <div key={c.id} className="rounded-xl border p-3"><p className="text-sm">{c.id}</p><p className="text-xs text-muted-foreground">موجود: {c.remainingAmount}</p><div className="flex gap-2 items-end"><div className="flex-1"><MoneyInput value={amounts[c.id]} onChange={(v)=>setAmounts((p)=>({...p,[c.id]:v && v>av?av:v}))} label="" min={0} max={av} /></div><Button size="sm" variant="outline" onClick={()=>setAmounts((p)=>({...p,[c.id]:av}))}>حداکثر</Button></div></div>;})}</div>
    <div className="rounded-lg border p-3 text-sm"><p>جمع تخصیص: {total}</p><p>باقی‌مانده: {Math.max(remaining-total,0)}</p></div>
    <StickyFormFooter className="-mx-6"><div className="flex justify-end"><Button onClick={submit} disabled={total<=0 || total>remaining}>ثبت</Button></div></StickyFormFooter>
  </SheetContent></Sheet></div>;
}
