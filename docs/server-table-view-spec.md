# ServerTableView Spec

## Problem it solves
List pages need a consistent, enterprise-grade “thin assembly” layer that unifies URL state (QueryKit), data fetching (React Query), and TableKit UI (filters/sort/pagination/persistence). ServerTableView provides a single wrapper to standardize list UX, reduce boilerplate, and make backend envelope/meta integration predictable.

## Public API (props)
```ts
ServerTableView<TItem, TFilters = Record<string, unknown>>

props:
  title?: string
  description?: string
  storageKey: string
  columns: ColumnDef<TItem>[]
  queryKeyFactory: (params: ListParams<TFilters>) => unknown[]
  queryFn: (params: ListParams<TFilters>) => Promise<{ items: TItem[]; meta: ListMeta }>
  defaultParams?: Partial<ListParams<TFilters>>
  tabs?: Array<{ id: string; label: string; hint?: string; paramsPatch: Partial<ListParams<TFilters>> }>
  filtersConfig?: Array<...> // MVP: search/status/date/amount stubs
  sortOptions?: Array<{ key: string; label: string; defaultDir?: "asc" | "desc" }>
  rowActions?: (row: TItem) => ReactNode
  getRowId?: (row: TItem) => string
  emptyState?: { title: string; description?: string; actionLabel?: string; onAction?: () => void }
  refetchIntervalMs?: number
```

## URL param contract
ServerTableView uses the following QueryKit contract (all URL-driven, shareable, back/forward safe):
- `page` (number)
- `limit` (number)
- `search` (string | undefined)
- `sort.key` (string | undefined)
- `sort.dir` ("asc" | "desc" | undefined)
- `filters` (Record<string, unknown> | undefined)
- `tab` (string | undefined)

Defaults are applied via `withDefaults(params)` and removed via `cleanDefaults(params)` to keep URLs short.

## Composition
- **QueryKit**: parse/serialize list params, apply defaults, clean defaults.
- **React Query**: `queryKeyFactory` + `queryFn` are called with cleaned params.
- **TableKit**: FilterBar, SortSelect, QuickTabs, DataTable, Pagination, and column persistence.
- **Common states**: ErrorState / EmptyState / LoadingState.

## Examples (pseudocode)
```tsx
<ServerTableView
  storageKey="withdrawals.list"
  title="Withdrawals"
  columns={columns}
  queryKeyFactory={(params) => ["withdrawals", params]}
  queryFn={(params) => listWithdrawals(params)}
  sortOptions={[{ key: "createdAt", label: "Newest", defaultDir: "desc" }]}
  tabs={[
    { id: "all", label: "All", paramsPatch: {} },
    { id: "pending", label: "Pending", paramsPatch: { filters: { status: "PENDING" } } },
  ]}
/>
```

```ts
// Backend integration example
const queryFn = async (params: ListParams) => {
  const { items, meta } = await listWithdrawals(params)
  return { items, meta }
}
```

## Sort key mapping (backend-ready)
- UI sort keys map directly to backend sort fields (e.g. `createdAt` → `createdAt`).
- ServerTableView serializes `sort.key`/`sort.dir` in URL and passes the same object to `queryFn`.
- Keep backend mapping explicit by translating keys inside `queryFn` if needed.
