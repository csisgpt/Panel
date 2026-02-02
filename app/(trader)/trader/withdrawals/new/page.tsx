"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { WizardSheet } from "@/components/kit/flow/wizard-sheet";
import { Stepper } from "@/components/kit/flow/stepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { createWithdrawal } from "@/lib/api/withdrawals";
import { createUserDestination, listUserDestinations, makeUserDestinationDefault } from "@/lib/api/payment-destinations";
import type { DestinationForm, PaymentDestination } from "@/lib/contracts/p2p";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { key: "amount", title: "مبلغ و هدف" },
  { key: "destination", title: "انتخاب مقصد" },
  { key: "review", title: "بازبینی" },
];

const destinationSteps = [
  { key: "type", title: "نوع مقصد" },
  { key: "value", title: "اطلاعات" },
  { key: "confirm", title: "تایید" },
];

export default function CreateWithdrawalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("P2P");
  const [channel, setChannel] = useState("P2P");
  const [destinations, setDestinations] = useState<PaymentDestination[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [destinationOpen, setDestinationOpen] = useState(false);
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [destinationForm, setDestinationForm] = useState<DestinationForm>({ type: "IBAN", title: "", value: "", bankName: "" });
  const [destinationDefault, setDestinationDefault] = useState(false);

  useEffect(() => {
    setLoading(true);
    listUserDestinations()
      .then((items) => {
        setDestinations(items);
        const defaultItem = items.find((item) => item.isDefault);
        if (defaultItem) setSelectedId(defaultItem.id);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const completedKeys = useMemo(() => {
    const keys: string[] = [];
    if (amount && purpose) keys.push("amount");
    if (selectedId) keys.push("destination");
    return keys;
  }, [amount, purpose, selectedId]);

  const selectedDestination = destinations.find((item) => item.id === selectedId) ?? null;

  const handleSubmit = async () => {
    if (!user || !selectedDestination) return;
    try {
      await createWithdrawal({
        userId: user.id,
        amount,
        purpose,
        channel,
        bankName: selectedDestination.bankName,
        iban: selectedDestination.type === "IBAN" ? selectedDestination.iban ?? selectedDestination.maskedValue : undefined,
        cardNumber: selectedDestination.type === "CARD" ? selectedDestination.cardNumber ?? selectedDestination.maskedValue : undefined,
      });
      toast({ title: "برداشت ثبت شد" });
      router.push("/trader/history?tab=withdrawals");
    } catch (error) {
      toast({ title: "خطا", description: "ثبت برداشت ناموفق بود", variant: "destructive" });
    }
  };

  const handleCreateDestination = async () => {
    try {
      const created = await createUserDestination(destinationForm);
      if (destinationDefault) {
        await makeUserDestinationDefault(created.id);
      }
      setDestinations((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setDestinationOpen(false);
      setDestinationIndex(0);
      setDestinationForm({ type: "IBAN", title: "", value: "", bankName: "" });
      toast({ title: "مقصد ثبت شد" });
    } catch (error) {
      toast({ title: "خطا", description: "ثبت مقصد ناموفق بود", variant: "destructive" });
    }
  };

  if (loading) return <LoadingState lines={4} />;
  if (error) return <ErrorState description="خطا در دریافت مقاصد" onAction={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <Stepper steps={steps} activeIndex={activeIndex} completedKeys={completedKeys} />

      {activeIndex === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm">مبلغ برداشت</label>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="مثلا ۵۰۰۰۰۰۰۰" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">هدف</label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب هدف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P2P">P2P</SelectItem>
                <SelectItem value="GENERAL">عمومی</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">کانال</label>
            <Input value={channel} onChange={(event) => setChannel(event.target.value)} placeholder="مثلا P2P" />
          </div>
        </div>
      ) : null}

      {activeIndex === 1 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">انتخاب مقصد</h2>
            <Button variant="outline" size="sm" onClick={() => setDestinationOpen(true)}>
              افزودن مقصد
            </Button>
          </div>
          <div className="grid gap-3">
            {destinations.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer border p-4 ${selectedId === item.id ? "border-primary" : "border-border"}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{item.title ?? "بدون عنوان"}</p>
                  <p className="text-muted-foreground">{item.maskedValue ?? item.iban ?? item.cardNumber}</p>
                  <p className="text-muted-foreground">{item.bankName ?? "-"}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {activeIndex === 2 ? (
        <div className="space-y-4 rounded-lg border p-4 text-sm">
          <p>مبلغ: {amount}</p>
          <p>هدف: {purpose}</p>
          <p>کانال: {channel}</p>
          <p>مقصد: {selectedDestination?.title ?? "-"}</p>
          <p>شماره: {selectedDestination?.maskedValue ?? selectedDestination?.iban ?? selectedDestination?.cardNumber}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))} disabled={activeIndex === 0}>
          بازگشت
        </Button>
        {activeIndex === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!amount || !selectedId}>
            ثبت برداشت
          </Button>
        ) : (
          <Button onClick={() => setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1))} disabled={activeIndex === 0 ? !amount : !selectedId}>
            بعدی
          </Button>
        )}
      </div>

      <WizardSheet
        open={destinationOpen}
        onOpenChange={setDestinationOpen}
        title="ثبت مقصد جدید"
        description="مقصد جدید را وارد کنید."
        steps={destinationSteps}
        activeIndex={destinationIndex}
        completedKeys={[]}
        onBack={() => setDestinationIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() => setDestinationIndex((prev) => Math.min(prev + 1, destinationSteps.length - 1))}
        onSubmit={handleCreateDestination}
        isNextDisabled={destinationIndex === 0 ? !destinationForm.title : destinationIndex === 1 ? !destinationForm.value : false}
        isSubmitDisabled={!destinationForm.value}
      >
        {destinationIndex === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">نوع مقصد</label>
              <Select value={destinationForm.type} onValueChange={(value) => setDestinationForm((prev) => ({ ...prev, type: value as DestinationForm["type"] }))}>
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
              <Input value={destinationForm.title ?? ""} onChange={(event) => setDestinationForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
          </div>
        ) : null}
        {destinationIndex === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">شماره مقصد</label>
              <Input value={destinationForm.value ?? ""} onChange={(event) => setDestinationForm((prev) => ({ ...prev, value: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">نام بانک (اختیاری)</label>
              <Input value={destinationForm.bankName ?? ""} onChange={(event) => setDestinationForm((prev) => ({ ...prev, bankName: event.target.value }))} />
            </div>
          </div>
        ) : null}
        {destinationIndex === 2 ? (
          <div className="space-y-4">
            <div className="rounded-md border p-3 text-sm">
              <p>عنوان: {destinationForm.title}</p>
              <p>شماره: {destinationForm.value}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={destinationDefault} onChange={(event) => setDestinationDefault(event.target.checked)} />
              تعیین پیش‌فرض
            </label>
          </div>
        ) : null}
      </WizardSheet>
    </div>
  );
}
