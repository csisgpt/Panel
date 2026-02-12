"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpsertPolicyRules, createPolicyRule, deletePolicyRule, listPolicyRules, updatePolicyRule } from "@/lib/api/admin-policy";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PolicyRulesPage() {
  const [open, setOpen] = useState(false); const [bulkOpen, setBulkOpen] = useState(false); const [edit, setEdit] = useState<any>(null); const [json, setJson] = useState("[]");
  const [form, setForm] = useState<any>({ scopeType: "GLOBAL", action: "WITHDRAW", metric: "AMOUNT", period: "DAILY", limit: "0", enabled: true });
  const qc = useQueryClient();
  const save = useMutation({ mutationFn: (body: any) => edit ? updatePolicyRule(edit.id, body) : createPolicyRule(body), onSuccess: () => { setOpen(false); qc.invalidateQueries({ queryKey: ["policy-rules"] }); } });
  const del = useMutation({ mutationFn: (id: string) => deletePolicyRule(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["policy-rules"] }) });
  const bulk = useMutation({ mutationFn: () => bulkUpsertPolicyRules(JSON.parse(json)), onSuccess: () => { setBulkOpen(false); qc.invalidateQueries({ queryKey: ["policy-rules"] }); } });

  return <>
    <div className="flex gap-2"><Button onClick={() => { setEdit(null); setOpen(true); }}>Rule جدید</Button><Button variant="outline" onClick={() => setBulkOpen(true)}>Bulk Upsert</Button></div>
    <ServerTableView<any>
      storageKey="policy-rules"
      title="Policy Rules"
      columns={[{ accessorKey: "scopeType", header: "Scope" }, { id: "rule", header: "Rule", cell: ({ row }: any) => `${row.original.action}/${row.original.metric}/${row.original.period}` }, { accessorKey: "limit", header: "Limit" }, { accessorKey: "enabled", header: "Enabled" }, { accessorKey: "priority", header: "Priority" }] as any}
      queryKeyFactory={(params) => ["policy-rules", params]}
      queryFn={(params) => listPolicyRules({ page: params.page, limit: params.limit, ...(params.filters as any) }).then((r) => ({ items: r.items ?? [], meta: (r.meta as any) ?? { page: 1, limit: 20, totalItems: r.items?.length || 0, totalPages: 1 } }))}
      rowActions={(row) => <div className="flex gap-2"><Button size="sm" onClick={() => { setEdit(row); setForm(row); setOpen(true); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => del.mutate(row.id)}>Delete</Button></div>}
    />
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><div className="grid gap-2"><Input placeholder="scopeType" value={form.scopeType} onChange={(e) => setForm({ ...form, scopeType: e.target.value })} /><Input placeholder="action" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} /><Input placeholder="metric" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} /><Input placeholder="period" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /><Input placeholder="limit" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} /><Button onClick={() => save.mutate(form)}>Save</Button></div></DialogContent></Dialog>
    <Dialog open={bulkOpen} onOpenChange={setBulkOpen}><DialogContent><Textarea rows={12} value={json} onChange={(e) => setJson(e.target.value)} /><Button onClick={() => bulk.mutate()}>Submit</Button></DialogContent></Dialog>
  </>;
}
