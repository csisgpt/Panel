"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Stepper } from "@/components/kit/flow/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDeposit } from "@/lib/api/deposits";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@/lib/types/backend";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { key: "amount", title: "مبلغ" },
  { key: "method", title: "روش پرداخت" },
  { key: "review", title: "بازبینی" },
];

const methodOptions = [
  { value: PaymentMethod.CARD_TO_CARD, label: "کارت به کارت" },
  { value: PaymentMethod.PAYA, label: "پایا" },
  { value: PaymentMethod.SATNA, label: "ساتنا" },
  { value: PaymentMethod.TRANSFER, label: "انتقال" },
  { value: PaymentMethod.UNKNOWN, label: "نامشخص" },
];

export default function CreateDepositPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [note, setNote] = useState("");

  const completedKeys = useMemo(() => {
    const keys: string[] = [];
    if (amount) keys.push("amount");
    if (method) keys.push("method");
    return keys;
  }, [amount, method]);

  const handleSubmit = async () => {
    if (!user || !method) return;
    try {
      await createDeposit({ userId: user.id, amount, method, note: note || undefined });
      toast({ title: "واریز ثبت شد" });
      router.push("/trader/history?tab=deposits");
    } catch (error) {
      toast({ title: "خطا", description: "ثبت واریز ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} activeIndex={activeIndex} completedKeys={completedKeys} />

      {activeIndex === 0 ? (
        <div className="space-y-2">
          <label className="text-sm">مبلغ قابل واریز</label>
          <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="مثلا ۲۵۰۰۰۰۰۰" />
        </div>
      ) : null}

      {activeIndex === 1 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">روش پرداخت</label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب روش" />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">یادداشت (اختیاری)</label>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
        </div>
      ) : null}

      {activeIndex === 2 ? (
        <div className="space-y-2 rounded-lg border p-4 text-sm">
          <p>مبلغ: {amount}</p>
          <p>روش پرداخت: {methodOptions.find((item) => item.value === method)?.label}</p>
          <p>یادداشت: {note || "-"}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))} disabled={activeIndex === 0}>
          بازگشت
        </Button>
        {activeIndex === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!amount || !method}>
            ثبت واریز
          </Button>
        ) : (
          <Button onClick={() => setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1))} disabled={activeIndex === 0 ? !amount : !method}>
            بعدی
          </Button>
        )}
      </div>
    </div>
  );
}
