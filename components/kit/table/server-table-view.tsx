"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import type { ApiError } from "@/lib/contracts/errors";
import type { ListMeta } from "@/lib/contracts/list";
import { cleanDefaults, type ListParams, type SortDir, withDefaults } from "@/lib/querykit/schemas";
import { useListQueryState } from "@/lib/querykit/use-list-query-state";
import { DataTable } from "./data-table";
import { FilterBar } from "./filter-bar";
import { Pagination } from "./pagination";
import { QuickTabs, type QuickTab } from "./quick-tabs";
import { SortSelect } from "./sort-select";
import { useTableStatePersistence } from "./use-table-state-persistence";

export interface ServerTableViewTab<TFilters> extends QuickTab {
  paramsPatch: Partial<ListParams<TFilters>>;
}

export type ServerTableSortOption = {
  key: string;
  label: string;
  defaultDir?: SortDir;
};

export type ServerTableFilterConfig<TFilters> =
  | {
      type: "status";
      key: keyof TFilters & string;
      label: string;
      options: Array<{ label: string; value: string }>;
    }
  | {
      type: "dateRange";
      key: keyof TFilters & string;
      label: string;
    }
  | {
      type: "amountRange";
      key: keyof TFilters & string;
      label: string;
    };

export interface ServerTableViewProps<TItem, TFilters> {
  title?: string;
  description?: string;
  storageKey: string;
  columns: ColumnDef<TItem>[];
  queryKeyFactory: (params: ListParams<TFilters>) => unknown[];
  queryFn: (params: ListParams<TFilters>) => Promise<{ items: TItem[]; meta: ListMeta }>;
  defaultParams?: Partial<ListParams<TFilters>>;
  tabs?: Array<ServerTableViewTab<TFilters>>;
  filtersConfig?: Array<ServerTableFilterConfig<TFilters>>;
  sortOptions?: Array<ServerTableSortOption>;
  rowActions?: (row: TItem) => React.ReactNode;
  renderCard?: (row: TItem) => React.ReactNode;
  getRowId?: (row: TItem) => string;
  emptyState?: { title: string; description?: string; actionLabel?: string; onAction?: () => void };
  refetchIntervalMs?: number;
}

function getColumnKey<T>(column: ColumnDef<T>, index: number) {
  if (column.id) return column.id;
  if (typeof column.accessorKey === "string") return column.accessorKey;
  return `col-${index}`;
}

function buildSortValue(sort?: { key: string; dir: SortDir }) {
  if (!sort) return undefined;
  return `${sort.key}_${sort.dir}`;
}

function parseSortValue(value: string): { key: string; dir: SortDir } {
  const [key, dir] = value.split("_");
  return { key, dir: dir === "asc" ? "asc" : "desc" };
}

function normalizeFilters<TFilters>(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as TFilters;
}

/**
 * Unified list view wrapper combining QueryKit + React Query + TableKit.
 */
