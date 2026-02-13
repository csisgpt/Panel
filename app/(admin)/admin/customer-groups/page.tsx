"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminCreateCustomerGroup, adminDeleteCustomerGroup, adminListCustomerGroupsPaged, adminPutCustomerGroup } from "@/lib/api/foundation";
import type { CustomerGroup } from "@/lib/contracts/foundation/dtos";
import { formatApiErrorFa } from "@/lib/contracts/errors";
import { useToast } from "@/hooks/use-toast";

interface CreateForm {
  code: string;
  name: string;
  tahesabGroupName: string;
  isDefault: boolean;
}

interface UpdateForm {
  name: string;
  tahesabGroupName: string;
  isDefault: boolean;
}

export default function CustomerGroupsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerGroup | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>({ code: "", name: "", tahesabGroupName: "", isDefault: false });
  const [updateForm, setUpdateForm] = useState<UpdateForm>({ name: "", tahesabGroupName: "", isDefault: false });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!editing) {
        return adminCreateCustomerGroup({
          code: createForm.code,
          name: createForm.name,
          tahesabGroupName: createForm.tahesabGroupName || null,
          isDefault: createForm.isDefault,
        });
      }
      return adminPutCustomerGroup(editing.id, {
        name: updateForm.name,
        tahesabGroupName: updateForm.tahesabGroupName || null,
        isDefault: updateForm.isDefault,
      });
    },
    onSuccess: () => {
      toast({ title: "عملیات موفق بود" });
      qc.invalidateQueries({ queryKey: ["foundation-customer-groups"] });
      setOpen(false);
      setEditing(null);
    },
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteCustomerGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["foundation-customer-groups"] }),
    onError: (error) => toast({ title: formatApiErrorFa(error), variant: "destructive" }),
  });

  return (
    <div className="space-y-3">
      <Button onClick={() => { setEditing(null); setOpen(true); }}>ثبت گروه جدید</Button>
      <ServerTableView<CustomerGroup>
        storageKey="foundation-customer-groups"
        title="گروه‌های مشتریان"
        columns={[
          { accessorKey: "code", header: "کد گروه" },
          { accessorKey: "name", header: "نام گروه" },
          { accessorKey: "tahesabGroupName", header: "نام گروه در ته‌حساب" },
          { id: "isDefault", header: "پیش‌فرض", cell: ({ row }) => (row.original.isDefault ? "بله" : "خیر") },
        ]}
        queryKeyFactory={(params) => ["foundation-customer-groups", params]}
        queryFn={async (params) => {
          const data = await adminListCustomerGroupsPaged({ page: params.page, limit: params.limit, q: params.search });
          return { items: data.items, meta: { page: data.meta.page, limit: data.meta.limit, total: data.meta.totalItems, totalPages: data.meta.totalPages, hasNextPage: data.meta.hasNextPage, hasPrevPage: data.meta.hasPrevPage } };
        }}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={`/admin/customer-groups/${row.id}`}>مشاهده</Link></Button>
            <Button size="sm" onClick={() => { setEditing(row); setUpdateForm({ name: row.name, tahesabGroupName: row.tahesabGroupName ?? "", isDefault: row.isDefault }); setOpen(true); }}>ویرایش</Button>
            <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(row.id)}>حذف</Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "ویرایش گروه" : "ثبت گروه"}</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            {!editing ? (
              <>
                <Label>کد گروه</Label>
                <Input value={createForm.code} onChange={(e) => setCreateForm((p) => ({ ...p, code: e.target.value }))} placeholder="کد یکتا" />
              </>
            ) : (
              <>
                <Label>کد گروه</Label>
                <Input value={editing.code} readOnly />
              </>
            )}
            <Label>نام گروه</Label>
            <Input value={editing ? updateForm.name : createForm.name} onChange={(e) => editing ? setUpdateForm((p) => ({ ...p, name: e.target.value })) : setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            <Label>نام گروه در ته‌حساب</Label>
            <Input value={editing ? updateForm.tahesabGroupName : createForm.tahesabGroupName} onChange={(e) => editing ? setUpdateForm((p) => ({ ...p, tahesabGroupName: e.target.value })) : setCreateForm((p) => ({ ...p, tahesabGroupName: e.target.value }))} />
            <div className="flex items-center justify-between">
              <Label>گروه پیش‌فرض</Label>
              <Switch checked={editing ? updateForm.isDefault : createForm.isDefault} onCheckedChange={(checked) => editing ? setUpdateForm((p) => ({ ...p, isDefault: checked })) : setCreateForm((p) => ({ ...p, isDefault: checked }))} />
            </div>
            <Button onClick={() => saveMutation.mutate()}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
