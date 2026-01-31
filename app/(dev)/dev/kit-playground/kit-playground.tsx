"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/kit/table/data-table";
import { FilterBar } from "@/components/kit/table/filter-bar";
import { SortSelect } from "@/components/kit/table/sort-select";
import { useListQueryState } from "@/lib/querykit/use-list-query-state";
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

interface DemoRow {
  id: string;
  user: string;
  amount: string;
  status: string;
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
  const { params, setParams } = useListQueryState();
  const { state: tableState, setColumnVisibility, setPageSize } = useTableStatePersistence(
    "kit-playground.table"
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const actionState = useActionState();

  const search = params.search ?? "";

  useEffect(() => {
    if (tableState.pageSize && tableState.pageSize !== params.limit) {
      setParams({ limit: tableState.pageSize, page: 1 });
    }
  }, [params.limit, setParams, tableState.pageSize]);

  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(
    tableState.columnVisibility ?? {}
  );

  useEffect(() => {
    if (tableState.columnVisibility) {
      setColumnVisibilityState(tableState.columnVisibility);
    }
  }, [tableState.columnVisibility]);

  const filtered = useMemo(() => {
    const base = search ? demoRows.filter((row) => row.user.includes(search)) : demoRows;
    if (!params.sort) return base;
    if (params.sort === "createdAt_desc") {
      return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if (params.sort === "amount_desc") {
      return [...base].sort((a, b) => Number(b.amount) - Number(a.amount));
    }
    return base;
  }, [search, params.sort]);

  const paginated = useMemo(() => {
    const start = (params.page - 1) * params.limit;
    return filtered.slice(start, start + params.limit);
  }, [filtered, params.page, params.limit]);

  const meta = useMemo(
    () => ({
      page: params.page,
      limit: params.limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / params.limit),
      sort: params.sort,
      filtersApplied: { search },
    }),
    [params.page, params.limit, params.sort, filtered.length, search]
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
            search={search}
            onSearchChange={(value) => setParams({ search: value, page: 1 })}
            onReset={() => setParams({ search: "", sort: undefined, page: 1 })}
          >
            {defaultPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                onClick={() => setParams({ ...preset.params, search })}
              >
                {preset.label}
              </Button>
            ))}
            <SortSelect
              value={params.sort}
              options={[
                { value: "createdAt_desc", label: "جدیدترین" },
                { value: "amount_desc", label: "بیشترین مبلغ" },
              ]}
              onChange={(value) => setParams({ sort: value })}
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
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => {
              setParams({ limit, page: 1 });
              setPageSize(limit);
            }}
          />
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
