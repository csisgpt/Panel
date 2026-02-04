"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppliedFiltersBar, type AppliedFilter } from "@/components/kit/table/applied-filters-bar";
import { EmptyState } from "@/components/kit/common/EmptyState";
import { ErrorState } from "@/components/kit/common/ErrorState";
import { LoadingState } from "@/components/kit/common/LoadingState";
import type { ApiError } from "@/lib/contracts/errors";
import type { ListMeta } from "@/lib/contracts/list";
import { cleanDefaults, type ListParams, type SortDir, withDefaults } from "@/lib/querykit/schemas";
import { useListQueryState } from "@/lib/querykit/use-list-query-state";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { QuickTabs, type QuickTab } from "./quick-tabs";
import { SortSelect } from "./sort-select";
import { AdvancedFilterBar } from "./advanced-filter-bar";
import { DensityToggle } from "./density-toggle";
import { SavedViews } from "./saved-views";
import { TableShell } from "./table-shell";
import { TableToolbar } from "./table-toolbar";
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
  enableDensityToggle?: boolean;
  enableAdvancedFilters?: boolean;
  enableAppliedFiltersBar?: boolean;
  enableSavedViews?: boolean;
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

function serializeFilterValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return value ? String(value) : "-";
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
  enableDensityToggle = false,
  enableAdvancedFilters = false,
  enableAppliedFiltersBar = true,
  enableSavedViews = false,
}: ServerTableViewProps<TItem, TFilters>) {
  const { state: persistedState, setColumnVisibility, setPageSize, setDensity, setSavedViewId } =
    useTableStatePersistence(storageKey);
  const { params, setParams } = useListQueryState<TFilters>({ defaultParams });
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(
    persistedState.columnVisibility ?? {}
  );
  const [density, setDensityState] = useState<"comfortable" | "compact">(persistedState.density ?? "comfortable");
  const [localSearch, setLocalSearch] = useState(params.search ?? "");
  const [advancedOpen, setAdvancedOpen] = useState(false);

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

  useEffect(() => {
    if (persistedState.density) {
      setDensityState(persistedState.density);
    }
  }, [persistedState.density]);

  useEffect(() => {
    setLocalSearch(params.search ?? "");
  }, [params.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch === (params.search ?? "")) return;
      setParams({ search: localSearch || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, params.search, setParams]);

  const cleanedParams = useMemo(
    () => cleanDefaults(withDefaults(params, defaultParams), defaultParams),
    [params, defaultParams]
  );

  const queryKey = useMemo(() => queryKeyFactory(cleanedParams as ListParams<TFilters>), [queryKeyFactory, cleanedParams]);

  const query = useQuery<{ items: TItem[]; meta: ListMeta }, ApiError>({
    queryKey,
    queryFn: () => queryFn(cleanedParams as ListParams<TFilters>),
    refetchInterval: refetchIntervalMs,
    placeholderData: (previous) => previous,
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

  const appliedFilters = useMemo<AppliedFilter[]>(() => {
    const filters = filterEntries.map(([key, value]) => {
      const meta = filterLabels.get(key);
      const label = meta?.label ?? key;
      const valueLabel = meta?.values?.[String(value)] ?? serializeFilterValue(value);
      return { key, label, value: valueLabel };
    });
    if (params.search) {
      filters.unshift({ key: "__search", label: "جستجو", value: params.search });
    }
    return filters;
  }, [filterEntries, filterLabels, params.search]);

  const primaryFiltersConfig = useMemo(() => (filtersConfig ?? []).slice(0, 3), [filtersConfig]);
  const secondaryFiltersConfig = useMemo(() => (filtersConfig ?? []).slice(3), [filtersConfig]);
  const showFilters = (filtersConfig?.length ?? 0) > 0 || sortOptionsNormalized.length > 0;

  const renderFilterControl = useCallback(
    (filter: ServerTableFilterConfig<TFilters>) => {
      const current = (params.filters as Record<string, unknown> | undefined)?.[filter.key];
      const handleChange = (value: string) => {
        setParams({
          filters: normalizeFilters<TFilters>({
            ...(params.filters as Record<string, unknown>),
            [filter.key]: value || undefined,
          }),
          page: 1,
        });
      };

      if (filter.type === "status") {
        return (
          <Select key={filter.key} value={current as string | undefined} onValueChange={handleChange} disabled={query.isLoading}>
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

      if (filter.type === "dateRange") {
        return (
          <Input
            key={filter.key}
            type="date"
            value={(current as string | undefined) ?? ""}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={filter.label}
            className="w-[180px]"
            disabled={query.isLoading}
          />
        );
      }

      return (
        <Input
          key={filter.key}
          type="number"
          value={(current as string | undefined) ?? ""}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={filter.label}
          className="w-[180px]"
          disabled={query.isLoading}
        />
      );
    },
    [params.filters, query.isLoading, setParams]
  );

  return (
    <TableShell
      title={title}
      description={description}
      toolbar={
        <div className="space-y-3">
          <TableToolbar
            searchSlot={
              <Input
                placeholder="جستجو"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                disabled={query.isLoading}
                className="w-full sm:w-64"
              />
            }
            columnsSlot={
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
            }
            densitySlot={
              enableDensityToggle ? (
                <DensityToggle
                  value={density}
                  onChange={(value) => {
                    setDensityState(value);
                    setDensity(value);
                  }}
                />
              ) : null
            }
            rightSlot={
              <Button type="button" variant="outline" size="sm" disabled>
                خروجی (به‌زودی)
              </Button>
            }
          />
          {tabs?.length ? (
            <QuickTabs
              tabs={tabs}
              currentTabId={params.tab ?? defaultTabId}
              onTabChange={handleTabChange}
              disabled={query.isLoading}
            />
          ) : null}
          {enableSavedViews ? (
            <SavedViews
              storageKey={`${storageKey}-views`}
              enabled={enableSavedViews}
              value={persistedState.savedViewId}
              onSelect={(view) => {
                setSavedViewId(view.id);
                setParams(view.params as Partial<ListParams<TFilters>>);
              }}
              onSave={() => params}
            />
          ) : null}
          {showFilters ? (
            <AdvancedFilterBar
              primaryFilters={
                <>
                  {primaryFiltersConfig.map(renderFilterControl)}
                  {sortOptionsNormalized.length ? (
                    <SortSelect
                      value={currentSortValue}
                      options={sortOptionsNormalized}
                      onChange={(value) => setParams({ sort: parseSortValue(value), page: 1 })}
                      disabled={query.isLoading}
                    />
                  ) : null}
                </>
              }
              secondaryFilters={
                enableAdvancedFilters && secondaryFiltersConfig.length
                  ? secondaryFiltersConfig.map(renderFilterControl)
                  : null
              }
              secondaryCount={enableAdvancedFilters ? secondaryFiltersConfig.length : 0}
              collapsed={!advancedOpen}
              onToggleSecondary={enableAdvancedFilters ? () => setAdvancedOpen((prev) => !prev) : undefined}
              onReset={handleReset}
            />
          ) : null}
          {enableAppliedFiltersBar ? (
            <AppliedFiltersBar
              filters={appliedFilters}
              onRemove={(key) => {
                if (key === "__search") {
                  setLocalSearch("");
                  setParams({ search: undefined, page: 1 });
                  return;
                }
                const nextFilters = normalizeFilters<TFilters>({
                  ...(params.filters as Record<string, unknown>),
                  [key]: undefined,
                });
                setParams({ filters: nextFilters, page: 1 });
              }}
              onClear={() => {
                setLocalSearch("");
                setParams({ filters: undefined, search: undefined, page: 1 });
              }}
            />
          ) : null}
        </div>
      }
      footer={
        meta ? (
          <Pagination
            meta={meta}
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => {
              setParams({ limit, page: 1 });
              setPageSize(limit);
            }}
            disabled={query.isLoading}
          />
        ) : null
      }
    >
      {renderCard ? (
        <div className="space-y-3 md:hidden">
          {query.isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onAction={() => query.refetch()} />
          ) : data.length === 0 ? (
            <EmptyState
              title={emptyState?.title}
              description={emptyState?.description}
              actionLabel={emptyState?.actionLabel}
              onAction={emptyState?.onAction}
            />
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
          density={density}
        />
      </div>
    </TableShell>
  );
}
