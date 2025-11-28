'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getMockCustomer,
  getMockAccountsByCustomer,
  getMockTransactions,
  Account,
  Customer,
  Transaction
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CustomerFormValues {
  name: string;
  phone: string;
  nationalId?: string;
  status: Customer["status"];
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [customerAccounts, setCustomerAccounts] = useState<Account[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState } = useForm<CustomerFormValues>();

  useEffect(() => {
    if (!id) return;
    getMockCustomer(id).then((data) => {
      setCustomer(data);
      if (data) {
        reset({ name: data.name, phone: data.phone, nationalId: data.nationalId, status: data.status });
      }
    });
    getMockAccountsByCustomer(id).then(setCustomerAccounts);
    getMockTransactions({ customerId: id }).then(setCustomerTransactions);
  }, [id, reset]);

  if (!customer) return <div>مشتری یافت نشد</div>;

  const handleUpdate = (values: CustomerFormValues) => {
    setCustomer((prev) => (prev ? { ...prev, ...values } : prev));
    toast({ title: "اطلاعات مشتری با موفقیت ویرایش شد" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border bg-gradient-to-l from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={customer.status === "ACTIVE" ? "success" : customer.status === "INACTIVE" ? "outline" : "destructive"}>
                {customer.status === "ACTIVE" ? "فعال" : customer.status === "INACTIVE" ? "غیرفعال" : "مسدود"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                ویرایش اطلاعات
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>کد ملی: {customer.nationalId}</span>
          <span>تاریخ ایجاد: {new Date(customer.createdAt).toLocaleDateString("fa-IR")}</span>
        </CardContent>
      </Card>
      <Tabs
        items={[
          {
            value: "accounts",
            label: "حساب‌ها",
            content: (
              <div className="grid gap-3 md:grid-cols-2">
                {customerAccounts.map((acc) => (
                  <Card key={acc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{acc.name}</p>
                        <p className="text-lg font-semibold">{acc.totalBalance.toLocaleString("fa-IR")} ریال</p>
                      </div>
                      <Badge variant={acc.status === "ACTIVE" ? "success" : acc.status === "BLOCKED" ? "warning" : "outline"}>
                        {acc.status === "ACTIVE" ? "فعال" : acc.status === "BLOCKED" ? "مسدود" : "غیرفعال"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )
          },
          {
            value: "transactions",
            label: "تراکنش‌ها",
            content: (
              <div className="overflow-x-auto rounded-2xl border bg-card p-4 shadow-sm">
                <TransactionTable data={customerTransactions} />
              </div>
            )
          }
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>ویرایش اطلاعات مشتری</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form className="space-y-3" onSubmit={handleSubmit(handleUpdate)}>
            <div className="space-y-2">
              <Label htmlFor="name">نام</Label>
              <Input id="name" {...register("name", { required: true })} />
              {formState.errors.name && <p className="text-xs text-destructive">نام الزامی است.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input id="phone" {...register("phone", { required: true, pattern: /^09\d{9}$/ })} />
              {formState.errors.phone && <p className="text-xs text-destructive">شماره موبایل معتبر وارد کنید.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی</Label>
              <Input id="nationalId" {...register("nationalId", { required: true })} />
              {formState.errors.nationalId && <p className="text-xs text-destructive">کد ملی الزامی است.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">وضعیت</Label>
              <Select id="status" {...register("status", { required: true })}>
                <option value="ACTIVE">فعال</option>
                <option value="INACTIVE">غیرفعال</option>
                <option value="BLOCKED">مسدود</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                ذخیره تغییرات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
