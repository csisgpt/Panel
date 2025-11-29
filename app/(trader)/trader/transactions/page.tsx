"use client";

import { useEffect, useState } from "react";

import { TransactionTable } from "@/components/transactions/transaction-table";
import { DepositDetailsDialog } from "@/components/details/deposit-details-dialog";
import { WithdrawDetailsDialog } from "@/components/details/withdraw-details-dialog";
import { TradeDetailsDialog } from "@/components/details/trade-details-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDeposits } from "@/lib/api/deposits";
import { getWithdrawals } from "@/lib/api/withdrawals";
import {
  DepositRequest,
  DepositStatus,
  Trade,
  WithdrawRequest,
  WithdrawStatus,
} from "@/lib/types/backend";

const depositStatusMap: Record<DepositStatus, { label: string; variant: "warning" | "success" | "destructive" | "secondary" }> = {
  [DepositStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [DepositStatus.APPROVED]: { label: "تایید شده", variant: "success" },
  [DepositStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
  [DepositStatus.CANCELLED]: { label: "لغو شده", variant: "secondary" },
};

const withdrawStatusMap: Record<WithdrawStatus, { label: string; variant: "warning" | "success" | "destructive" | "secondary" }> = {
  [WithdrawStatus.PENDING]: { label: "در انتظار", variant: "warning" },
  [WithdrawStatus.APPROVED]: { label: "تایید شده", variant: "success" },
  [WithdrawStatus.REJECTED]: { label: "رد شده", variant: "destructive" },
  [WithdrawStatus.CANCELLED]: { label: "لغو شده", variant: "secondary" },
};

export default function TraderTransactionsPage() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawRequest | null>(null);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);

  useEffect(() => {
    getDeposits().then(setDeposits).catch(() => setDeposits([]));
    getWithdrawals().then(setWithdrawals).catch(() => setWithdrawals([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">تراکنش‌ها</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            لیست معاملات، واریزها و برداشت‌های این کاربر (ماک) نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">معاملات</h2>
        </div>
        <TransactionTable onSelectTrade={setSelectedTrade} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-base font-semibold">واریزها</h2>
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-right">مشتری</th>
                  <th className="p-2 text-right">مبلغ</th>
                  <th className="p-2 text-right">وضعیت</th>
                  <th className="p-2 text-right">تاریخ</th>
                  <th className="p-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((dep) => {
                  const status = depositStatusMap[dep.status];
                  return (
                    <tr key={dep.id} className="border-t text-right">
                      <td className="p-2">
                        <div className="font-semibold">{dep.user?.fullName ?? "--"}</div>
                        <div className="text-[11px] text-muted-foreground">{dep.user?.mobile}</div>
                      </td>
                      <td className="p-2">{Number(dep.amount).toLocaleString("fa-IR")} ریال</td>
                      <td className="p-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="p-2 text-[11px] text-muted-foreground">
                        {dep.createdAt ? new Date(dep.createdAt).toLocaleDateString("fa-IR") : "--"}
                      </td>
                      <td className="p-2 text-left">
                        <Button size="sm" variant="outline" onClick={() => setSelectedDeposit(dep)}>
                          جزئیات واریز
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!deposits.length && (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-xs text-muted-foreground">
                      واریزی ثبت نشده است
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold">برداشت‌ها</h2>
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 text-right">مشتری</th>
                  <th className="p-2 text-right">مبلغ</th>
                  <th className="p-2 text-right">وضعیت</th>
                  <th className="p-2 text-right">تاریخ</th>
                  <th className="p-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((wd) => {
                  const status = withdrawStatusMap[wd.status];
                  return (
                    <tr key={wd.id} className="border-t text-right">
                      <td className="p-2">
                        <div className="font-semibold">{wd.user?.fullName ?? "--"}</div>
                        <div className="text-[11px] text-muted-foreground">{wd.user?.mobile}</div>
                      </td>
                      <td className="p-2">{Number(wd.amount).toLocaleString("fa-IR")} ریال</td>
                      <td className="p-2"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="p-2 text-[11px] text-muted-foreground">
                        {wd.createdAt ? new Date(wd.createdAt).toLocaleDateString("fa-IR") : "--"}
                      </td>
                      <td className="p-2 text-left">
                        <Button size="sm" variant="outline" onClick={() => setSelectedWithdrawal(wd)}>
                          جزئیات برداشت
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!withdrawals.length && (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-xs text-muted-foreground">
                      برداشتی ثبت نشده است
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TradeDetailsDialog
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
      <DepositDetailsDialog
        deposit={selectedDeposit}
        open={!!selectedDeposit}
        onOpenChange={(open) => !open && setSelectedDeposit(null)}
      />
      <WithdrawDetailsDialog
        withdrawal={selectedWithdrawal}
        open={!!selectedWithdrawal}
        onOpenChange={(open) => !open && setSelectedWithdrawal(null)}
      />
    </div>
  );
}
