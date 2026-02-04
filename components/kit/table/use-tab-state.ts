"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TabStateOptions {
  defaultTab: string;
  paramKey?: string;
  storageKey?: string;
}

export function useTabState({ defaultTab, paramKey = "tab", storageKey }: TabStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get(paramKey);
  const [tab, setTabState] = useState(urlTab ?? defaultTab);

  const serializedParams = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    if (urlTab && urlTab !== tab) {
      setTabState(urlTab);
    }
  }, [tab, urlTab]);

  useEffect(() => {
    if (urlTab) return;
    if (typeof window === "undefined") return;
    const stored = storageKey ? window.localStorage.getItem(storageKey) : null;
    const next = stored || defaultTab;
    setTabState(next);
    const params = new URLSearchParams(serializedParams);
    params.set(paramKey, next);
    router.replace(`${pathname}?${params.toString()}`);
  }, [defaultTab, paramKey, pathname, router, serializedParams, storageKey, urlTab]);

  const setTab = (next: string) => {
    setTabState(next);
    if (typeof window !== "undefined" && storageKey) {
      window.localStorage.setItem(storageKey, next);
    }
    const params = new URLSearchParams(serializedParams);
    params.set(paramKey, next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { tab, setTab };
}
