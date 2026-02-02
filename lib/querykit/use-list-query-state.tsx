"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseListParams } from "./parse";
import { serializeListParams } from "./serialize";
import type { ListParams } from "./schemas";
import { withDefaults } from "./schemas";

export function useListQueryState<TFilters = Record<string, unknown>>({
  defaultParams,
}: {
  defaultParams?: Partial<ListParams<TFilters>>;
} = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(
    () => parseListParams<TFilters>(searchParams, defaultParams),
    [searchParams, defaultParams]
  );

  const setParams = (next: Partial<ListParams<TFilters>>) => {
    const merged = withDefaults({ ...params, ...next }, defaultParams);
    const query = serializeListParams(merged);
    router.replace(`${pathname}${query}`);
  };

  return { params, setParams };
}
