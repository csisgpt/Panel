"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/kit/table/data-table";
import { FilterBar } from "@/components/kit/table/filter-bar";
import { SortSelect } from "@/components/kit/table/sort-select";
import { ServerTableView } from "@/components/kit/table/server-table-view";
import { QuickTabs } from "@/components/kit/table/quick-tabs";
import { defaultPresets } from "@/lib/querykit/presets";
import { StatusBadge } from "@/components/kit/ops/status-badge";
import { CountdownBadge } from "@/components/kit/ops/countdown-badge";
import { ConfirmDialog } from "@/components/kit/ops/confirm-dialog";
import { CopyButton } from "@/components/kit/ops/copy-button";
import { DisputeChip, ProofChip, UrgentChip } from "@/components/kit/ops/chips";
import { AttachmentGalleryModal } from "@/components/kit/files/attachment-gallery-modal";
import { AttachmentBadge } from "@/components/kit/files/attachment-badge";
import { AttachmentPreviewButton } from "@/components/kit/files/attachment-preview-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMockAttachments } from "@/lib/mock-data";
import type { Attachment, FileMeta } from "@/lib/types/backend";
import { moneyColumn, dateColumn } from "@/components/kit/table/column-builder";
import { useTableStatePersistence } from "@/components/kit/table/use-table-state-persistence";
import { hasPermission, type AllocationActions } from "@/lib/contracts/permissions";
import { useActionState } from "@/lib/hooks/use-action-state";
import { buildApiError } from "@/lib/api/http";
import { createAdminP2PWithdrawalsListConfig } from "@/lib/screens/admin/p2p-withdrawals.list";
import { createAdminP2PAllocationsListConfig } from "@/lib/screens/admin/p2p-allocations.list";
import { createUserDestinationsListConfig } from "@/lib/screens/user/destinations.list";
import { buildAdminP2PAllocationsQuery, buildAdminP2PWithdrawalsQuery, getOpsSummary } from "@/lib/api/p2p";
import type { P2POpsSummary } from "@/lib/contracts/p2p";
import { useListQueryState } from "@/lib/querykit/use-list-query-state";

