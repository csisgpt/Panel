"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ConfirmActionDialog } from "@/components/kit/dialogs/confirm-action-dialog";
import { adminCreateSystemDestination, adminDeleteSystemDestination, adminSetSystemDestinationStatus, adminUpdateSystemDestination, listAdminP2PSystemDestinations } from "@/lib/api/p2p";
import type { P2PSystemDestinationVm } from "@/lib/contracts/p2p";
import { copyText } from "@/lib/utils/clipboard";

type FormState = { title: string; type: "IBAN" | "CARD" | "ACCOUNT"; value: string; bankName: string; ownerName: string; isActive: boolean };
const emptyForm: FormState = { title: "", type: "CARD", value: "", bankName: "", ownerName: "", isActive: true };

export default function AdminSystemDestinationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "ACTIVE" | "DISABLED">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<P2PSystemDestinationVm | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteItem, setDeleteItem] = useState<P2PSystemDestinationVm | null>(null);

  const destinationsQuery = useQuery({ queryKey: ["admin", "p2p", "system-destinations"], queryFn: listAdminP2PSystemDestinations });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "p2p", "system-destinations"] });
  const createMutation = useMutation({ mutationFn: adminCreateSystemDestination, onSuccess: async () => { setOpen(false); await refresh(); } });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminUpdateSystemDestination>[1] }) => adminUpdateSystemDestination(id, payload), onSuccess: refresh });
  const statusMutation = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminSetSystemDestinationStatus(id, isActive), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: adminDeleteSystemDestination, onSuccess: async () => { setDeleteItem(null); await refresh(); } });

  const rows = useMemo(() => (destinationsQuery.data ?? []).filter((row) => {
    const resolvedStatus = row.status ?? (row.isActive ? "ACTIVE" : "DISABLED");
    const byStatus = status === "all" ? true : resolvedStatus === status;
    const bySearch = search ? `${row.title ?? ""} ${row.maskedValue} ${row.bankName ?? ""}`.toLowerCase().includes(search.toLowerCase()) : true;
    return byStatus && bySearch;
  }), [destinationsQuery.data, search, status]);

  const onSubmit = async () => {
    if (!form.title || !form.type || !form.value) return;
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: form });
      setOpen(false);
    } else {
      await createMutation.mutateAsync(form);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">مقاصد سیستمی</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>افزودن مقصد</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="جستجو" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-72" />
        <Select value={status} onValueChange={(value) => setStatus(value as "all" | "ACTIVE" | "DISABLED")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه</SelectItem><SelectItem value="ACTIVE">فعال</SelectItem><SelectItem value="DISABLED">غیرفعال</SelectItem></SelectContent>
        </Select>
      </div>

      {destinationsQuery.isLoading ? <LoadingState /> : null}
      {destinationsQuery.isError ? <ErrorState error={destinationsQuery.error as any} onAction={destinationsQuery.refetch} /> : null}

      {rows.length ? <div className="space-y-2">{rows.map((row) => {
        const value = row.fullValue ?? row.maskedValue;
        const all = row.copyText ?? [row.title, row.bankName, row.ownerName, value].filter(Boolean).join("\n");
        return (
          <div key={row.id} className="flex items-start justify-between rounded-xl border p-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium">{row.title ?? row.id}</p><p>{row.bankName ?? "-"}</p><p>{row.ownerName ?? "-"}</p><p>{value}</p>
              <p className="text-xs text-muted-foreground">{row.type} | {row.isActive ? "فعال" : "غیرفعال"} | تعداد تخصیص: {row.allocationCount ?? "-"} | آخرین استفاده: {row.lastUsedAt ?? "-"}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(all)} disabled={!all}>کپی اطلاعات</Button>
                <Button size="sm" variant="outline" onClick={() => copyText(value)} disabled={!value}>کپی شماره</Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(row); setForm({ title: row.title ?? "", type: row.type, value: row.fullValue ?? row.maskedValue, bankName: row.bankName ?? "", ownerName: row.ownerName ?? "", isActive: row.isActive }); setOpen(true); }}>ویرایش</Button>
              <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: row.id, isActive: !row.isActive })}>{row.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}</Button>
              <Button size="sm" variant="destructive" onClick={() => setDeleteItem(row)}>حذف</Button>
            </div>
          </div>
        );
      })}</div> : (!destinationsQuery.isLoading && !destinationsQuery.isError ? <EmptyState title="مقصد سیستمی یافت نشد" description="فیلترها را تغییر دهید یا دوباره تلاش کنید." /> : null)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "ویرایش مقصد" : "ایجاد مقصد"}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Input placeholder="عنوان" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <Select value={form.type} onValueChange={(value) => setForm((p) => ({ ...p, type: value as FormState["type"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IBAN">IBAN</SelectItem><SelectItem value="CARD">CARD</SelectItem><SelectItem value="ACCOUNT">ACCOUNT</SelectItem></SelectContent></Select>
            <Input placeholder="مقدار" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} />
            <Input placeholder="بانک" value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} />
            <Input placeholder="صاحب حساب" value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} />
            <Button onClick={onSubmit} disabled={!form.title || !form.type || !form.value}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(deleteItem)}
        onOpenChange={(state) => !state && setDeleteItem(null)}
        title="حذف مقصد سیستمی"
        description={deleteItem?.allocationCount ? "این مقصد قبلاً استفاده شده است. از حذف آن اطمینان دارید؟" : "آیا از حذف مقصد مطمئن هستید؟"}
        destructive
        onConfirm={() => deleteItem ? deleteMutation.mutate(deleteItem.id) : undefined}
      />
    </div>
  );
}
