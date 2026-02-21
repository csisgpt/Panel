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
import { AdminAllocationDetailsSheet } from "@/components/kit/p2p/admin-allocation-details-sheet";
import { AdminWithdrawalDetailsSheet } from "@/components/kit/p2p/admin-withdrawal-details-sheet";
import { P2PActionsMenu } from "@/components/kit/p2p/p2p-actions-menu";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { assignToWithdrawal, listAdminP2PSystemDestinations, listWithdrawalCandidates } from "@/lib/api/p2p";
import type { P2PAllocation, P2PWithdrawal } from "@/lib/contracts/p2p";
import { formatMoney } from "@/lib/format/money";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";
import { destinationValue, copyText } from "@/lib/utils/clipboard";

export default function AdminP2PWithdrawalsPage() {
  const config = useMemo(() => createAdminP2PWithdrawalsListConfig(), []);
  const qc = useQueryClient();

  const [assignOpen, setAssignOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allocationDetailsOpen, setAllocationDetailsOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);
  const [selected, setSelected] = useState<P2PWithdrawal | null>(null);
  const [amounts, setAmounts] = useState<Record<string, number | undefined>>({});
  const [assignMode, setAssignMode] = useState<"candidate" | "system">("candidate");
  const [systemDestinationId, setSystemDestinationId] = useState<string>("");
  const [systemAmount, setSystemAmount] = useState<number | undefined>(undefined);

  const candidatesQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawals", selected?.id, "candidates"],
    enabled: assignOpen && Boolean(selected) && assignMode === "candidate",
    queryFn: () => listWithdrawalCandidates(selected!.id, { page: 1, limit: 30 }),
  });

  const systemDestinationsQuery = useQuery({
    queryKey: ["admin", "p2p", "system-destinations"],
    enabled: assignOpen && assignMode === "system",
    queryFn: listAdminP2PSystemDestinations,
  });

  const remaining = Number(selected?.totals?.remainingToAssign ?? selected?.remainingToAssign ?? 0);
  const candidateTotalAssigned = Object.values(amounts).reduce<number>((acc, value) => acc + (value ?? 0), 0);
  const selectedCandidates = (candidatesQuery.data?.items ?? []).filter((candidate) => Number(amounts[candidate.id] ?? 0) > 0);

  const canSubmitCandidate = assignMode === "candidate"
    && selectedCandidates.length > 0
    && candidateTotalAssigned > 0
    && candidateTotalAssigned <= remaining
    && selectedCandidates.every((c) => (amounts[c.id] ?? 0) <= Number(c.remainingAmount))
    && Boolean(selected?.actions?.canAssign);

  const canSubmitSystem = assignMode === "system"
    && Boolean(systemDestinationId)
    && Boolean(systemAmount && systemAmount > 0)
    && Number(systemAmount) <= remaining
    && Boolean(selected?.actions?.canAssign);

  const submitAssign = async () => {
    if (!selected || !selected.actions?.canAssign) return;

    if (assignMode === "candidate") {
      if (!canSubmitCandidate) return;
      await assignToWithdrawal(selected.id, {
        mode: "CANDIDATES",
        items: Object.entries(amounts)
          .filter(([, value]) => (value || 0) > 0)
          .map(([depositId, value]) => ({ depositId, amount: Number(value || 0) })),
      });
    } else {
      if (!canSubmitSystem || !systemAmount) return;
      await assignToWithdrawal(selected.id, {
        mode: "SYSTEM_DESTINATION",
        destinationId: systemDestinationId,
        items: [{ amount: Number(systemAmount) }],
      });
    }

    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "withdrawals"] });
    await qc.invalidateQueries({ queryKey: ["admin", "p2p", "allocations"] });
    if (selected.id) await qc.invalidateQueries({ queryKey: ["admin", "p2p", "withdrawal", selected.id] });
    setConfirmOpen(false);
    setAssignOpen(false);
  };

  const selectedAllocation: P2PAllocation | null = selectedAllocationId
    ? ({ id: selectedAllocationId, createdAt: "", status: "ASSIGNED", amount: "0" } as P2PAllocation)
    : null;

  return (
    <div className="space-y-4 pb-24">
      <ServerTableView<P2PWithdrawal>
        {...config}
        rowActions={(row) => (
          <P2PActionsMenu
            actions={[
              { key: "details", label: "جزئیات", onClick: () => { setSelected(row); setDetailsOpen(true); } },
              {
                key: "assign",
                label: "تخصیص",
                onClick: () => { setSelected(row); setAmounts({}); setAssignMode("candidate"); setSystemDestinationId(""); setSystemAmount(undefined); setAssignOpen(true); },
                disabled: !row.actions?.canAssign,
                disabledReason: row.allowedActions?.find((a) => a.key === "ASSIGN")?.reasonDisabled,
              },
              {
                key: "view-allocations",
                label: "مشاهده تخصیص‌ها",
                onClick: () => { setSelected(row); setDetailsOpen(true); },
                disabled: !row.actions?.canViewAllocations,
              },
              {
                key: "cancel",
                label: "لغو",
                destructive: true,
                onClick: () => undefined,
                disabled: !row.actions?.canCancel,
                disabledReason: row.allowedActions?.find((a) => a.key === "CANCEL")?.reasonDisabled ?? "در این وضعیت امکان لغو نیست",
              },
              { key: "copy-id", label: "کپی شناسه برداشت", onClick: () => copyText(row.id) },
            ]}
          />
        )}
      />

      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>تخصیص برداشت</SheetTitle>
          </SheetHeader>

          <div className="rounded-2xl border p-4 text-sm space-y-1">
            <p>مبلغ: {selected ? formatMoney(selected.amount) : "-"}</p>
            <p>باقی‌مانده: {selected ? formatMoney(selected.totals?.remainingToAssign ?? selected.remainingToAssign) : "-"}</p>
            <p>مقصد: {destinationValue(selected?.destination) || selected?.destinationSummary || "-"}</p>
          </div>

          <Tabs value={assignMode} onValueChange={(v) => setAssignMode(v as "candidate" | "system")}>
            <TabsList>
              <TabsTrigger value="candidate">کاربر به کاربر</TabsTrigger>
              <TabsTrigger value="system">پرداخت به مقصد سیستمی</TabsTrigger>
            </TabsList>

            <TabsContent value="candidate" className="space-y-3">
              {(candidatesQuery.data?.items || []).length ? (
                (candidatesQuery.data?.items || []).map((candidate) => {
                  const maxAvailable = Number(candidate.remainingAmount);
                  const autoFill = Math.min(remaining, maxAvailable);
                  return (
                    <div key={candidate.id} className="rounded-xl border p-3 space-y-2">
                      <div className="flex items-start justify-between text-sm">
                        <div>
                          <p className="font-medium">{candidate.payer?.displayName ?? "-"}</p>
                          <p className="text-xs">{candidate.payer?.mobile ?? "-"}</p>
                          <p className="text-xs text-muted-foreground">باقی‌مانده کاندید: {formatMoney(candidate.remainingAmount)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{candidate.status}</p>
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
                        <Button size="sm" variant="outline" onClick={() => setAmounts((prev) => ({ ...prev, [candidate.id]: autoFill }))}>پُرکردن خودکار</Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="کاندیدی برای تخصیص یافت نشد" description="ممکن است همه واریزی‌ها قبلاً تخصیص داده شده باشند." />
              )}

              {selectedCandidates.length ? (
                <div className="rounded-xl border p-3 text-sm space-y-1">
                  <p className="font-medium">آیتم‌های انتخاب‌شده</p>
                  {selectedCandidates.map((candidate) => <p key={candidate.id}>{candidate.payer?.displayName ?? candidate.id}: {formatMoney(amounts[candidate.id] ?? 0)}</p>)}
                </div>
              ) : null}
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
                      <p className="text-xs text-muted-foreground">{destination.bankName ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{destination.ownerName ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{destination.fullValue ?? destination.maskedValue}</p>
                      <p className="text-xs text-muted-foreground">{destination.type} | {destination.isActive ? "فعال" : "غیرفعال"}</p>
                    </button>
                  ))}
                </div>
              ) : <EmptyState title="مقصد سیستمی یافت نشد" description="در حال حاضر مقصد سیستمی فعالی برای تخصیص موجود نیست." />}

              <div className="rounded-xl border p-3">
                <p className="mb-2 text-sm">مبلغ تخصیص به مقصد سیستمی</p>
                <MoneyInput value={systemAmount} onChange={setSystemAmount} min={0} max={remaining} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-lg border p-3 text-sm space-y-1">
            <p>جمع تخصیص: {formatMoney(assignMode === "candidate" ? candidateTotalAssigned : Number(systemAmount || 0))}</p>
            <p>باقی‌مانده: {formatMoney(Math.max(remaining - (assignMode === "candidate" ? candidateTotalAssigned : Number(systemAmount || 0)), 0))}</p>
            {candidateTotalAssigned > remaining ? <p className="text-destructive text-xs">جمع تخصیص از باقی‌مانده برداشت بیشتر است.</p> : null}
          </div>

          <StickyFormFooter className="-mx-6">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignOpen(false)}>انصراف</Button>
              <Button disabled={assignMode === "candidate" ? !canSubmitCandidate : !canSubmitSystem} onClick={() => setConfirmOpen(true)}>ثبت تخصیص</Button>
            </div>
          </StickyFormFooter>
        </SheetContent>
      </Sheet>

      <AdminWithdrawalDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        withdrawal={selected}
        onAssign={() => { setDetailsOpen(false); setAssignOpen(true); }}
        onViewAllocation={(id) => { setSelectedAllocationId(id); setAllocationDetailsOpen(true); }}
      />

      <AdminAllocationDetailsSheet open={allocationDetailsOpen} onOpenChange={setAllocationDetailsOpen} allocation={selectedAllocation} />

      <ConfirmActionDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="تأیید عملیات" description="آیا از انجام این عملیات مطمئن هستید؟" onConfirm={submitAssign} />
    </div>
  );
}
