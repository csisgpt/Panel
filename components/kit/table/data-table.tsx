"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ApiError } from "@/lib/contracts/errors";
import type { ListMeta } from "@/lib/contracts/list";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import { Pagination } from "./pagination";
import type { FiltersModel, SortModel, TableState } from "./types";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  meta?: ListMeta;
  loading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  state?: TableState;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (sort: SortModel) => void;
  onFiltersChange?: (filters: FiltersModel) => void;
  onSearchChange?: (search: string) => void;
  getRowId?: (row: TData, index: number) => string;
  showPagination?: boolean;
  density?: "comfortable" | "compact";
  emptyState?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

/**
 * Server-driven data table with meta-aware pagination and state placeholders.
 * Standard layout:
 * - Container: flex-col h-full min-h-0
 * - Table area: flex-1 min-h-0 (scroll lives inside Table component)
 * - Pagination: fixed at bottom
 */
export function DataTable<TData>({
  data,
  columns,
  meta,
  loading,
  error,
  onRetry,
  onPageChange,
  onLimitChange,
  onSortChange,
  onFiltersChange,
  onSearchChange,
  getRowId,
  showPagination = true,
  density = "comfortable",
  emptyState,
}: DataTableProps<TData>) {
  void onSortChange;
  void onFiltersChange;
  void onSearchChange;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const colSpan = table.getVisibleLeafColumns().length;
  const cellPadding = density === "compact" ? "py-2 px-3 text-xs" : "p-4";
  const headerPadding = density === "compact" ? "py-2 px-3 text-xs" : "p-4";

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Table area must be flex-1 min-h-0 so only rows scroll */}
      <div className="flex-1 min-h-0">
        <Table
          className="relative"
          containerClassName="h-full"
          scrollClassName="h-full"
        >
          <TableHeader className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={[
                      "sticky top-0 z-10", // sticky روی th هم کمک می‌کنه
                      headerPadding,
                      (header.column.columnDef.meta as { headerClassName?: string } | undefined)?.headerClassName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className={cellPadding}>
                  <LoadingState />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className={cellPadding}>
                  <ErrorState error={error} onAction={onRetry} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className={cellPadding}>
                  <EmptyState
                    title={emptyState?.title}
                    description={emptyState?.description}
                    actionLabel={emptyState?.actionLabel}
                    onAction={emptyState?.onAction}
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { cellClassName?: string } | undefined;
                    return (
                      <TableCell
                        key={cell.id}
                        className={[cellPadding, meta?.cellClassName].filter(Boolean).join(" ")}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination stays fixed (not in scroll area) */}
      {showPagination && meta && onPageChange ? (
        <div className="shrink-0">
          <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
        </div>
      ) : null}
    </div>
  );
}
