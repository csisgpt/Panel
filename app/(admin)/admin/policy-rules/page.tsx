"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminBulkUpsertPolicyRules, adminCreatePolicyRule, adminDeletePolicyRule, adminListCustomerGroups, adminListPolicyRules, adminPatchPolicyRule } from "@/lib/api/foundation";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

export default function PolicyRulesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [rawJson, setRawJson] = useState('{"items":[]}');
  const [form, setForm] = useState<any>({
    scopeType: "GLOBAL",
    selectorType: "ALL",
    action: "WITHDRAW_IRR",
    metric: "NOTIONAL_IRR",
    period: "DAILY",
    limit: "1",
    enabled: true,
    priority: 100,
  });

  const saveMutation = useMutation({
    mutationFn: () => editRow ? adminPatchPolicyRule(editRow.id, form) : adminCreatePolicyRule(form),
    onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] }); toast({ title: "عملیات موفق بود" }); },
    onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }),
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => adminDeletePolicyRule(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] }) });
  const bulkMutation = useMutation({ mutationFn: () => adminBulkUpsertPolicyRules(JSON.parse(rawJson)), onSuccess: () => { setBulkOpen(false); qc.invalidateQueries({ queryKey: ["foundation-policy-rules"] }); } });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button onClick={() => { setEditRow(null); setOpen(true); }}>ثبت</Button>
        <Button variant="outline" onClick={() => setBulkOpen(true)}>اعمال گروهی</Button>
      </div>

      <ServerTableView<any>
        storageKey="foundation-policy-rules"
        title="قوانین پالیسی"
        columns={[
          { accessorKey: "scopeType", header: "دامنه" },
          { accessorKey: "selectorType", header: "نوع انتخابگر" },
          { accessorKey: "action", header: "عملیات" },
          { accessorKey: "metric", header: "معیار" },
          { accessorKey: "period", header: "بازه" },
          { accessorKey: "limit", header: "حد" },
          { accessorKey: "enabled", header: "فعال" },
        ] as any}
        queryKeyFactory={(params) => ["foundation-policy-rules", params]}
        queryFn={async (params) => {
          const data = await adminListPolicyRules({ page: params.page, limit: params.limit, ...(params.filters as any) });
          return { items: data.items, meta: { ...data.meta, total: data.meta.totalItems } as any };
        }}
        filtersConfig={[
          { type: "status", key: "scopeType", label: "دامنه", options: [{ label: "سراسری", value: "GLOBAL" }, { label: "گروه", value: "GROUP" }, { label: "کاربر", value: "USER" }] },
          { type: "status", key: "action", label: "عملیات", options: ["WITHDRAW_IRR", "DEPOSIT_IRR", "TRADE_BUY", "TRADE_SELL", "REMITTANCE_SEND", "CUSTODY_IN", "CUSTODY_OUT"].map((v) => ({ value: v, label: v })) },
          { type: "status", key: "metric", label: "معیار", options: ["NOTIONAL_IRR", "WEIGHT_750_G", "COUNT"].map((v) => ({ value: v, label: v })) },
          { type: "status", key: "period", label: "بازه", options: ["DAILY", "MONTHLY"].map((v) => ({ value: v, label: v })) },
        ] as any}
        rowActions={(row) => <div className="flex gap-2"><Button size="sm" onClick={() => { setEditRow(row); setForm(row); setOpen(true); }}>ویرایش</Button><Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(row.id)}>حذف</Button></div>}
      />

      <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>فرم قانون پالیسی</DialogTitle></DialogHeader><div className="grid gap-2"><Input placeholder="scopeType" value={form.scopeType} onChange={(e) => setForm((p: any) => ({ ...p, scopeType: e.target.value }))} /><Input placeholder="scopeUserId" value={form.scopeUserId ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, scopeUserId: e.target.value }))} /><Input placeholder="scopeGroupId" value={form.scopeGroupId ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, scopeGroupId: e.target.value }))} /><Input placeholder="selectorType" value={form.selectorType} onChange={(e) => setForm((p: any) => ({ ...p, selectorType: e.target.value }))} /><Input placeholder="productId" value={form.productId ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, productId: e.target.value }))} /><Input placeholder="instrumentId" value={form.instrumentId ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, instrumentId: e.target.value }))} /><Input placeholder="instrumentType" value={form.instrumentType ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, instrumentType: e.target.value }))} /><Input placeholder="action" value={form.action} onChange={(e) => setForm((p: any) => ({ ...p, action: e.target.value }))} /><Input placeholder="metric" value={form.metric} onChange={(e) => setForm((p: any) => ({ ...p, metric: e.target.value }))} /><Input placeholder="period" value={form.period} onChange={(e) => setForm((p: any) => ({ ...p, period: e.target.value }))} /><Input placeholder="limit" value={form.limit} onChange={(e) => setForm((p: any) => ({ ...p, limit: e.target.value }))} /><Input placeholder="minKycLevel" value={form.minKycLevel ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, minKycLevel: e.target.value }))} /><Button onClick={() => saveMutation.mutate()}>ذخیره</Button></div></DialogContent></Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}><DialogContent><DialogHeader><DialogTitle>اعمال گروهی قوانین</DialogTitle></DialogHeader><Textarea rows={12} value={rawJson} onChange={(e) => setRawJson(e.target.value)} /><Button onClick={() => bulkMutation.mutate()}>اعمال</Button></DialogContent></Dialog>
    </div>
  );
}
