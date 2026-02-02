"use client";

import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "@/components/ui/tabs";
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

export default function TraderHistoryPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "withdrawals";

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

  const depositQuery = async (params: ListParams) => {
    const items = await getMyDeposits();
    const start = (params.page - 1) * params.limit;
    const paginated = items.slice(start, start + params.limit);
    return adaptListResponse<DepositRequest>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: items.length },
    });
  };

  const withdrawalQuery = async (params: ListParams) => {
    const items = await getMyWithdrawals();
    const start = (params.page - 1) * params.limit;
    const paginated = items.slice(start, start + params.limit);
    return adaptListResponse<WithdrawRequest>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: items.length },
    });
  };

  const allocationQuery = async (params: ListParams) => {
    const [payer, receiver] = await Promise.all([
      listMyAllocationsAsPayer(params),
      listMyAllocationsAsReceiver(params),
    ]);
    const merged = [...payer.items, ...receiver.items];
    const start = (params.page - 1) * params.limit;
    const paginated = merged.slice(start, start + params.limit);
    return adaptListResponse<P2PAllocation>({
      items: paginated,
      meta: { page: params.page, limit: params.limit, total: merged.length },
    });
  };

  return (
    <TabsRoot defaultValue={tab}>
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
          queryKeyFactory={(params) => ["trader", "history", "withdrawals", params]}
          queryFn={withdrawalQuery}
          defaultParams={{ page: 1, limit: 10 }}
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
          queryKeyFactory={(params) => ["trader", "history", "deposits", params]}
          queryFn={depositQuery}
          defaultParams={{ page: 1, limit: 10 }}
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
          queryKeyFactory={(params) => ["trader", "history", "allocations", params]}
          queryFn={allocationQuery}
          defaultParams={{ page: 1, limit: 10 }}
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
    </TabsRoot>
  );
}
