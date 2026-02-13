"use client";

import { useMutation } from "@tanstack/react-query";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";
import { listOutbox, retryOutbox } from "@/lib/api/foundation";
import type { TahesabOutbox } from "@/lib/contracts/foundation/dtos";

export default function TahesabOutboxPage() {
  const retryMutation = useMutation({ mutationFn: (id: string) => retryOutbox(id) });

  return (
    <ServerTableView<TahesabOutbox>
      storageKey="foundation-tahesab-outbox"
      title="ته‌حساب - صف خروجی"
      columns={[
        { accessorKey: "status", header: "وضعیت" },
        { accessorKey: "method", header: "متد" },
        { accessorKey: "correlationId", header: "شناسه همبستگی" },
        { accessorKey: "triesCount", header: "تعداد تلاش" },
        { accessorKey: "nextRetryAt", header: "زمان تلاش بعدی" },
        { accessorKey: "createdAt", header: "تاریخ ایجاد" },
      ]}
      queryKeyFactory={(params) => ["foundation-outbox", params]}
      queryFn={async (params) => {
        const data = await listOutbox({ page: params.page, limit: params.limit, correlationId: params.search, ...(params.filters as Record<string, unknown>) });
        return {
          items: data.items,
          meta: {
            page: data.meta.page,
            limit: data.meta.limit,
            total: data.meta.totalItems,
            totalPages: data.meta.totalPages,
            hasNextPage: data.meta.hasNextPage,
            hasPrevPage: data.meta.hasPrevPage,
          },
        };
      }}
      filtersConfig={[
        { type: "status", key: "status", label: "وضعیت", options: [{ label: "در انتظار", value: "PENDING" }, { label: "موفق", value: "SUCCESS" }, { label: "ناموفق", value: "FAILED" }] },
      ]}
      rowActions={(row) => <Button size="sm" onClick={() => retryMutation.mutate(row.id)}>بازآوری</Button>}
    />
  );
}
