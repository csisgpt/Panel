"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserDestinationsListConfig } from "@/lib/screens/user/destinations.list";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { createUserDestination, makeUserDestinationDefault, updateUserDestination } from "@/lib/api/payment-destinations";
import type { DestinationForm } from "@/lib/contracts/p2p";
import type { PaymentDestinationView } from "@/lib/types/backend";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { key: "type", title: "نوع و عنوان", description: "نوع مقصد و عنوان نمایش" },
  { key: "value", title: "مشخصات حساب", description: "شماره یا شبا" },
  { key: "confirm", title: "تایید نهایی" },
];

export default function TraderDestinationsPage() {
  const config = useMemo(() => createUserDestinationsListConfig(), []);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editing, setEditing] = useState<PaymentDestinationView | null>(null);
  const [form, setForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });
  const [setDefault, setSetDefault] = useState(false);

  const completedKeys = useMemo(() => {
    const keys: string[] = [];
    if (form.type && form.title) keys.push("type");
    if (form.value) keys.push("value");
    return keys;
  }, [form.type, form.title, form.value]);

  const resetForm = () => {
    setForm({ type: "IBAN", title: "", value: "", bankName: "" });
    setSetDefault(false);
    setActiveIndex(0);
    setEditing(null);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleEdit = (item: PaymentDestinationView) => {
    setEditing(item);
    setForm({
      type: item.type ?? "IBAN",
      title: item.title ?? "",
      value: item.maskedValue ?? "",
      bankName: item.bankName ?? "",
    });
    setSetDefault(Boolean(item.isDefault));
    setActiveIndex(0);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateUserDestination(editing.id, form);
      } else {
        const created = await createUserDestination(form);
        if (setDefault) {
          await makeUserDestinationDefault(created.id);
        }
      }
      if (editing && setDefault) {
        await makeUserDestinationDefault(editing.id);
      }
      queryClient.invalidateQueries({ queryKey: ["user", "destinations"] });
      toast({ title: "ذخیره شد" });
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "ثبت مقصد ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">مقاصد پرداخت</h1>
        <Button onClick={handleOpen}>افزودن مقصد</Button>
      </div>

      <ServerTableView<PaymentDestinationView>
        {...config}
        renderCard={(row) => (
          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{row.title ?? "بدون عنوان"}</p>
                <p className="text-xs text-muted-foreground">{row.maskedValue}</p>
                <p className="text-xs text-muted-foreground">{row.bankName ?? "-"}</p>
              </div>
              {row.isDefault ? <span className="text-xs text-muted-foreground">پیش‌فرض</span> : null}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                ویرایش
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await makeUserDestinationDefault(row.id);
                  queryClient.invalidateQueries({ queryKey: ["user", "destinations"] });
                }}
              >
                پیش‌فرض
              </Button>
            </div>
          </div>
        )}
        emptyState={{
          title: "مقصدی ثبت نشده است",
          description: "برای ثبت مقصد جدید اقدام کنید.",
          actionLabel: "افزودن مقصد",
          onAction: handleOpen,
        }}
        rowActions={(row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
              ویرایش
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await makeUserDestinationDefault(row.id);
                queryClient.invalidateQueries({ queryKey: ["user", "destinations"] });
              }}
            >
              پیش‌فرض
            </Button>
          </div>
        )}
      />

      <WizardSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) resetForm();
          setOpen(next);
        }}
        title={editing ? "ویرایش مقصد" : "ثبت مقصد جدید"}
        description="لطفا اطلاعات مقصد را وارد کنید."
        steps={steps}
        activeIndex={activeIndex}
        completedKeys={completedKeys}
        onBack={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() => setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onSubmit={handleSubmit}
        isNextDisabled={activeIndex === 0 ? !(form.type && form.title) : activeIndex === 1 ? !form.value : false}
        isSubmitDisabled={!form.value || !form.title}
        submitLabel={editing ? "به‌روزرسانی" : "ثبت مقصد"}
      >
        {activeIndex === 0 ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm">نوع مقصد</label>
              <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as DestinationForm["type"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IBAN">شبا</SelectItem>
                  <SelectItem value="CARD">کارت</SelectItem>
                  <SelectItem value="ACCOUNT">حساب</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">عنوان مقصد</label>
              <Input value={form.title ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
          </div>
        ) : null}

        {activeIndex === 1 ? (
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm">شماره مقصد</label>
              <Input value={form.value ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">نام بانک (اختیاری)</label>
              <Input value={form.bankName ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))} />
            </div>
          </div>
        ) : null}

        {activeIndex === 2 ? (
          <div className="space-y-4">
            <div className="rounded-md border p-4 text-sm">
              <p>نوع: {form.type === "IBAN" ? "شبا" : form.type === "CARD" ? "کارت" : "حساب"}</p>
              <p>عنوان: {form.title}</p>
              <p>شماره: {form.value}</p>
              <p>بانک: {form.bankName || "-"}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={setDefault}
                onChange={(event) => setSetDefault(event.target.checked)}
              />
              تعیین به عنوان پیش‌فرض
            </label>
          </div>
        ) : null}
      </WizardSheet>
    </div>
  );
}
