"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { DetailsDrawer } from "@/components/kit/table/details-drawer";
import { RowActionsMenu } from "@/components/kit/table/row-actions-menu";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";
import { assignToWithdrawal, listWithdrawalCandidates } from "@/lib/api/p2p";
import type { P2PWithdrawal } from "@/lib/contracts/p2p";
import type { CandidateRow } from "@/lib/adapters/p2p-vm-mappers";
import { formatMoney } from "@/lib/format/money";
import { useToast } from "@/hooks/use-toast";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components/ui/tabs";

export default function AdminP2PWithdrawalsPage() {
  const config = useMemo(() => createAdminP2PWithdrawalsListConfig(), []);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<P2PWithdrawal | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const candidatesQuery = useQuery({
    queryKey: ["admin", "p2p", "withdrawals", selectedWithdrawal?.id ?? "none", "candidates"],
    enabled: open && !!selectedWithdrawal,
    queryFn: () => listWithdrawalCandidates(selectedWithdrawal!.id, { page: 1, limit: 20 }),
  });

  const candidates = (candidatesQuery.data?.items ?? []) as CandidateRow[];

  const remaining = Number(selectedWithdrawal?.remainingToAssign ?? 0);
  const selectedItems = candidates.filter((item) => checked[item.id]);
  const totalAssigned = selectedItems.reduce<number>((sum, item) => sum + Number(amounts[item.id] ?? 0), 0);

  const errors = selectedItems.reduce<Record<string, string>>((acc, item) => {
    const amount = Number(amounts[item.id] ?? 0);
    if (amount <= 0) acc[item.id] = "مبلغ نامعتبر";
    if (amount > Number(item.remainingAmount)) acc[item.id] = "بیشتر از باقی‌مانده";
    return acc;
  }, {});

  const isInvalid = totalAssigned > remaining || selectedItems.length === 0 || Object.keys(errors).length > 0;

  const handleAssign = async () => {
    if (!selectedWithdrawal) return;
    try {
      await assignToWithdrawal(selectedWithdrawal.id, {
        items: selectedItems.map((item) => ({ depositId: item.id, amount: amounts[item.id] })),
      });
      toast({ title: "تخصیص ثبت شد" });
      queryClient.invalidateQueries({ queryKey: ["admin", "p2p", "withdrawals"] });
      setOpen(false);
      setSelectedWithdrawal(null);
      setAmounts({});
      setChecked({});
    } catch (error) {
      toast({ title: "خطا", description: "تخصیص ناموفق بود", variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="برداشت‌های P2P"
        subtitle="مدیریت صف برداشت‌ها، بررسی وضعیت و تخصیص دستی"
      />
      <ServerTableView<P2PWithdrawal>
        {...config}
        renderCard={(row) => (
          <div className="rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">مبلغ: {formatMoney(row.amount)}</p>
                <p className="text-xs text-muted-foreground">مقصد: {row.destinationSummary ?? "-"}</p>
                <p className="text-xs text-muted-foreground">موبایل: {row.userMobile ?? "-"}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => {
                setSelectedWithdrawal(row);
                setDetailsOpen(true);
              }}
            >
              مشاهده جزئیات
            </Button>
          </div>
        )}
        rowActions={(row) => (
          <RowActionsMenu
            actions={[
              {
                label: "مشاهده جزئیات",
                onClick: () => {
                  setSelectedWithdrawal(row);
                  setDetailsOpen(true);
                },
              },
              {
                label: "تخصیص دستی",
                onClick: () => {
                  setSelectedWithdrawal(row);
                  setOpen(true);
                },
              },
            ]}
          />
        )}
      />

      <DetailsDrawer
        open={detailsOpen}
        onOpenChange={(next) => {
          setDetailsOpen(next);
          if (!next) setSelectedWithdrawal(null);
        }}
        title="جزئیات برداشت"
      >
        {selectedWithdrawal ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">شناسه برداشت</p>
                  <p className="font-medium">{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">وضعیت</p>
                  <StatusBadge status={selectedWithdrawal.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">مبلغ</p>
                  <p className="font-medium">{formatMoney(selectedWithdrawal.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">باقی‌مانده تخصیص</p>
                  <p className="font-medium">{formatMoney(selectedWithdrawal.remainingToAssign)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">مقصد</p>
                  <p className="font-medium">{selectedWithdrawal.destinationSummary ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">موبایل</p>
                  <p className="font-medium">{selectedWithdrawal.userMobile ?? "-"}</p>
                </div>
              </div>
            </div>
            <TabsRoot defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">نمای کلی</TabsTrigger>
                <TabsTrigger value="attachments">پیوست‌ها</TabsTrigger>
                <TabsTrigger value="logs">لاگ‌ها</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm text-muted-foreground">
                خلاصه عملیات این برداشت به‌زودی تکمیل می‌شود.
              </TabsContent>
              <TabsContent value="attachments" className="text-sm text-muted-foreground">
                فایلی برای نمایش وجود ندارد.
              </TabsContent>
              <TabsContent value="logs" className="text-sm text-muted-foreground">
                لاگ‌های عملیات در این بخش نمایش داده خواهد شد.
              </TabsContent>
            </TabsRoot>
          </div>
        ) : null}
      </DetailsDrawer>

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSelectedWithdrawal(null);
            setAmounts({});
            setChecked({});
          }
        }}
      >
        <SheetContent side="right" size="lg" className="flex w-full flex-col gap-4" stickyHeader stickyFooter>
          <SheetHeader>
            <SheetTitle>تخصیص دستی</SheetTitle>
          </SheetHeader>

          {!selectedWithdrawal ? null : (
            <div className="rounded-lg border p-4 text-sm">
              <p>شناسه برداشت: {selectedWithdrawal.id}</p>
              <p>مبلغ: {formatMoney(selectedWithdrawal.amount)}</p>
              <p>باقی‌مانده تخصیص: {formatMoney(selectedWithdrawal.remainingToAssign)}</p>
              <p>وضعیت: <StatusBadge status={selectedWithdrawal.status} /></p>
            </div>
          )}

          {candidatesQuery.isLoading ? <LoadingState lines={3} /> : null}
          {candidatesQuery.error ? (
            <ErrorState description="خطا در دریافت کاندیدها" onAction={() => candidatesQuery.refetch()} />
          ) : null}

          {candidates.length ? (
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked[candidate.id] ?? false}
                        onChange={(event) =>
                          setChecked((prev) => ({ ...prev, [candidate.id]: event.target.checked }))
                        }
                      />
                      <span className="font-medium">{candidate.id}</span>
                    </label>
                    <span className="text-xs text-muted-foreground">باقی‌مانده: {formatMoney(candidate.remainingAmount)}</span>
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      disabled={!checked[candidate.id]}
                      placeholder="مبلغ تخصیص"
                      value={amounts[candidate.id] ?? ""}
                      onChange={(event) =>
                        setAmounts((prev) => ({ ...prev, [candidate.id]: event.target.value }))
                      }
                    />
                    {errors[candidate.id] ? (
                      <p className="mt-1 text-xs text-destructive">{errors[candidate.id]}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-md border p-3 text-sm">
            <p>مجموع تخصیص: {formatMoney(String(totalAssigned))}</p>
            <p>باقی‌مانده: {formatMoney(String(remaining))}</p>
            {totalAssigned > remaining ? (
              <p className="text-xs text-destructive">مجموع تخصیص از باقی‌مانده بیشتر است.</p>
            ) : null}
          </div>

          <SheetFooter className="mt-auto">
            <Button onClick={handleAssign} disabled={isInvalid}>
              ثبت تخصیص
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
