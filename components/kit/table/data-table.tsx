"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  emptyState?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
}

/**
 * Server-driven data table with meta-aware pagination and state placeholders.
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

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as { headerClassName?: string } | undefined)?.headerClassName}
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
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <LoadingState />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
                  <ErrorState error={error} onAction={onRetry} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan}>
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
                      <TableCell key={cell.id} className={meta?.cellClassName}>
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
      {showPagination && meta && onPageChange ? (
        <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      ) : null}
    </div>
  );
}
