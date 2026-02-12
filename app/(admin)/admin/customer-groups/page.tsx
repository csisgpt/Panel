"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomerGroup, deleteCustomerGroup, listCustomerGroupsPaged, updateCustomerGroup } from "@/lib/api/admin-customer-groups";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function GroupsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState<any>({ code: "", name: "", tahesabGroupName: "" });
  const save = useMutation({ mutationFn: (body: any) => (edit ? updateCustomerGroup(edit.id, body) : createCustomerGroup(body)), onSuccess: () => { qc.invalidateQueries({ queryKey: ["groups"] }); setOpen(false); setEdit(null); } });
  const del = useMutation({ mutationFn: (id: string) => deleteCustomerGroup(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }) });

  return <>
    <ServerTableView<any>
      storageKey="groups"
      title="گروه مشتریان"
      columns={[{ accessorKey: "code", header: "کد" }, { accessorKey: "name", header: "نام" }, { accessorKey: "tahesabGroupName", header: "گروه تاهساب" }, { accessorKey: "usersCount", header: "تعداد" }] as any}
      queryKeyFactory={(params) => ["groups", params]}
      queryFn={(params) => listCustomerGroupsPaged({ page: params.page, limit: params.limit, q: params.search }).then((r) => ({ items: r.items, meta: (r.meta as any) ?? { page: 1, limit: 20, totalItems: r.items.length, totalPages: 1 } }))}
      rowActions={(row) => <div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/customer-groups/${row.id}`}>مشاهده</Link></Button><Button size="sm" onClick={() => { setEdit(row); setForm(row); setOpen(true); }}>ویرایش</Button><Button size="sm" variant="destructive" onClick={() => del.mutate(row.id)}>حذف</Button></div>}
      emptyState={{ title: "گروهی نیست", actionLabel: "ایجاد", onAction: () => setOpen(true) }}
    />
    <Button onClick={() => { setEdit(null); setForm({ code: "", name: "", tahesabGroupName: "" }); setOpen(true); }}>گروه جدید</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{edit ? "ویرایش" : "ایجاد"}</DialogTitle></DialogHeader><div className="grid gap-2"><Input placeholder="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /><Input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="tahesabGroupName" value={form.tahesabGroupName || ""} onChange={(e) => setForm({ ...form, tahesabGroupName: e.target.value })} /><Button onClick={() => save.mutate(form)}>ذخیره</Button></div></DialogContent></Dialog>
  </>;
}