export function ServerTableView<TItem, TFilters = Record<string, unknown>>({
  title,
  description,
  storageKey,
  columns,
  queryKeyFactory,
  queryFn,
  defaultParams,
  tabs,
  filtersConfig,
  sortOptions,
  rowActions,
  renderCard,
  getRowId,
  emptyState,
  refetchIntervalMs,
}: ServerTableViewProps<TItem, TFilters>) {
  const { state: persistedState, setColumnVisibility, setPageSize } = useTableStatePersistence(storageKey);
  const { params, setParams } = useListQueryState<TFilters>({ defaultParams });
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(
    persistedState.columnVisibility ?? {}
  );

  useEffect(() => {
    if (persistedState.columnVisibility) {
      setColumnVisibilityState(persistedState.columnVisibility);
    }
  }, [persistedState.columnVisibility]);

  useEffect(() => {
    if (persistedState.pageSize && persistedState.pageSize !== params.limit) {
      setParams({ limit: persistedState.pageSize, page: 1 });
    }
  }, [persistedState.pageSize, params.limit, setParams]);

  const cleanedParams = useMemo(
    () => cleanDefaults(withDefaults(params, defaultParams), defaultParams),
    [params, defaultParams]
  );

  const queryKey = useMemo(() => queryKeyFactory(cleanedParams as ListParams<TFilters>), [queryKeyFactory, cleanedParams]);

  const query = useQuery<{ items: TItem[]; meta: ListMeta }, ApiError>({
    queryKey,
    queryFn: () => queryFn(params),
    refetchInterval: refetchIntervalMs,
  });

  const data: TItem[] = query.data?.items ?? [];
  const meta = query.data?.meta;
  const error = (query.error ?? null) as ApiError | null;

  const defaultTabId = defaultParams?.tab ?? tabs?.[0]?.id;

  const handleTabChange = useCallback(
    (tabId: string) => {
      const tab = tabs?.find((item) => item.id === tabId);
      if (!tab) return;
      const mergedFilters = tab.paramsPatch.filters
        ? { ...(params.filters as Record<string, unknown>), ...(tab.paramsPatch.filters as Record<string, unknown>) }
        : (params.filters as Record<string, unknown>);
      const nextFilters = mergedFilters ? normalizeFilters<TFilters>(mergedFilters) : undefined;
      setParams({
        ...tab.paramsPatch,
        filters: nextFilters as TFilters,
        tab: tabId,
        page: 1,
      });
    },
    [tabs, params.filters, setParams]
  );

  const handleReset = useCallback(() => {
    setParams({
      page: 1,
      limit: defaultParams?.limit ?? params.limit,
      search: undefined,
      sort: undefined,
      filters: undefined,
      tab: defaultTabId,
    });
  }, [defaultParams?.limit, defaultTabId, params.limit, setParams]);

  const columnsWithActions = useMemo(() => {
    if (!rowActions) return columns;
    return [
      ...columns,
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: TItem } }) => rowActions(row.original),
      } as ColumnDef<TItem>,
    ];
  }, [columns, rowActions]);

  const visibleColumns = useMemo(() => {
    return columnsWithActions.filter((column, index) => {
      const key = getColumnKey(column, index);
      return columnVisibility[key] !== false;
    });
  }, [columnsWithActions, columnVisibility]);

  const filterEntries = useMemo(() => {
    const applied = {
      ...(params.filters as Record<string, unknown> | undefined),
      ...(meta?.filtersApplied ?? {}),
    };
    return Object.entries(applied ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  }, [params.filters, meta?.filtersApplied]);

  const currentSortValue = buildSortValue(params.sort);

  const sortOptionsNormalized = useMemo(() => {
    return (sortOptions ?? []).map((option) => ({
      label: option.label,
      value: `${option.key}_${option.defaultDir ?? "desc"}`,
    }));
  }, [sortOptions]);

  const filterLabels = useMemo(() => {
    const map = new Map<string, { label: string; values?: Record<string, string> }>();
    (filtersConfig ?? []).forEach((filter) => {
      if (filter.type === "status") {
        const values = filter.options.reduce<Record<string, string>>((acc, option) => {
          acc[option.value] = option.label;
          return acc;
        }, {});
        map.set(filter.key, { label: filter.label, values });
      } else {
        map.set(filter.key, { label: filter.label });
      }
    });
    return map;
  }, [filtersConfig]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        {title ? <CardTitle>{title}</CardTitle> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {tabs?.length ? (
          <QuickTabs
            tabs={tabs}
            currentTabId={params.tab ?? defaultTabId}
            onTabChange={handleTabChange}
            disabled={query.isLoading}
          />
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar
          search={params.search}
          onSearchChange={(value) => setParams({ search: value || undefined, page: 1 })}
          onReset={handleReset}
          disabled={query.isLoading}
        >
          {filtersConfig?.map((filter) => {
            if (filter.type === "status") {
              const current = (params.filters as Record<string, unknown> | undefined)?.[filter.key] as
                | string
                | undefined;
              return (
                <Select
                  key={filter.key}
                  value={current}
                  onValueChange={(value) =>
                    setParams({
                      filters: normalizeFilters<TFilters>({
                        ...(params.filters as Record<string, unknown>),
                        [filter.key]: value,
                      }),
                      page: 1,
                    })
                  }
                  disabled={query.isLoading}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
            return (
              <Button key={filter.key} variant="outline" size="sm" disabled>
                {filter.label} (به‌زودی)
              </Button>
            );
          })}
          {sortOptionsNormalized.length ? (
            <SortSelect
              value={currentSortValue}
              options={sortOptionsNormalized}
              onChange={(value) => setParams({ sort: parseSortValue(value), page: 1 })}
              disabled={query.isLoading}
            />
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={query.isLoading}>
                ستون‌ها
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columnsWithActions.map((column, index) => {
                const key = getColumnKey(column, index);
                const label =
                  typeof column.header === "string" ? column.header : column.id ?? column.accessorKey ?? key;
                return (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={columnVisibility[key] !== false}
                    onCheckedChange={(checked) => {
                      const next = { ...columnVisibility, [key]: Boolean(checked) };
                      setColumnVisibilityState(next);
                      setColumnVisibility(next);
                    }}
                  >
                    {String(label)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </FilterBar>

        {filterEntries.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>فیلترهای اعمال‌شده:</span>
            {filterEntries.map(([key, value]) => (
              <Badge key={key} variant="secondary" className="gap-2">
                <span>
                  {(filterLabels.get(key)?.label ?? key) + ": "}{String(filterLabels.get(key)?.values?.[String(value)] ?? value)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs"
                  onClick={() => {
                    const next = { ...(params.filters as Record<string, unknown>), [key]: undefined };
                    const cleaned = normalizeFilters<TFilters>(next);
                    setParams({ filters: Object.keys(cleaned as Record<string, unknown>).length ? cleaned : undefined, page: 1 });
                  }}
                >
                  حذف
                </Button>
              </Badge>
            ))}
          </div>
        ) : null}

        {renderCard ? (
          <div className="space-y-3 md:hidden">
            {query.isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onAction={() => query.refetch()} />
            ) : data.length === 0 ? (
              <EmptyState title={emptyState?.title} description={emptyState?.description} actionLabel={emptyState?.actionLabel} onAction={emptyState?.onAction} />
            ) : (
              data.map((row, index) => <div key={getRowId ? getRowId(row) : index}>{renderCard(row)}</div>)
            )}
          </div>
        ) : null}

        <div className={renderCard ? "hidden md:block" : ""}>
          <DataTable
            data={data}
            columns={visibleColumns}
            meta={meta}
            loading={query.isLoading}
            error={error}
            onRetry={() => query.refetch()}
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => {
              setParams({ limit, page: 1 });
              setPageSize(limit);
            }}
            getRowId={getRowId ? (row) => getRowId(row) : undefined}
            showPagination={false}
            emptyState={emptyState}
          />
        </div>

        {meta ? (
          <Pagination
            meta={meta}
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => {
              setParams({ limit, page: 1 });
              setPageSize(limit);
            }}
            disabled={query.isLoading}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
