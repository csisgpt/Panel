"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "@/components/kit/forms/form-section";
import { MaskedInput } from "@/components/ui/masked-input";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { createUserDestinationsListConfig } from "@/lib/screens/user/destinations.list";
import { createUserDestination, makeUserDestinationDefault, updateUserDestination } from "@/lib/api/payment-destinations";
import type { DestinationForm } from "@/lib/contracts/p2p";
import type { PaymentDestinationView } from "@/lib/types/backend";

function normalizeValue(type: DestinationForm["type"], value: string) {
  if (type === "IBAN") return value.replace(/\s+/g, "").toUpperCase();
  return value.replace(/\s+/g, "");
}

export default function TraderDestinationsPage() {
  const config = useMemo(() => createUserDestinationsListConfig(), []);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentDestinationView | null>(null);
  const [form, setForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });
  const [asDefault, setAsDefault] = useState(false);

  const maskedInputType = form.type === "CARD" ? "card" : form.type === "IBAN" ? "iban" : "account";

  const submit = async () => {
    if (editing) {
      await updateUserDestination(editing.id, {
        type: form.type,
        title: form.title,
        bankName: form.bankName,
        value: undefined,
      });
      if (asDefault) await makeUserDestinationDefault(editing.id);
    } else {
      const created = await createUserDestination({ ...form, value: normalizeValue(form.type, form.value ?? "") });
      if (asDefault) await makeUserDestinationDefault(created.id);
    }

    await qc.invalidateQueries({ queryKey: ["user", "destinations"] });
    setOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">مقاصد پرداخت</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setAsDefault(false);
            setForm({ type: "IBAN", title: "", value: "", bankName: "" });
            setOpen(true);
          }}
        >
          افزودن مقصد
        </Button>
      </div>

      <ServerTableView<PaymentDestinationView>
        {...config}
        rowActions={(row) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(row);
                setAsDefault(Boolean(row.isDefault));
                setForm({
                  type: row.type,
                  title: row.title || "",
                  value: row.maskedValue,
                  bankName: row.bankName || "",
                });
                setOpen(true);
              }}
            >
              ویرایش
            </Button>
            <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(row.maskedValue ?? "")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
        renderCard={(row) => (
          <div className="space-y-2 rounded-2xl border bg-card p-4 text-sm shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{row.title || "-"}</p>
                <p>{row.maskedValue}</p>
                <p className="text-muted-foreground">{row.bankName || "-"}</p>
              </div>
              {row.isDefault ? <span className="text-xs">پیش‌فرض</span> : null}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(row);
                  setAsDefault(Boolean(row.isDefault));
                  setForm({ type: row.type, title: row.title || "", value: row.maskedValue, bankName: row.bankName || "" });
                  setOpen(true);
                }}
              >
                ویرایش
              </Button>
              <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(row.maskedValue ?? "")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      />

      <WizardSheet
        open={open}
        onOpenChange={setOpen}
        title={editing ? "ویرایش مقصد" : "ثبت مقصد"}
        steps={[{ key: "form", title: "اطلاعات مقصد" }]}
        activeIndex={0}
        completedKeys={[]}
        onSubmit={submit}
        isSubmitDisabled={!form.title || (!editing && !form.value)}
        submitLabel="ذخیره"
      >
        <FormSection title="اطلاعات مقصد">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm">نوع</label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as DestinationForm["type"], value: "" }))}
                disabled={Boolean(editing)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IBAN">شبا</SelectItem>
                  <SelectItem value="CARD">کارت</SelectItem>
                  <SelectItem value="ACCOUNT">حساب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">عنوان</label>
              <Input value={form.title || ""} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>

            <MaskedInput
              maskType={maskedInputType}
              label="شماره مقصد"
              value={form.value || ""}
              onChange={(value) => setForm((prev) => ({ ...prev, value }))}
              readOnly={Boolean(editing)}
              hint={editing ? "برای تغییر شماره مقصد، یک مقصد جدید بسازید." : undefined}
            />

            <div className="space-y-2">
              <label className="text-sm">نام بانک</label>
              <Input value={form.bankName || ""} onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={asDefault} onCheckedChange={setAsDefault} />
              <span className="text-sm">پیش‌فرض</span>
            </div>
          </div>
        </FormSection>
      </WizardSheet>
    </div>
  );
}
