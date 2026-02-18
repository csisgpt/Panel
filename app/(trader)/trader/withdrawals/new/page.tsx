"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/money-input";
import { MaskedInput } from "@/components/ui/masked-input";
import { FormSection } from "@/components/kit/forms/form-section";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { createUserDestination, listUserDestinations, makeUserDestinationDefault } from "@/lib/api/payment-destinations";
import { createWithdrawal } from "@/lib/api/withdrawals";
import type { DestinationForm } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import type { PaymentDestinationView } from "@/lib/types/backend";

function normalizeDestinationValue(type: DestinationForm["type"], value: string) {
  if (type === "IBAN") return value.replace(/\s+/g, "").toUpperCase();
  return value.replace(/\s+/g, "");
}

function validateDestination(form: DestinationForm) {
  const errors: Record<string, string> = {};
  const value = normalizeDestinationValue(form.type, form.value ?? "");

  if (!form.type) errors.type = "نوع مقصد الزامی است.";
  if (!form.title || form.title.trim().length < 2) errors.title = "عنوان باید حداقل ۲ کاراکتر باشد.";
  if (!value) errors.value = "شماره مقصد الزامی است.";

  if (form.type === "CARD" && !/^\d{16,19}$/.test(value)) {
    errors.value = "شماره کارت باید بین ۱۶ تا ۱۹ رقم باشد.";
  }

  if (form.type === "IBAN") {
    if (!/^IR/i.test(value)) errors.value = "شماره شبا باید با IR شروع شود.";
    if (value.length !== 26) errors.value = "شماره شبا باید ۲۶ کاراکتر باشد.";
  }

  if (form.type === "ACCOUNT" && !/^\d{10,26}$/.test(value)) {
    errors.value = "شماره حساب باید بین ۱۰ تا ۲۶ رقم باشد.";
  }

  return errors;
}

export default function CreateWithdrawalPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>();
  const [note, setNote] = useState("");
  const [destinations, setDestinations] = useState<PaymentDestinationView[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState(0);
  const [markAsDefault, setMarkAsDefault] = useState(false);
  const [form, setForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });

  const formErrors = useMemo(() => validateDestination(form), [form]);

  useEffect(() => {
    listUserDestinations().then((items) => {
      setDestinations(items);
      setSelectedId(items.find((item) => item.isDefault)?.id ?? items[0]?.id ?? "");
    });
  }, []);

  const selected = destinations.find((d) => d.id === selectedId);

  const submitWithdrawal = async () => {
    if (!amount || !selectedId) return;
    await createWithdrawal({
      amount: String(amount),
      purpose: "P2P",
      payoutDestinationId: selectedId,
      note: note || undefined,
    });
    router.push("/trader/history?tab=withdrawals");
  };

  const submitDestination = async () => {
    const errors = validateDestination(form);
    if (Object.keys(errors).length) return;

    const payload: DestinationForm = {
      ...form,
      value: normalizeDestinationValue(form.type, form.value ?? ""),
    };

    const created = await createUserDestination(payload);
    if (markAsDefault) {
      await makeUserDestinationDefault(created.id);
      created.isDefault = true;
    }

    setDestinations((prev) => [created, ...prev.map((item) => ({ ...item, isDefault: markAsDefault ? false : item.isDefault }))]);
    setSelectedId(created.id);
    setSheetOpen(false);
  };

  const maskedInputType = form.type === "CARD" ? "card" : form.type === "IBAN" ? "iban" : "account";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <FormSection title="مبلغ برداشت">
        <MoneyInput
          value={amount}
          onChange={setAmount}
          error={amount !== undefined && amount <= 0 ? "مبلغ باید بزرگ‌تر از صفر باشد." : undefined}
        />
      </FormSection>

      <FormSection title="انتخاب مقصد" description="ابتدا مقصد پیش‌فرض نمایش داده می‌شود.">
        <div className="space-y-3">
          {destinations.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer rounded-2xl p-4 ${item.id === selectedId ? "border-primary" : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title || "-"}</p>
                  <p className="text-sm text-muted-foreground">{item.maskedValue}</p>
                  <p className="text-xs text-muted-foreground">{item.bankName || "-"}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigator.clipboard.writeText(item.maskedValue ?? "");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <Button type="button" variant="outline" className="mt-3" onClick={() => setSheetOpen(true)}>
          افزودن مقصد
        </Button>
      </FormSection>

      <FormSection title="بازبینی">
        <div className="space-y-2 text-sm">
          <p>مبلغ: {amount ? formatMoney(amount) : "-"}</p>
          <p>مقصد: {selected?.maskedValue ?? "-"}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm">توضیحات</label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
      </FormSection>

      <StickyFormFooter>
        <div className="flex justify-end">
          <Button onClick={submitWithdrawal} disabled={!amount || !selectedId}>
            ثبت برداشت
          </Button>
        </div>
      </StickyFormFooter>

      <WizardSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="ثبت مقصد جدید"
        description="اطلاعات مقصد را وارد و بازبینی کنید."
        steps={[
          { key: "form", title: "اطلاعات مقصد" },
          { key: "review", title: "بازبینی" },
        ]}
        activeIndex={sheetStep}
        completedKeys={sheetStep > 0 ? ["form"] : []}
        onBack={() => setSheetStep((prev) => Math.max(prev - 1, 0))}
        onNext={() => setSheetStep((prev) => Math.min(prev + 1, 1))}
        onSubmit={submitDestination}
        isNextDisabled={Object.keys(formErrors).length > 0}
        isSubmitDisabled={Object.keys(formErrors).length > 0}
        submitLabel="ذخیره"
      >
        {sheetStep === 0 ? (
          <FormSection title="اطلاعات مقصد">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm">نوع مقصد</label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as DestinationForm["type"], value: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARD">کارت</SelectItem>
                    <SelectItem value="IBAN">شبا</SelectItem>
                    <SelectItem value="ACCOUNT">حساب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">عنوان</label>
                <Input value={form.title ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
                {formErrors.title ? <p className="text-xs text-destructive">{formErrors.title}</p> : null}
              </div>
              <MaskedInput
                maskType={maskedInputType}
                label="شماره مقصد"
                value={form.value ?? ""}
                onChange={(value) => setForm((prev) => ({ ...prev, value }))}
                hint={form.type === "CARD" ? "شماره کارت ۱۶ تا ۱۹ رقمی" : undefined}
                error={formErrors.value}
              />
              <div className="space-y-2">
                <label className="text-sm">نام بانک</label>
                <Input
                  value={form.bankName ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={markAsDefault} onCheckedChange={setMarkAsDefault} />
                <span className="text-sm">به‌عنوان مقصد پیش‌فرض</span>
              </div>
            </div>
          </FormSection>
        ) : null}

        {sheetStep === 1 ? (
          <FormSection title="بازبینی مقصد جدید">
            <Card className="space-y-2 rounded-2xl p-4 text-sm">
              <p>نوع: {form.type}</p>
              <p>عنوان: {form.title || "-"}</p>
              <p>نام بانک: {form.bankName || "-"}</p>
              <p>شماره: {form.value || "-"}</p>
              <p>پیش‌فرض: {markAsDefault ? "بله" : "خیر"}</p>
            </Card>
          </FormSection>
        ) : null}
      </WizardSheet>
    </div>
  );
}
