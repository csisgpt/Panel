"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { StickyFormFooter } from "@/components/kit/forms/sticky-form-footer";
import { ConfirmActionDialog } from "@/components/kit/dialogs/confirm-action-dialog";
import { AdminWithdrawalDetailsSheet } from "@/components/kit/p2p/admin-withdrawal-details-sheet";
import { P2PActionsMenu } from "@/components/kit/p2p/p2p-actions-menu";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { listAdminDestinations } from "@/lib/api/payment-destinations";
import { assignToWithdrawal, listWithdrawalCandidates } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";

export default function AdminP2PWithdrawalsPage() {
  const config = useMemo(() => createAdminP2PWithdrawalsListConfig(), []);
  const qc = useQueryClient();

  const [assignOpen, setAssignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<P2PWithdrawal | null>(null);
  const [amounts, setAmounts] = useState<Record<string, number | undefined>>({});
  const [assignMode, setAssignMode] = useState<"candidate" | "system">("candidate");
  const [systemDestinationId, setSystemDestinationId] = useState<string>("");

  const candidatesQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawals", selected?.id, "candidates"],
    enabled: assignOpen && Boolean(selected),
    queryFn: () => listWithdrawalCandidates(selected!.id, { page: 1, limit: 20 }),
  });

  const systemDestinationsQuery = useQuery({
    queryKey: ["admin", "destinations", "payout"],
    enabled: assignOpen,
    queryFn: () => listAdminDestinations("PAYOUT"),
  });

  const remaining = Number(selected?.remainingToAssign || 0);
  const totalAssigned = Object.values(amounts).reduce<number>((acc, value) => acc + (value ?? 0), 0);

  const submitAssign = async () => {
    if (!selected || assignMode !== "candidate" || totalAssigned <= 0 || totalAssigned > remaining || !selected.actions?.canAssign) return;
    await assignToWithdrawal(selected.id, {
      items: Object.entries(amounts)
        .filter(([, value]) => (value || 0) > 0)
        .map(([depositId, value]) => ({ depositId, amount: String(value) })),
    });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "withdrawals"] });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    setConfirmOpen(false);
    setAssignOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PWithdrawal>
        {...config}
        rowActions={(row) => (
          <P2PActionsMenu
            actions={[
              {
                key: "details",
                label: "جزئیات",
                onClick: () => {
                  setSelected(row);
                  setDetailsOpen(true);
                },
              },
              {
                key: "assign",
                label: "تخصیص",
                onClick: () => {
                  setSelected(row);
                  setAmounts({});
                  setAssignMode("candidate");
                  setAssignOpen(true);
                },
                disabled: !row.actions?.canAssign,
              },
              {
                key: "copy-id",
                label: "کپی شناسه برداشت",
                onClick: () => navigator.clipboard.writeText(row.id),
              },
              {
                key: "copy-destination",
                label: "کپی مقصد",
                onClick: () => navigator.clipboard.writeText(row.destinationSummary ?? ""),
                disabled: !row.destinationSummary,
              },
            ]}
          />
        )}
      />

      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>تخصیص برداشت</SheetTitle>
          </SheetHeader>

          <div className="rounded-2xl border p-4 text-sm">
            <p>مبلغ: {selected ? formatMoney(selected.amount) : "-"}</p>
            <p>باقی‌مانده: {selected ? formatMoney(selected.remainingToAssign) : "-"}</p>
            <p>مقصد: {selected?.destinationSummary ?? "-"}</p>
          </div>

          <Tabs value={assignMode} onValueChange={(v) => setAssignMode(v as "candidate" | "system")}>
            <TabsList>
              <TabsTrigger value="candidate">تخصیص به کاربر</TabsTrigger>
              <TabsTrigger value="system">تخصیص به مقصد سیستمی</TabsTrigger>
            </TabsList>

            <TabsContent value="candidate" className="space-y-3">
              {(candidatesQuery.data?.items || []).length ? (
                (candidatesQuery.data?.items || []).map((candidate) => {
                  const maxAvailable = Number(candidate.remainingAmount);
                  return (
                    <div key={candidate.id} className="rounded-xl border p-3">
                      <div className="mb-2 flex items-start justify-between text-sm">
                        <div>
                          <p className="font-medium">کاندید: {candidate.id}</p>
                          <p className="text-xs text-muted-foreground">موجود: {formatMoney(candidate.remainingAmount)}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">وضعیت: {candidate.status}</div>
                      </div>
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
                })
              ) : (
                <EmptyState
                  title="کاندیدی برای تخصیص یافت نشد"
                  description="ممکن است همه واریزی‌ها قبلاً تخصیص داده شده باشند یا شرایط تخصیص برقرار نباشد. فیلترها و مانده برداشت را بررسی کنید."
                />
              )}
            </TabsContent>

            <TabsContent value="system" className="space-y-3">
              {(systemDestinationsQuery.data || []).length ? (
                <div className="space-y-2">
                  {(systemDestinationsQuery.data || []).map((destination) => (
                    <button
                      key={destination.id}
                      type="button"
                      className={`w-full rounded-xl border p-3 text-right text-sm ${systemDestinationId === destination.id ? "border-primary" : ""}`}
                      onClick={() => setSystemDestinationId(destination.id)}
                    >
                      <p className="font-medium">{destination.title ?? destination.id}</p>
                      <p className="text-xs text-muted-foreground">{destination.maskedValue}</p>
                      <p className="text-xs text-muted-foreground">{destination.bankName ?? "-"}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState title="مقصد سیستمی یافت نشد" description="در حال حاضر مقصد سیستمی فعالی برای تخصیص موجود نیست." />
              )}
              <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                در حال حاضر تخصیص به مقصد سیستمی توسط بک‌اند پشتیبانی نمی‌شود.
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg border p-3 text-sm">
            <p>جمع تخصیص: {formatMoney(totalAssigned)}</p>
            <p>باقی‌مانده: {formatMoney(Math.max(remaining - totalAssigned, 0))}</p>
          </div>

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>انصراف</Button>
              <Button
                disabled={assignMode !== "candidate" || totalAssigned <= 0 || totalAssigned > remaining || !selected?.actions?.canAssign}
                onClick={() => setConfirmOpen(true)}
              >
                ثبت تخصیص
              </Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>

      <AdminWithdrawalDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        withdrawal={selected}
        onAssign={() => {
          setDetailsOpen(false);
          setAssignOpen(true);
        }}
        onViewAllocation={() => {}}
      />

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="تأیید عملیات"
        description="آیا از انجام این عملیات مطمئن هستید؟"
        onConfirm={submitAssign}
      />
    </div>
  );
}
