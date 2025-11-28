'use client';

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getMockAccount,
  getMockCustomers,
  getMockTransactions,
  Account,
  Customer,
  Transaction,
  TransactionType
} from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormValues {
  amount: string;
  description?: string;
  type?: TransactionType;
}

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | undefined>();
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    getMockAccount(id).then((data) => {
      setAccount(data);
      if (data) {
        getMockCustomers().then((customers) => setCustomer(customers.find((c) => c.id === data.customerId)));
      }
    });
    getMockTransactions({ accountId: id }).then((txs) =>
      setAccountTransactions(txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }, [id]);

  const addTransaction = (transaction: Transaction) => {
    setAccountTransactions((prev) => [transaction, ...prev]);
  };

  const updateBalance = (amount: number, direction: "add" | "subtract") => {
    setAccount((prev) => {
      if (!prev) return prev;
      const diff = direction === "add" ? amount : -amount;
      const availableBalance = Math.max(0, prev.availableBalance + diff);
      const totalBalance = Math.max(0, prev.totalBalance + diff);
      return { ...prev, availableBalance, totalBalance };
    });
  };

  const handleSubmit = (mode: "deposit" | "withdraw" | "manual") => (values: TransactionFormValues) => {
    if (!account || !customer) return;
    const amountNumber = Number(values.amount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      toast({ title: "مبلغ معتبر نیست", variant: "destructive" });
      return;
    }

    const baseTx: Transaction = {
      id: `t-${Date.now()}`,
      accountId: account.id,
      customerId: account.customerId,
      type:
        mode === "deposit"
          ? "DEPOSIT"
          : mode === "withdraw"
            ? "WITHDRAW"
            : values.type ?? "DEPOSIT",
      amount: amountNumber,
      status: "SUCCESS",
      description: values.description,
      createdAt: new Date().toISOString()
    };

    addTransaction(baseTx);

    if (baseTx.type === "DEPOSIT" || baseTx.type === "SELL_GOLD") {
      updateBalance(amountNumber, "add");
    }
    if (baseTx.type === "WITHDRAW" || baseTx.type === "BUY_GOLD" || baseTx.type === "FEE") {
      updateBalance(amountNumber, "subtract");
    }

    toast({ title: "تراکنش با موفقیت ثبت شد (محیط نمایشی)" });
    if (mode === "deposit") setDepositOpen(false);
    if (mode === "withdraw") setWithdrawOpen(false);
    if (mode === "manual") setManualOpen(false);
  };

  const manualTypes: { value: TransactionType; label: string }[] = useMemo(
    () => [
      { value: "DEPOSIT", label: "واریز" },
      { value: "WITHDRAW", label: "برداشت" },
      { value: "BUY_GOLD", label: "خرید طلا" },
      { value: "SELL_GOLD", label: "فروش طلا" },
      { value: "FEE", label: "کارمزد" }
    ],
    []
  );

  if (!account) return <div>حساب یافت نشد</div>;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <p className="text-sm text-muted-foreground">مشتری: {customer?.name}</p>
            </div>
            <Badge variant={account.status === "ACTIVE" ? "success" : account.status === "BLOCKED" ? "warning" : "outline"}>
              {account.status === "ACTIVE" ? "فعال" : account.status === "BLOCKED" ? "مسدود" : "غیرفعال"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Stat label="مانده قابل برداشت" value={account.availableBalance} />
          <Stat label="مانده بلوکه‌شده" value={account.blockedBalance} />
          <Stat label="مانده کل" value={account.totalBalance} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setDepositOpen(true)}>واریز</Button>
        <Button variant="outline" onClick={() => setWithdrawOpen(true)}>
          برداشت
        </Button>
        <Button variant="secondary" onClick={() => setManualOpen(true)}>
          ثبت تراکنش دستی
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">تراکنش‌های حساب</h3>
        </div>
        <TransactionTable data={accountTransactions} />
      </div>

      <TransactionFormModal
        title="واریز به حساب"
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onSubmit={handleSubmit("deposit")}
      />
      <TransactionFormModal
        title="برداشت از حساب"
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onSubmit={handleSubmit("withdraw")}
      />
      <TransactionFormModal
        title="ثبت تراکنش دستی"
        open={manualOpen}
        onOpenChange={setManualOpen}
        onSubmit={handleSubmit("manual")}
        manualTypes={manualTypes}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 shadow-none">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value.toLocaleString("fa-IR")} ریال</p>
    </Card>
  );
}

interface TransactionFormModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => void;
  manualTypes?: { value: TransactionType; label: string }[];
}

function TransactionFormModal({ title, open, onOpenChange, onSubmit, manualTypes }: TransactionFormModalProps) {
  const form = useForm<TransactionFormValues>({ defaultValues: { amount: "", description: "", type: "DEPOSIT" } });

  const handleFormSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
    form.reset({ amount: "", description: "", type: values.type });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form className="space-y-3" onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              {...form.register("amount", { required: true })}
              placeholder="مثال: 5000000"
            />
            {form.formState.errors.amount && <p className="text-xs text-destructive">مبلغ الزامی است.</p>}
          </div>
          {manualTypes && (
            <div className="space-y-2">
              <Label htmlFor="type">نوع تراکنش</Label>
              <Select id="type" {...form.register("type", { required: true })}>
                {manualTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" rows={3} {...form.register("description")}
              placeholder="توضیح اختیاری در مورد تراکنش" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              ثبت
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
