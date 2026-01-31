"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/kit/table/data-table";
import { FilterBar } from "@/components/kit/table/filter-bar";
import { SortSelect } from "@/components/kit/table/sort-select";
import { Pagination } from "@/components/kit/table/pagination";
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
import { Input } from "@/components/ui/input";
import { getMockAttachments } from "@/lib/mock-data";
import type { Attachment, FileMeta } from "@/lib/types/backend";

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

export function KitPlayground() {
  const { params, setParams } = useListQueryState();
  const [search, setSearch] = useState(params.search ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return demoRows;
    return demoRows.filter((row) => row.user.includes(search));
  }, [search]);

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
      { header: "شناسه", accessorKey: "id" },
      { header: "کاربر", accessorKey: "user" },
      { header: "مبلغ", accessorKey: "amount" },
      {
        header: "وضعیت",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const fileList: FileMeta[] = attachments
    .map((attachment) => attachment.file)
    .filter(Boolean) as FileMeta[];

  useEffect(() => {
    getMockAttachments().then(setAttachments);
  }, []);

  return (
    <div className="space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>QueryKit + TableKit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar>
            {defaultPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                onClick={() => setParams({ ...preset.params, search })}
              >
                {preset.label}
              </Button>
            ))}
            <Input
              placeholder="جستجو"
              value={search}
              onChange={(event) => {
                const next = event.target.value;
                setSearch(next);
                setParams({ search: next, page: 1 });
              }}
              className="max-w-xs"
            />
            <SortSelect
              value={params.sort}
              options={[
                { value: "createdAt_desc", label: "جدیدترین" },
                { value: "amount_desc", label: "بیشترین مبلغ" },
              ]}
              onChange={(value) => setParams({ sort: value })}
            />
          </FilterBar>
          <DataTable data={paginated} columns={columns} />
          <Pagination meta={meta} onPageChange={(page) => setParams({ page })} />
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
            {fileList.map((file) => (
              <AttachmentBadge key={file.id} file={file} />
            ))}
          </div>
          <AttachmentPreviewButton onClick={() => setGalleryOpen(true)} label="نمایش گالری" />
          <AttachmentGalleryModal
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
            files={fileList}
          />
        </CardContent>
      </Card>
    </div>
  );
}
