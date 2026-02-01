import { z } from "zod";
import { listParamsDefaults, type ListParams, type SortDir, withDefaults } from "./schemas";

const rawParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  sortKey: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  sort: z.string().optional(),
  filters: z.string().optional(),
  tab: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  hasProof: z.coerce.boolean().optional(),
  expiresSoon: z.coerce.boolean().optional(),
});

function parseFilters(raw?: string) {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    return undefined;
  } catch {
    return undefined;
  }
}

function parseLegacySort(raw?: string) {
  if (!raw) return undefined;
  const parts = raw.split("_");
  const last = parts[parts.length - 1];
  if (last === "asc" || last === "desc") {
    return { key: parts.slice(0, -1).join("_"), dir: last as SortDir };
  }
  return { key: raw, dir: "desc" as SortDir };
}

export function parseListParams<TFilters = Record<string, unknown>>(
  searchParams: URLSearchParams,
  defaults: Partial<ListParams<TFilters>> = listParamsDefaults
): ListParams<TFilters> {
  const raw = rawParamsSchema.parse(Object.fromEntries(searchParams.entries()));
  const sort =
    raw.sortKey
      ? { key: raw.sortKey, dir: raw.sortDir ?? "desc" }
      : parseLegacySort(raw.sort);
  const filtersFromJson = parseFilters(raw.filters);
  const legacyFilters: Record<string, unknown> = {};
  if (raw.status) legacyFilters.status = raw.status;
  if (raw.startDate) legacyFilters.startDate = raw.startDate;
  if (raw.endDate) legacyFilters.endDate = raw.endDate;
  if (raw.minAmount !== undefined) legacyFilters.minAmount = raw.minAmount;
  if (raw.maxAmount !== undefined) legacyFilters.maxAmount = raw.maxAmount;
  if (raw.hasProof !== undefined) legacyFilters.hasProof = raw.hasProof;
  if (raw.expiresSoon !== undefined) legacyFilters.expiresSoon = raw.expiresSoon;
  const mergedFilters = { ...legacyFilters, ...(filtersFromJson ?? {}) };
  const filters = Object.keys(mergedFilters).length ? (mergedFilters as TFilters) : undefined;

  return withDefaults(
    {
      page: raw.page,
      limit: raw.limit,
      search: raw.search,
      sort,
      filters,
      tab: raw.tab,
    },
    defaults
  );
}
