"use client";

import { useMutation } from "@tanstack/react-query";
import { listTahesabOutbox, retryTahesabOutbox } from "@/lib/api/admin-tahesab";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { Button } from "@/components/ui/button";

export default function OutboxPage() {
  const retry = useMutation({ mutationFn: (id: string) => retryTahesabOutbox(id) });
  return <ServerTableView<any>
    storageKey="tahesab-outbox"
    title="Tahesab Outbox"
    columns={[{ accessorKey: "status", header: "Status" }, { accessorKey: "method", header: "Method" }, { accessorKey: "correlationId", header: "Correlation" }, { accessorKey: "triesCount", header: "Tries" }, { accessorKey: "nextRetryAt", header: "Next Retry" }, { accessorKey: "createdAt", header: "Created" }] as any}
    queryKeyFactory={(params) => ["tahesab-outbox", params]}
    queryFn={(params) => listTahesabOutbox({ page: params.page, limit: params.limit, ...(params.filters as any), correlationId: params.search }).then((r) => ({ items: r.items ?? [], meta: (r.meta as any) ?? { page: 1, limit: 20, totalItems: r.items?.length || 0, totalPages: 1 } }))}
    rowActions={(row) => <Button size="sm" onClick={() => retry.mutate(row.id)}>Retry</Button>}
  />;
}
