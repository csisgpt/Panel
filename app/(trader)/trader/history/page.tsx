"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { DetailsDrawer } from "@/components/kit/table/details-drawer";
import { RowActionsMenu } from "@/components/kit/table/row-actions-menu";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { formatMoney } from "@/lib/format/money";
import { getMyDeposits } from "@/lib/api/deposits";
import { getMyWithdrawals } from "@/lib/api/withdrawals";
import { listMyAllocationsAsPayer, listMyAllocationsAsReceiver } from "@/lib/api/p2p";
import type { DepositRequest, WithdrawRequest } from "@/lib/types/backend";
import type { P2PAllocation } from "@/lib/contracts/p2p";
import { adaptListResponse } from "@/lib/adapters/list-response-adapter";
import type { ListParams } from "@/lib/querykit/schemas";
import { serializeListParams } from "@/lib/querykit/serialize";
import { useTabState } from "@/components/kit/table/use-tab-state";

export default function TraderHistoryPage() {
  const { tab, setTab } = useTabState({ defaultTab: "withdrawals", storageKey: "trader.history.tab" });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPayload, setDetailsPayload] = useState<
    | { type: "withdrawal"; data: WithdrawRequest }
    | { type: "deposit"; data: DepositRequest }
    | { type: "allocation"; data: P2PAllocation }
    | null
  >(null);

  const withdrawalColumns: ColumnDef<WithdrawRequest>[] = [
    { id: "createdAt", header: "تاریخ", cell: ({ row }: { row: { original: WithdrawRequest } }) => row.original.createdAt },
    { id: "amount", header: "مبلغ", cell: ({ row }: { row: { original: WithdrawRequest } }) => formatMoney(row.original.amount) },
    { id: "status", header: "وضعیت", cell: ({ row }: { row: { original: WithdrawRequest } }) => <StatusBadge status={row.original.status} /> },
    { id: "destination", header: "مقصد", cell: ({ row }: { row: { original: WithdrawRequest } }) => row.original.iban ?? row.original.cardNumber ?? "-" },
  ];

  const depositColumns: ColumnDef<DepositRequest>[] = [
    { id: "createdAt", header: "تاریخ", cell: ({ row }: { row: { original: DepositRequest } }) => row.original.createdAt },
    { id: "amount", header: "مبلغ", cell: ({ row }: { row: { original: DepositRequest } }) => formatMoney(row.original.amount) },
    { id: "status", header: "وضعیت", cell: ({ row }: { row: { original: DepositRequest } }) => <StatusBadge status={row.original.status} /> },
    { id: "method", header: "روش", cell: ({ row }: { row: { original: DepositRequest } }) => row.original.method },
  ];

  const allocationColumns: ColumnDef<P2PAllocation>[] = [
    { id: "createdAt", header: "تاریخ", cell: ({ row }: { row: { original: P2PAllocation } }) => row.original.createdAt },
    { id: "amount", header: "مبلغ", cell: ({ row }: { row: { original: P2PAllocation } }) => formatMoney(row.original.amount) },
    { id: "status", header: "وضعیت", cell: ({ row }: { row: { original: P2PAllocation } }) => <StatusBadge status={row.original.status} /> },
  ];

  const applyCommonFilters = <T extends { status?: string; amount?: string | number; createdAt?: string }>(
    items: T[],
    params: ListParams
  ) => {
    const status = (params.filters as Record<string, string> | undefined)?.status;
    const amountMin = Number((params.filters as Record<string, string> | undefined)?.amountMin ?? "");
    const amountMax = Number((params.filters as Record<string, string> | undefined)?.amountMax ?? "");
    const search = params.search?.trim().toLowerCase();
    return items.filter((item) => {
      if (status && item.status !== status) return false;
      const amount = Number(item.amount ?? 0);
      if (!Number.isNaN(amountMin) && amountMin && amount < amountMin) return false;
      if (!Number.isNaN(amountMax) && amountMax && amount > amountMax) return false;
      if (search) {
        const haystack = [item.createdAt, item.status, String(item.amount ?? "")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  };

  const depositQuery = async (params: ListParams) => {
    const items = await getMyDeposits();
    const filtered = applyCommonFilters(items, params);
    const start = (params.page - 1) * params.limit;
    const paginated = filtered.slice(start, start + params.limit);
    return adaptListResponse<DepositRequest>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: filtered.length },
    });
  };

  const withdrawalQuery = async (params: ListParams) => {
    const items = await getMyWithdrawals();
    const filtered = applyCommonFilters(items, params);
    const start = (params.page - 1) * params.limit;
    const paginated = filtered.slice(start, start + params.limit);
    return adaptListResponse<WithdrawRequest>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: filtered.length },
    });
  };

  const allocationQuery = async (params: ListParams) => {
    const [payer, receiver] = await Promise.all([
      listMyAllocationsAsPayer(params),
      listMyAllocationsAsReceiver(params),
    ]);
    const merged = applyCommonFilters([...payer.items, ...receiver.items], params);
    const start = (params.page - 1) * params.limit;
    const paginated = merged.slice(start, start + params.limit);
    return adaptListResponse<P2PAllocation>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: merged.length },
    });
  };

  return (
    <PageShell>
      <PageHeader
        title="تاریخچه درخواست‌ها"
        subtitle="مرور برداشت‌ها، واریزها و تخصیص‌های اخیر"
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="withdrawals">برداشت‌ها</TabsTrigger>
          <TabsTrigger value="deposits">واریزها</TabsTrigger>
          <TabsTrigger value="allocations">تخصیص‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <ServerTableView<WithdrawRequest>
            storageKey="trader.history.withdrawals"
            title="برداشت‌های من"
            columns={withdrawalColumns}
            queryKeyFactory={(params) => ["trader", "history", "withdrawals", serializeListParams(params)]}
            queryFn={withdrawalQuery}
            defaultParams={{ page: 1, limit: 10 }}
            enableAdvancedFilters
            enableDensityToggle
            filtersConfig={[
              {
                type: "status",
                key: "status",
                label: "وضعیت",
                options: [
                  { label: "در انتظار", value: "PENDING" },
                  { label: "در انتظار تخصیص مقصد", value: "WAITING_ASSIGNMENT" },
                  { label: "تایید شده", value: "APPROVED" },
                  { label: "رد شده", value: "REJECTED" },
                ],
              },
              { type: "amountRange", key: "amountMin", label: "حداقل مبلغ" },
              { type: "amountRange", key: "amountMax", label: "حداکثر مبلغ" },
            ]}
            rowActions={(row) => (
              <RowActionsMenu
                actions={[
                  {
                    label: "مشاهده جزئیات",
                    onClick: () => {
                      setDetailsPayload({ type: "withdrawal", data: row });
                      setDetailsOpen(true);
                    },
                  },
                ]}
              />
            )}
            renderCard={(row) => (
              <div className="rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مبلغ: {formatMoney(row.amount)}</p>
                    <p className="text-xs text-muted-foreground">مقصد: {row.iban ?? row.cardNumber ?? "-"}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{row.createdAt}</p>
              </div>
            )}
            emptyState={{ title: "برداشتی ثبت نشده است" }}
          />
        </TabsContent>

        <TabsContent value="deposits">
          <ServerTableView<DepositRequest>
            storageKey="trader.history.deposits"
            title="واریزهای من"
            columns={depositColumns}
            queryKeyFactory={(params) => ["trader", "history", "deposits", serializeListParams(params)]}
            queryFn={depositQuery}
            defaultParams={{ page: 1, limit: 10 }}
            enableAdvancedFilters
            enableDensityToggle
            filtersConfig={[
              {
                type: "status",
                key: "status",
                label: "وضعیت",
                options: [
                  { label: "در انتظار", value: "PENDING" },
                  { label: "در انتظار تخصیص مقصد", value: "WAITING_ASSIGNMENT" },
                  { label: "تایید شده", value: "APPROVED" },
                  { label: "رد شده", value: "REJECTED" },
                ],
              },
              { type: "amountRange", key: "amountMin", label: "حداقل مبلغ" },
              { type: "amountRange", key: "amountMax", label: "حداکثر مبلغ" },
            ]}
            rowActions={(row) => (
              <RowActionsMenu
                actions={[
                  {
                    label: "مشاهده جزئیات",
                    onClick: () => {
                      setDetailsPayload({ type: "deposit", data: row });
                      setDetailsOpen(true);
                    },
                  },
                ]}
              />
            )}
            renderCard={(row) => (
              <div className="rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مبلغ: {formatMoney(row.amount)}</p>
                    <p className="text-xs text-muted-foreground">روش: {row.method}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{row.createdAt}</p>
              </div>
            )}
            emptyState={{ title: "واریزی ثبت نشده است" }}
          />
        </TabsContent>

        <TabsContent value="allocations">
          <ServerTableView<P2PAllocation>
            storageKey="trader.history.allocations"
            title="تخصیص‌های من"
            columns={allocationColumns}
            queryKeyFactory={(params) => ["trader", "history", "allocations", serializeListParams(params)]}
            queryFn={allocationQuery}
            defaultParams={{ page: 1, limit: 10 }}
            enableAdvancedFilters
            enableDensityToggle
            filtersConfig={[
              {
                type: "status",
                key: "status",
                label: "وضعیت",
                options: [
                  { label: "در انتظار", value: "PENDING" },
                  { label: "در انتظار تخصیص مقصد", value: "WAITING_ASSIGNMENT" },
                  { label: "تایید شده", value: "APPROVED" },
                  { label: "رد شده", value: "REJECTED" },
                ],
              },
              { type: "amountRange", key: "amountMin", label: "حداقل مبلغ" },
              { type: "amountRange", key: "amountMax", label: "حداکثر مبلغ" },
            ]}
            rowActions={(row) => (
              <RowActionsMenu
                actions={[
                  {
                    label: "مشاهده جزئیات",
                    onClick: () => {
                      setDetailsPayload({ type: "allocation", data: row });
                      setDetailsOpen(true);
                    },
                  },
                ]}
              />
            )}
            renderCard={(row) => (
              <div className="rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مبلغ: {formatMoney(row.amount)}</p>
                    <p className="text-xs text-muted-foreground">پرداخت‌کننده: {row.payerName ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">گیرنده: {row.receiverName ?? "-"}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{row.createdAt}</p>
              </div>
            )}
            emptyState={{ title: "تخصیصی ثبت نشده است" }}
          />
        </TabsContent>
      </Tabs>
      <DetailsDrawer
        open={detailsOpen}
        onOpenChange={(next) => {
          setDetailsOpen(next);
          if (!next) setDetailsPayload(null);
        }}
        title="جزئیات رکورد"
      >
        {detailsPayload ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4 text-sm">
              {detailsPayload.type === "withdrawal" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">مبلغ</p>
                    <p className="font-medium">{formatMoney(detailsPayload.data.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">وضعیت</p>
                    <StatusBadge status={detailsPayload.data.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">مقصد</p>
                    <p className="font-medium">{detailsPayload.data.iban ?? detailsPayload.data.cardNumber ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">تاریخ</p>
                    <p className="font-medium">{detailsPayload.data.createdAt}</p>
                  </div>
                </div>
              ) : null}
              {detailsPayload.type === "deposit" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">مبلغ</p>
                    <p className="font-medium">{formatMoney(detailsPayload.data.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">وضعیت</p>
                    <StatusBadge status={detailsPayload.data.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">روش</p>
                    <p className="font-medium">{detailsPayload.data.method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">تاریخ</p>
                    <p className="font-medium">{detailsPayload.data.createdAt}</p>
                  </div>
                </div>
              ) : null}
              {detailsPayload.type === "allocation" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">مبلغ</p>
                    <p className="font-medium">{formatMoney(detailsPayload.data.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">وضعیت</p>
                    <StatusBadge status={detailsPayload.data.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">پرداخت‌کننده</p>
                    <p className="font-medium">{detailsPayload.data.payerName ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">گیرنده</p>
                    <p className="font-medium">{detailsPayload.data.receiverName ?? "-"}</p>
                  </div>
                </div>
              ) : null}
            </div>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">نمای کلی</TabsTrigger>
                <TabsTrigger value="attachments">پیوست‌ها</TabsTrigger>
                <TabsTrigger value="logs">لاگ‌ها</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm text-muted-foreground">
                جزئیات این رکورد در حال تکمیل است.
              </TabsContent>
              <TabsContent value="attachments" className="text-sm text-muted-foreground">
                پیوستی برای نمایش وجود ندارد.
              </TabsContent>
              <TabsContent value="logs" className="text-sm text-muted-foreground">
                لاگ‌های تغییرات در این بخش نمایش داده می‌شود.
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DetailsDrawer>
    </PageShell>
  );
}
