"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { adminCreateCustomerGroup, adminDeleteCustomerGroup, adminListCustomerGroupsPaged, adminPatchCustomerGroup } from "@/lib/api/foundation";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

export default function CustomerGroupsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ code: "", name: "", tahesabGroupName: "" });

  const save = useMutation({
    mutationFn: () => editing ? adminPatchCustomerGroup(editing.id, form) : adminCreateCustomerGroup(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["foundation-customer-groups"] }); setOpen(false); setEditing(null); },
    onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: string) => adminDeleteCustomerGroup(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["foundation-customer-groups"] }), onError: (e) => toast({ title: formatApiErrorFa(e), variant: "destructive" }) });

  return (
    <div className="space-y-3">
      <Button onClick={() => { setEditing(null); setForm({ code: "", name: "", tahesabGroupName: "" }); setOpen(true); }}>ثبت گروه جدید</Button>
      <ServerTableView<any>
        storageKey="foundation-customer-groups"
        title="گروه‌های مشتریان"
        columns={[
          { accessorKey: "code", header: "کد گروه" },
          { accessorKey: "name", header: "نام گروه" },
          { accessorKey: "tahesabGroupName", header: "نام گروه در ته‌حساب" },
        ] as any}
        queryKeyFactory={(params) => ["foundation-customer-groups", params]}
        queryFn={async (params) => {
          const data = await adminListCustomerGroupsPaged({ page: params.page, limit: params.limit, q: params.search });
          return { items: data.items, meta: { ...data.meta, total: data.meta.totalItems } as any };
        }}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/customer-groups/${row.id}`}>مشاهده</Link></Button>
            <Button size="sm" onClick={() => { setEditing(row); setForm({ code: row.code, name: row.name, tahesabGroupName: row.tahesabGroupName ?? "" }); setOpen(true); }}>ویرایش</Button>
            <Button size="sm" variant="destructive" onClick={() => del.mutate(row.id)}>حذف</Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "ویرایش گروه" : "ثبت گروه"}</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Input placeholder="کد گروه" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
            <Input placeholder="نام گروه" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder="نام گروه در ته‌حساب" value={form.tahesabGroupName} onChange={(e) => setForm((p) => ({ ...p, tahesabGroupName: e.target.value }))} />
            <Button onClick={() => save.mutate()}>{editing ? "ذخیره" : "ثبت"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
