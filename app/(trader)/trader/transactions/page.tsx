import { TransactionTable } from "@/components/transactions/transaction-table";

export default function TraderTransactionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">تراکنش‌ها</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            لیست معاملات ثبت‌شده برای این کاربر از طریق لایه API (در حال حاضر
            mock) بارگذاری می‌شود.
          </p>
        </div>
      </div>

      <TransactionTable />
    </div>
  );
}
