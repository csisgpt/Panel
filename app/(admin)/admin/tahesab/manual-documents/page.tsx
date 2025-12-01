"use client";

import { FormEvent, SyntheticEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createTahesabBankDocument,
  createTahesabCashDocument,
  createTahesabCoinDocument,
  createTahesabDebtCreditDocument,
  createTahesabDiscountDocument,
  createTahesabFinishedDocument,
  createTahesabGoldDocument,
  createTahesabTagDocument,
} from "@/lib/api/tahesab";

export default function TahesabManualDocumentsPage() {
  const { toast } = useToast();
  const [goldForm, setGoldForm] = useState({
    customerCode: "",
    date: "",
    documentType: "",
    metal: "",
    ayar: "",
    weight: "",
    pricePerGram: "",
    description: "",
  });

  const [coinForm, setCoinForm] = useState({
    customerCode: "",
    date: "",
    operationType: "",
    coinType: "",
    quantity: "",
    unitPrice: "",
    description: "",
  });

  const [financialForm, setFinancialForm] = useState({
    customerCode: "",
    amount: "",
    date: "",
    description: "",
    bankAccount: "",
  });

  const [finishedForm, setFinishedForm] = useState({
    customerCode: "",
    workName: "",
    quantity: "",
    weight: "",
    date: "",
    description: "",
  });

  const [tagForm, setTagForm] = useState({
    customerCode: "",
    tagCode: "",
    movementType: "",
    date: "",
    description: "",
  });

  const handleGoldSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!goldForm.customerCode || !goldForm.documentType) {
      toast({ title: "فیلد الزامی", description: "کد مشتری و نوع سند ضروری است", variant: "destructive" });
      return;
    }
    try {
      await createTahesabGoldDocument({ ...goldForm, ayar: Number(goldForm.ayar) || undefined, weight: Number(goldForm.weight) || undefined, pricePerGram: Number(goldForm.pricePerGram) || undefined });
      toast({ title: "ثبت شد", description: "سند طلا ثبت شد" });
      setGoldForm({ customerCode: "", date: "", documentType: "", metal: "", ayar: "", weight: "", pricePerGram: "", description: "" });
    } catch (err) {
      toast({ title: "خطا", description: "ثبت سند ناموفق بود", variant: "destructive" });
    }
  };

  const handleCoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!coinForm.customerCode || !coinForm.operationType) {
      toast({ title: "فیلد الزامی", description: "کد مشتری و نوع عملیات را وارد کنید", variant: "destructive" });
      return;
    }
    try {
      await createTahesabCoinDocument({ ...coinForm, quantity: Number(coinForm.quantity) || undefined, unitPrice: Number(coinForm.unitPrice) || undefined });
      toast({ title: "ثبت شد", description: "سند سکه ثبت شد" });
      setCoinForm({ customerCode: "", date: "", operationType: "", coinType: "", quantity: "", unitPrice: "", description: "" });
    } catch (err) {
      toast({ title: "خطا", description: "ثبت سند ناموفق بود", variant: "destructive" });
    }
  };

  const handleFinancial = async (type: "cash" | "bank" | "discount" | "debtCredit", e: SyntheticEvent) => {
    e.preventDefault();
    if (!financialForm.customerCode || !financialForm.amount) {
      toast({ title: "مقدار ضروری", description: "کد مشتری و مبلغ الزامی است", variant: "destructive" });
      return;
    }
    try {
      const payload = { ...financialForm, amount: Number(financialForm.amount) };
      if (type === "cash") await createTahesabCashDocument(payload);
      if (type === "bank") await createTahesabBankDocument(payload);
      if (type === "discount") await createTahesabDiscountDocument(payload);
      if (type === "debtCredit") await createTahesabDebtCreditDocument(payload);
      toast({ title: "ثبت شد", description: "سند مالی ذخیره شد" });
      setFinancialForm({ customerCode: "", amount: "", date: "", description: "", bankAccount: "" });
    } catch (err) {
      toast({ title: "خطا", description: "عملیات ناموفق بود", variant: "destructive" });
    }
  };

  const handleFinishedSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!finishedForm.workName) {
      toast({ title: "فیلد الزامی", description: "نام کارساخته را وارد کنید", variant: "destructive" });
      return;
    }
    try {
      await createTahesabFinishedDocument({ ...finishedForm, quantity: Number(finishedForm.quantity) || undefined, weight: Number(finishedForm.weight) || undefined });
      toast({ title: "ثبت شد", description: "سند کارساخته ثبت شد" });
      setFinishedForm({ customerCode: "", workName: "", quantity: "", weight: "", date: "", description: "" });
    } catch (err) {
      toast({ title: "خطا", description: "ثبت سند ناموفق بود", variant: "destructive" });
    }
  };

  const handleTagSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tagForm.tagCode) {
      toast({ title: "کد اتیکت الزامی است", variant: "destructive" });
      return;
    }
    try {
      await createTahesabTagDocument(tagForm);
      toast({ title: "ثبت شد", description: "سند اتیکت ذخیره شد" });
      setTagForm({ customerCode: "", tagCode: "", movementType: "", date: "", description: "" });
    } catch (err) {
      toast({ title: "خطا", description: "عملیات ناموفق بود", variant: "destructive" });
    }
  };

  const tabItems = [
    {
      value: "gold",
      label: "طلا / متفرقه",
      content: (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>سند طلا / متفرقه</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleGoldSubmit}>
              <Input placeholder="کد مشتری" value={goldForm.customerCode} onChange={(e) => setGoldForm((p) => ({ ...p, customerCode: e.target.value }))} />
              <Input type="date" value={goldForm.date} onChange={(e) => setGoldForm((p) => ({ ...p, date: e.target.value }))} />
              <Input placeholder="نوع سند (IN/OUT/BUY/SELL)" value={goldForm.documentType} onChange={(e) => setGoldForm((p) => ({ ...p, documentType: e.target.value }))} />
              <Input placeholder="فلز" value={goldForm.metal} onChange={(e) => setGoldForm((p) => ({ ...p, metal: e.target.value }))} />
              <Input placeholder="عیار" value={goldForm.ayar} onChange={(e) => setGoldForm((p) => ({ ...p, ayar: e.target.value }))} />
              <Input placeholder="وزن" value={goldForm.weight} onChange={(e) => setGoldForm((p) => ({ ...p, weight: e.target.value }))} />
              <Input placeholder="قیمت هر گرم" value={goldForm.pricePerGram} onChange={(e) => setGoldForm((p) => ({ ...p, pricePerGram: e.target.value }))} />
              <Textarea
                className="md:col-span-2"
                placeholder="توضیحات"
                value={goldForm.description}
                onChange={(e) => setGoldForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">ثبت سند</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "coin",
      label: "سکه",
      content: (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>سند سکه</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCoinSubmit}>
              <Input placeholder="کد مشتری" value={coinForm.customerCode} onChange={(e) => setCoinForm((p) => ({ ...p, customerCode: e.target.value }))} />
              <Input type="date" value={coinForm.date} onChange={(e) => setCoinForm((p) => ({ ...p, date: e.target.value }))} />
              <Input placeholder="نوع عملیات (IN/OUT/BUY/SELL)" value={coinForm.operationType} onChange={(e) => setCoinForm((p) => ({ ...p, operationType: e.target.value }))} />
              <Input placeholder="نوع سکه" value={coinForm.coinType} onChange={(e) => setCoinForm((p) => ({ ...p, coinType: e.target.value }))} />
              <Input placeholder="تعداد" value={coinForm.quantity} onChange={(e) => setCoinForm((p) => ({ ...p, quantity: e.target.value }))} />
              <Input placeholder="قیمت واحد" value={coinForm.unitPrice} onChange={(e) => setCoinForm((p) => ({ ...p, unitPrice: e.target.value }))} />
              <Textarea
                className="md:col-span-2"
                placeholder="توضیحات"
                value={coinForm.description}
                onChange={(e) => setCoinForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">ثبت سند</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "financial",
      label: "مالی",
      content: (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>اسناد مالی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => handleFinancial("cash", e)}>
              <Input placeholder="کد مشتری" value={financialForm.customerCode} onChange={(e) => setFinancialForm((p) => ({ ...p, customerCode: e.target.value }))} />
              <Input type="number" placeholder="مبلغ" value={financialForm.amount} onChange={(e) => setFinancialForm((p) => ({ ...p, amount: e.target.value }))} />
              <Input type="date" value={financialForm.date} onChange={(e) => setFinancialForm((p) => ({ ...p, date: e.target.value }))} />
              <Textarea
                className="md:col-span-2"
                placeholder="توضیحات"
                value={financialForm.description}
                onChange={(e) => setFinancialForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button type="submit">ثبت نقدی</Button>
                <Button type="button" variant="outline" onClick={(e) => handleFinancial("bank", e)}>
                  ثبت بانکی
                </Button>
                <Button type="button" variant="outline" onClick={(e) => handleFinancial("discount", e)}>
                  تخفیف
                </Button>
                <Button type="button" variant="outline" onClick={(e) => handleFinancial("debtCredit", e)}>
                  بدهکار/بستانکار
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "finished",
      label: "کارساخته",
      content: (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>سند کارساخته</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleFinishedSubmit}>
              <Input placeholder="کد مشتری" value={finishedForm.customerCode} onChange={(e) => setFinishedForm((p) => ({ ...p, customerCode: e.target.value }))} />
              <Input placeholder="نام کار" value={finishedForm.workName} onChange={(e) => setFinishedForm((p) => ({ ...p, workName: e.target.value }))} />
              <Input placeholder="تعداد" value={finishedForm.quantity} onChange={(e) => setFinishedForm((p) => ({ ...p, quantity: e.target.value }))} />
              <Input placeholder="وزن" value={finishedForm.weight} onChange={(e) => setFinishedForm((p) => ({ ...p, weight: e.target.value }))} />
              <Input type="date" value={finishedForm.date} onChange={(e) => setFinishedForm((p) => ({ ...p, date: e.target.value }))} />
              <Textarea
                className="md:col-span-2"
                placeholder="توضیحات"
                value={finishedForm.description}
                onChange={(e) => setFinishedForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">ثبت سند</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "tags",
      label: "اتیکت",
      content: (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>سند اتیکت</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleTagSubmit}>
              <Input placeholder="کد مشتری" value={tagForm.customerCode} onChange={(e) => setTagForm((p) => ({ ...p, customerCode: e.target.value }))} />
              <Input placeholder="کد اتیکت" value={tagForm.tagCode} onChange={(e) => setTagForm((p) => ({ ...p, tagCode: e.target.value }))} />
              <Input placeholder="نوع حرکت (IN/OUT)" value={tagForm.movementType} onChange={(e) => setTagForm((p) => ({ ...p, movementType: e.target.value }))} />
              <Input type="date" value={tagForm.date} onChange={(e) => setTagForm((p) => ({ ...p, date: e.target.value }))} />
              <Textarea
                className="md:col-span-2"
                placeholder="توضیحات"
                value={tagForm.description}
                onChange={(e) => setTagForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">ثبت سند</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">سندهای دستی تاهساب</h1>
        <p className="text-sm text-muted-foreground">ثبت دستی انواع سند برای اتصال به تاهساب</p>
      </div>

      <Tabs defaultValue="gold" items={tabItems} />
    </div>
  );
}