interface DemoRow {
  id: string;
  user: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface ServerRow {
  id: string;
  user: string;
  amount: number;
  status: string;
  bucket: string;
  createdAt: string;
}

const demoRows: DemoRow[] = Array.from({ length: 42 }, (_, index) => ({
  id: `row-${index + 1}`,
  user: `کاربر ${index + 1}`,
  amount: `${(index + 1) * 100000}`,
  status: index % 3 === 0 ? "PENDING" : index % 3 === 1 ? "APPROVED" : "REJECTED",
  createdAt: new Date(Date.now() - index * 3600 * 1000).toISOString(),
}));

const demoPermissions: AllocationActions = {
  canSubmitProof: true,
  canConfirmReceived: false,
  canDispute: true,
  canCancel: true,
  canAdminVerify: false,
  canFinalize: false,
  canViewAttachments: true,
  canDownloadAttachments: false,
};

export function KitPlayground() {
  const { state: tableState, setColumnVisibility, setPageSize } = useTableStatePersistence(
    "kit-playground.table"
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const actionState = useActionState();
  const [simulateError, setSimulateError] = useState(false);
  const [opsSummary, setOpsSummary] = useState<P2POpsSummary | null>(null);

  const [tableSearch, setTableSearch] = useState("");
  const [tableSort, setTableSort] = useState<{ key: string; dir: "asc" | "desc" } | undefined>(undefined);
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(20);

  useEffect(() => {
    if (tableState.pageSize && tableState.pageSize !== tableLimit) {
      setTableLimit(tableState.pageSize);
      setTablePage(1);
    }
  }, [tableLimit, tableState.pageSize]);

  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(
    tableState.columnVisibility ?? {}
  );

  useEffect(() => {
    if (tableState.columnVisibility) {
      setColumnVisibilityState(tableState.columnVisibility);
    }
  }, [tableState.columnVisibility]);

  const filtered = useMemo(() => {
    const base = tableSearch ? demoRows.filter((row) => row.user.includes(tableSearch)) : demoRows;
    if (!tableSort) return base;
    if (tableSort.key === "createdAt") {
      const direction = tableSort.dir === "asc" ? 1 : -1;
      return [...base].sort((a, b) => direction * a.createdAt.localeCompare(b.createdAt));
    }
    if (tableSort.key === "amount") {
      const direction = tableSort.dir === "asc" ? 1 : -1;
      return [...base].sort((a, b) => direction * (Number(a.amount) - Number(b.amount)));
    }
    if (tableSort.key === "createdAt_legacy") {
      return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return base;
  }, [tableSearch, tableSort]);

  const paginated = useMemo(() => {
    const start = (tablePage - 1) * tableLimit;
    return filtered.slice(start, start + tableLimit);
  }, [filtered, tablePage, tableLimit]);

  const meta = useMemo(
    () => ({
      page: tablePage,
      limit: tableLimit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / tableLimit),
      sort: tableSort ? `${tableSort.key}_${tableSort.dir}` : undefined,
      filtersApplied: { search: tableSearch },
    }),
    [tablePage, tableLimit, tableSort, filtered.length, tableSearch]
  );

  const columns = useMemo<ColumnDef<DemoRow>[]>(
    () => [
      { id: "id", header: "شناسه", accessorKey: "id" },
      { id: "user", header: "کاربر", accessorKey: "user" },
      moneyColumn<DemoRow>("amount", "مبلغ"),
      dateColumn<DemoRow>("createdAt", "زمان ایجاد"),
      {
        id: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const visibleColumns = useMemo(() => {
    return columns.filter((column) => {
      const key = column.id ?? (typeof column.accessorKey === "string" ? column.accessorKey : "");
      if (!key) return true;
      return columnVisibility[key] !== false;
    });
  }, [columns, columnVisibility]);

  const fileList: FileMeta[] = attachments
    .map((attachment) => attachment.file)
    .filter(Boolean) as FileMeta[];

  const galleryFiles = useMemo(() => {
    const images = fileList.filter((file) => file.mimeType.startsWith("image/"));
    const pdfs = fileList.filter((file) => file.mimeType === "application/pdf");
    return [images[0], images[1], pdfs[0]].filter(Boolean) as FileMeta[];
  }, [fileList]);

  useEffect(() => {
    getMockAttachments().then(setAttachments);
  }, []);

  useEffect(() => {
    getOpsSummary().then(setOpsSummary).catch(() => setOpsSummary(null));
  }, []);

  const serverRows = useMemo<ServerRow[]>(
    () =>
      Array.from({ length: 60 }, (_, index) => ({
        id: `srv-${index + 1}`,
        user: `کاربر لیست ${index + 1}`,
        amount: 250000 + index * 5000,
        status: index % 4 === 0 ? "PENDING" : index % 4 === 1 ? "APPROVED" : index % 4 === 2 ? "REVIEW" : "REJECTED",
        bucket:
          index % 5 === 0
            ? "needs_assignment"
            : index % 5 === 1
            ? "proof_submitted"
            : index % 5 === 2
            ? "expiring_soon"
            : index % 5 === 3
            ? "dispute"
            : "all",
        createdAt: new Date(Date.now() - index * 7200 * 1000).toISOString(),
      })),
    []
  );

  const serverColumns = useMemo<ColumnDef<ServerRow>[]>(
    () => [
      { id: "id", header: "شناسه", accessorKey: "id" },
      { id: "user", header: "کاربر", accessorKey: "user" },
      moneyColumn<ServerRow>("amount", "مبلغ"),
      { id: "status", header: "وضعیت", accessorKey: "status" },
      dateColumn<ServerRow>("createdAt", "زمان ایجاد"),
    ],
    []
  );

  const serverQueryFn = useCallback(
    async (nextParams: { page: number; limit: number; search?: string; sort?: { key: string; dir: string }; filters?: Record<string, unknown> }) => {
      if (simulateError) {
        throw buildApiError({ message: "خطای شبیه‌سازی شده", traceId: "TRACE-PLAYGROUND-01" });
      }
      let items = [...serverRows];
      if (nextParams.search) {
        items = items.filter((row) => row.user.includes(nextParams.search ?? ""));
      }
      if (nextParams.filters?.bucket) {
        items = items.filter((row) => row.bucket === nextParams.filters?.bucket);
      }
      if (nextParams.filters?.status) {
        items = items.filter((row) => row.status === nextParams.filters?.status);
      }
      if (nextParams.sort?.key === "createdAt") {
        const direction = nextParams.sort.dir === "asc" ? 1 : -1;
        items = items.sort((a, b) => direction * a.createdAt.localeCompare(b.createdAt));
      }
      if (nextParams.sort?.key === "amount") {
        const direction = nextParams.sort.dir === "asc" ? 1 : -1;
        items = items.sort((a, b) => direction * (a.amount - b.amount));
      }
      const start = (nextParams.page - 1) * nextParams.limit;
      const paginatedItems = items.slice(start, start + nextParams.limit);
      return {
        items: paginatedItems,
        meta: {
          page: nextParams.page,
          limit: nextParams.limit,
          total: items.length,
          totalPages: Math.max(1, Math.ceil(items.length / nextParams.limit)),
          filtersApplied: nextParams.filters,
        },
      };
    },
    [serverRows, simulateError]
  );

  const withdrawalsConfig = useMemo(() => createAdminP2PWithdrawalsListConfig(), []);
  const allocationsConfig = useMemo(() => createAdminP2PAllocationsListConfig(), []);
  const destinationsConfig = useMemo(() => createUserDestinationsListConfig(), []);
  const { params: withdrawalsParams } = useListQueryState({ defaultParams: withdrawalsConfig.defaultParams });
  const { params: allocationsParams } = useListQueryState({ defaultParams: allocationsConfig.defaultParams });
  const opsCounts = useMemo(() => {
    if (!opsSummary) return undefined;
    const total =
      opsSummary.needsAssignment +
      (opsSummary.partiallyAssigned ?? 0) +
      opsSummary.proofSubmitted +
      opsSummary.expiringSoon +
      opsSummary.disputes +
      (opsSummary.finalizable ?? 0);
    return {
      all: total,
      needs_assignment: opsSummary.needsAssignment,
      partially_assigned: opsSummary.partiallyAssigned ?? 0,
      proof_submitted: opsSummary.proofSubmitted,
      expiring_soon: opsSummary.expiringSoon,
      disputes: opsSummary.disputes,
      finalizable: opsSummary.finalizable ?? 0,
    };
  }, [opsSummary]);
  const withdrawalsQuery = useMemo(
    () => buildAdminP2PWithdrawalsQuery(withdrawalsParams).toString(),
    [withdrawalsParams]
  );
  const allocationsQuery = useMemo(
    () => buildAdminP2PAllocationsQuery(allocationsParams).toString(),
    [allocationsParams]
  );

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Permissions + UI State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              disabled={!hasPermission(demoPermissions, "canSubmitProof")}
              onClick={() => {
                actionState.setLoading();
                setTimeout(() => actionState.setSuccess(), 600);
              }}
            >
              ارسال رسید
            </Button>
            <Button variant="outline" disabled={!hasPermission(demoPermissions, "canConfirmReceived")}>
              تایید دریافت
            </Button>
            <Button variant="outline" disabled={!hasPermission(demoPermissions, "canDispute")}>
              ثبت اختلاف
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            وضعیت UI: {actionState.state.status === "loading" ? "در حال انجام" : actionState.state.status}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QueryKit + TableKit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            search={tableSearch}
            onSearchChange={(value) => {
              setTableSearch(value);
              setTablePage(1);
            }}
            onReset={() => {
              setTableSearch("");
              setTableSort(undefined);
              setTablePage(1);
            }}
          >
            {defaultPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                onClick={() => {
                  setTablePage(preset.params.page ?? 1);
                  setTableLimit(preset.params.limit ?? 20);
                }}
              >
                {preset.label}
              </Button>
            ))}
            <SortSelect
              value={tableSort ? `${tableSort.key}_${tableSort.dir}` : undefined}
              options={[
                { value: "createdAt_desc", label: "جدیدترین" },
                { value: "amount_desc", label: "بیشترین مبلغ" },
              ]}
              onChange={(value) => {
                const [key, dir] = value.split("_");
                setTableSort({ key, dir: dir === "asc" ? "asc" : "desc" });
                setTablePage(1);
              }}
            />
          </FilterBar>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>نمایش ستون‌ها:</span>
            {columns.map((column) => {
              const key = column.id ?? (typeof column.accessorKey === "string" ? column.accessorKey : "");
              if (!key) return null;
              const isVisible = columnVisibility[key] !== false;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={isVisible ? "default" : "outline"}
                  onClick={() => {
                    const next = { ...columnVisibility, [key]: !isVisible };
                    setColumnVisibilityState(next);
                    setColumnVisibility(next);
                  }}
                >
                  {column.header as string}
                </Button>
              );
            })}
          </div>

          <DataTable
            data={paginated}
            columns={visibleColumns}
            meta={meta}
            onPageChange={(page) => setTablePage(page)}
            onLimitChange={(limit) => {
              setTableLimit(limit);
              setTablePage(1);
              setPageSize(limit);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ServerTableView</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={simulateError ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSimulateError((prev) => !prev)}
            >
              {simulateError ? "حالت خطا فعال است" : "شبیه‌سازی خطا"}
            </Button>
          </div>
          <ServerTableView<ServerRow, Record<string, unknown>>
            storageKey="kit-playground.server-table"
            title="لیست سرورمحور"
            description="نمونه ترکیب QueryKit + React Query + TableKit"
            columns={serverColumns}
            queryKeyFactory={(params) => ["server-table", params]}
            queryFn={serverQueryFn}
            defaultParams={{ page: 1, limit: 10, tab: "all" }}
            tabs={[
              { id: "all", label: "همه", paramsPatch: { filters: {} } },
              { id: "needs_assignment", label: "نیاز به تخصیص", paramsPatch: { filters: { bucket: "needs_assignment" } } },
              { id: "proof_submitted", label: "رسید ارسال شد", paramsPatch: { filters: { bucket: "proof_submitted" } } },
              { id: "expiring_soon", label: "در شرف انقضا", paramsPatch: { filters: { bucket: "expiring_soon" } } },
              { id: "dispute", label: "اختلاف", paramsPatch: { filters: { bucket: "dispute" } } },
            ]}
            sortOptions={[
              { key: "createdAt", label: "جدیدترین", defaultDir: "desc" },
              { key: "amount", label: "بیشترین مبلغ", defaultDir: "desc" },
            ]}
            filtersConfig={[
              {
                type: "status",
                key: "status",
                label: "وضعیت",
                options: [
                  { label: "در انتظار", value: "PENDING" },
                  { label: "تایید شده", value: "APPROVED" },
                  { label: "بازبینی", value: "REVIEW" },
                  { label: "رد شده", value: "REJECTED" },
                ],
              },
              { type: "dateRange", key: "dateRange", label: "بازه تاریخ" },
              { type: "amountRange", key: "amountRange", label: "بازه مبلغ" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin P2P Withdrawals Queue (mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {withdrawalsConfig.tabs ? (
            <QuickTabs
              tabs={[
                { id: "needs_assignment", label: "نیاز تخصیص" },
                { id: "partially_assigned", label: "تخصیص ناقص" },
              ]}
              currentTabId="needs_assignment"
              onTabChange={() => null}
              counts={opsCounts}
              disabled
            />
          ) : null}
          <ServerTableView
            {...withdrawalsConfig}
            queryFn={async (params) => {
              if (simulateError) {
                throw buildApiError({ message: "خطای سرور", traceId: "TRACE-P2P-WITHDRAWALS-01" });
              }
              return withdrawalsConfig.queryFn(params);
            }}
          />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold">Backend endpoints (doc reference)</p>
            <ul className="list-disc pl-4">
              <li>GET /admin/p2p/withdrawals</li>
              <li>GET /admin/p2p/withdrawals/:id/candidates</li>
              <li>POST /admin/p2p/withdrawals/:id/assign</li>
            </ul>
            <p className="mt-2 font-semibold">Sample query params</p>
            <code className="block rounded bg-muted px-2 py-1 text-xs">{withdrawalsQuery || "(none)"}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin P2P Allocations Review (mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuickTabs
            tabs={[
              { id: "proof_submitted", label: "رسید ارسال شد" },
              { id: "expiring_soon", label: "نزدیک به انقضا" },
              { id: "disputes", label: "اختلاف" },
              { id: "finalizable", label: "نهایی‌سازی" },
            ]}
            currentTabId="proof_submitted"
            onTabChange={() => null}
            counts={opsCounts}
            disabled
          />
          <ServerTableView
            {...allocationsConfig}
            queryFn={async (params) => {
              if (simulateError) {
                throw buildApiError({ message: "خطای سرور", traceId: "TRACE-P2P-ALLOC-01" });
              }
              return allocationsConfig.queryFn(params);
            }}
          />
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold">Backend endpoints (doc reference)</p>
            <ul className="list-disc pl-4">
              <li>GET /admin/p2p/allocations</li>
              <li>POST /admin/p2p/allocations/:id/verify</li>
              <li>POST /admin/p2p/allocations/:id/finalize</li>
              <li>POST /admin/p2p/allocations/:id/cancel</li>
            </ul>
            <p className="mt-2 font-semibold">Sample query params</p>
            <code className="block rounded bg-muted px-2 py-1 text-xs">{allocationsQuery || "(none)"}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinations (mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServerTableView {...destinationsConfig} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpsKit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="PENDING" />
            <StatusBadge status="APPROVED" />
            <StatusBadge status="REJECTED" />
            <CountdownBadge targetDate={new Date(Date.now() + 3600 * 1000).toISOString()} />
            <ProofChip />
            <DisputeChip />
            <UrgentChip />
            <CopyButton value="REF-998877" />
          </div>
          <ConfirmDialog
            triggerLabel="حذف نهایی"
            title="حذف تراکنش"
            description="این عملیات غیرقابل بازگشت است."
            phrase="حذف"
            onConfirm={() => {
              // noop for playground
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FileKit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {galleryFiles.map((file) => (
              <AttachmentBadge key={file.id} file={file} />
            ))}
          </div>
          <AttachmentPreviewButton onClick={() => setGalleryOpen(true)} label="نمایش گالری" />
          <AttachmentGalleryModal
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
            files={galleryFiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}
