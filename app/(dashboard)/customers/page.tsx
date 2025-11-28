'use client';

import { useEffect, useMemo, useState } from "react";
import { Customer, Account, getMockAccounts, getMockCustomers } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غیرفعال",
  BLOCKED: "مسدود"
};

type StatusFilter = "all" | Customer["status"];

interface CustomerFormValues {
  name: string;
  phone: string;
  nationalId: string;
  status: Customer["status"];
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState } = useForm<CustomerFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      nationalId: "",
      status: "ACTIVE"
    }
  });

  useEffect(() => {
    getMockCustomers().then(setCustomerList);
    getMockAccounts().then(setAccountList);
  }, []);

  const filtered = useMemo(() => {
    return customerList.filter((c) => {
      const matchesQuery = c.name.includes(query) || c.phone.includes(query);
      const matchesStatus = status === "all" ? true : c.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [customerList, query, status]);

  const handleCreate = (values: CustomerFormValues) => {
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: values.name,
      phone: values.phone,
      nationalId: values.nationalId,
      status: values.status,
      createdAt: new Date().toISOString()
    };
    setCustomerList((prev) => [newCustomer, ...prev]);
    toast({ title: "مشتری با موفقیت ایجاد شد (محیط نمایشی)" });
    reset();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مشتریان</h1>
          <p className="text-sm text-muted-foreground">مدیریت و مشاهده مشتریان</p>
        </div>
        <Button onClick={() => setOpen(true)}>ایجاد مشتری جدید</Button>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            placeholder="جستجوی مشتری بر اساس نام یا شماره موبایل"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">همه</option>
            <option value="ACTIVE">فعال</option>
            <option value="INACTIVE">غیرفعال</option>
            <option value="BLOCKED">مسدود</option>
          </Select>
        </div>
      </Card>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>شماره موبایل</TableHead>
              <TableHead>کد ملی</TableHead>
              <TableHead>تعداد حساب‌ها</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ ایجاد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.nationalId}</TableCell>
                <TableCell>{accountList.filter((a) => a.customerId === c.id).length}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "INACTIVE" ? "outline" : "destructive"}>
                    {statusLabels[c.status]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString("fa-IR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>ایجاد مشتری جدید</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form className="space-y-3" onSubmit={handleSubmit(handleCreate)}>
            <div className="space-y-2">
              <Label htmlFor="name">نام</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="مثال: رضا محمدی" />
              {formState.errors.name && <p className="text-xs text-destructive">نام الزامی است.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                id="phone"
                {...register("phone", { required: true, pattern: /^09\d{9}$/ })}
                placeholder="09xxxxxxxxx"
              />
              {formState.errors.phone && <p className="text-xs text-destructive">شماره موبایل معتبر وارد کنید.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی</Label>
              <Input id="nationalId" {...register("nationalId", { required: true })} placeholder="0012345678" />
              {formState.errors.nationalId && <p className="text-xs text-destructive">کد ملی الزامی است.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">وضعیت</Label>
              <Select id="status" {...register("status", { required: true })} defaultValue="ACTIVE">
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
                ایجاد مشتری
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
