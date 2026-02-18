"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { assignToWithdrawal, listWithdrawalCandidates } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";

export default function AdminP2PWithdrawalsPage() {
  const config = useMemo(() => createAdminP2PWithdrawalsListConfig(), []);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<P2PWithdrawal | null>(null);
  const [amounts, setAmounts] = useState<Record<string, number | undefined>>({});

  const candidatesQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawals", selected?.id, "candidates"],
    enabled: open && Boolean(selected),
    queryFn: () => listWithdrawalCandidates(selected!.id, { page: 1, limit: 20 }),
  });

  const remaining = Number(selected?.remainingToAssign || 0);
  const totalAssigned = Object.values(amounts).reduce<number>((acc, value) => acc + (value ?? 0), 0);

  const submitAssign = async () => {
    if (!selected || totalAssigned <= 0 || totalAssigned > remaining || !selected.actions?.canAssign) return;
    await assignToWithdrawal(selected.id, {
      items: Object.entries(amounts)
        .filter(([, value]) => (value || 0) > 0)
        .map(([depositId, value]) => ({ depositId, amount: String(value) })),
    });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "withdrawals"] });
    setOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PWithdrawal>
        {...config}
        rowActions={(row) =>
          row.actions?.canAssign ? (
            <Button
              size="sm"
              onClick={() => {
                setSelected(row);
                setAmounts({});
                setOpen(true);
              }}
            >
              تخصیص برداشت
            </Button>
          ) : null
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>تخصیص برداشت</SheetTitle>
          </SheetHeader>

          <div className="rounded-2xl border p-4 text-sm">
            <p>مبلغ: {selected ? formatMoney(selected.amount) : "-"}</p>
            <p>باقی‌مانده: {selected ? formatMoney(selected.remainingToAssign) : "-"}</p>
            <p>مقصد: {selected?.destinationSummary ?? "-"}</p>
          </div>

          <div className="space-y-3">
            {(candidatesQuery.data?.items || []).map((candidate) => {
              const maxAvailable = Number(candidate.remainingAmount);
              return (
                <div key={candidate.id} className="rounded-xl border p-3">
                  <p className="text-sm">{candidate.id}</p>
                  <p className="text-xs text-muted-foreground">موجود: {formatMoney(candidate.remainingAmount)}</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <MoneyInput
                        value={amounts[candidate.id]}
                        onChange={(value) => setAmounts((prev) => ({ ...prev, [candidate.id]: value && value > maxAvailable ? maxAvailable : value }))}
                        min={0}
                        max={maxAvailable}
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAmounts((prev) => ({ ...prev, [candidate.id]: maxAvailable }))}>
                      حداکثر
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border p-3 text-sm">
            <p>جمع تخصیص: {formatMoney(totalAssigned)}</p>
            <p>باقی‌مانده: {formatMoney(Math.max(remaining - totalAssigned, 0))}</p>
          </div>

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                انصراف
              </Button>
              <Button
                disabled={totalAssigned <= 0 || totalAssigned > remaining || !selected?.actions?.canAssign}
                onClick={() => {
                  if (window.confirm("آیا از انجام این عملیات مطمئن هستید؟")) submitAssign();
                }}
              >
                ثبت
              </Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
