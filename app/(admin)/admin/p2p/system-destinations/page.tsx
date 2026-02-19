"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { MaskedInput } from "@/components/ui/masked-input";
import { createSystemDestination, listAdminDestinations } from "@/lib/api/payment-destinations";
import type { DestinationForm } from "@/lib/contracts/p2p";
import { P2PStatusBadge } from "@/components/kit/p2p/p2p-status-badge";

export default function AdminSystemDestinationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "ACTIVE" | "DISABLED">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DestinationForm>({ type: "ACCOUNT", title: "", bankName: "", value: "" });
  const [active, setActive] = useState(true);

  const destinationsQuery = useQuery({
    queryKey: ["admin", "p2p", "system-destinations"],
    queryFn: () => listAdminDestinations("PAYOUT"),
  });

  const rows = useMemo(() => {
    return (destinationsQuery.data ?? []).filter((row) => {
      const byStatus = status === "all" ? true : row.status === status;
      const bySearch = search ? `${row.title ?? ""} ${row.maskedValue} ${row.bankName ?? ""}`.includes(search) : true;
      return byStatus && bySearch;
    });
  }, [destinationsQuery.data, search, status]);

  const submit = async () => {
    await createSystemDestination(form);
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "system-destinations"] });
    setOpen(false);
  };

  const maskType = form.type === "CARD" ? "card" : form.type === "IBAN" ? "iban" : "account";

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">مقاصد سیستمی</h1>
        <Button onClick={() => setOpen(true)}>افزودن مقصد</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="جستجو" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full sm:w-72" />
        <Select value={status} onValueChange={(value) => setStatus(value as "all" | "ACTIVE" | "DISABLED")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="ACTIVE">فعال</SelectItem>
            <SelectItem value="DISABLED">غیرفعال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-start justify-between rounded-xl border p-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{row.title ?? row.id}</p>
                <p>{row.maskedValue}</p>
                <p className="text-muted-foreground">{row.bankName ?? "-"}</p>
                <P2PStatusBadge status={row.status} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(row.maskedValue)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="مقصد سیستمی یافت نشد" description="برای شروع یک مقصد جدید ایجاد کنید یا فیلترها را پاک کنید." />
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader><SheetTitle>افزودن مقصد سیستمی</SheetTitle></SheetHeader>
          <FormSection title="اطلاعات مقصد">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm">نوع</label>
                <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as DestinationForm["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCOUNT">حساب</SelectItem>
                    <SelectItem value="IBAN">شبا</SelectItem>
                    <SelectItem value="CARD">کارت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">عنوان</label>
                <Input value={form.title ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <MaskedInput maskType={maskType} label="شماره" value={form.value ?? ""} onChange={(value) => setForm((prev) => ({ ...prev, value }))} />
              <div className="space-y-2">
                <label className="text-sm">نام بانک</label>
                <Input value={form.bankName ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-sm">فعال</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">در نسخه فعلی، تغییر وضعیت مقصد توسط بک‌اند ممکن است در دسترس نباشد.</p>
          </FormSection>
          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
              <Button onClick={submit} disabled={!form.title || !form.value}>ذخیره</Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
