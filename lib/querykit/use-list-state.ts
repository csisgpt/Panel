"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseListParams } from "./parse";
import { serializeListParams } from "./serialize";
import type { ListParams } from "./schemas";
import { withDefaults } from "./schemas";

export type PersistMode = "url" | "localStorage" | "hybrid";

export function useListState<TFilters>({
  defaultParams,
  storageKey,
  persistMode = "url",
}: {
  defaultParams?: Partial<ListParams<TFilters>>;
  storageKey: string;
  persistMode?: PersistMode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [localParams, setLocalParams] = useState<Partial<ListParams<TFilters>> | null>(null);

  useEffect(() => {
    if (persistMode === "url" || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      setLocalParams(JSON.parse(raw) as Partial<ListParams<TFilters>>);
    } catch {
      setLocalParams(null);
    }
  }, [persistMode, storageKey]);

  const urlParams = useMemo(
    () => parseListParams<TFilters>(searchParams, defaultParams),
    [searchParams, defaultParams]
  );

  const storageParams = useMemo(() => {
    return withDefaults(localParams ?? {}, defaultParams);
  }, [localParams, defaultParams]);

  const params = useMemo(() => {
    if (persistMode === "url") return urlParams;
    if (persistMode === "localStorage") return storageParams;
    const hasUrl = searchParams.toString().length > 0;
    return hasUrl ? urlParams : storageParams;
  }, [persistMode, urlParams, storageParams, searchParams]);

  const setParams = useCallback(
    (next: Partial<ListParams<TFilters>>) => {
      const merged = withDefaults({ ...params, ...next }, defaultParams);
      if (persistMode !== "localStorage") {
        const query = serializeListParams(merged);
        router.replace(`${pathname}${query}`);
      }
      if (persistMode !== "url" && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(merged));
        setLocalParams(merged);
      }
    },
    [defaultParams, params, pathname, persistMode, router, storageKey]
  );

  return { params, setParams };
}
