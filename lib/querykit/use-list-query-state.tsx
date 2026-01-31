"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { listParamsSchema, type ListParams } from "./schemas";

export function useListQueryState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    return listParamsSchema.parse(raw);
  }, [searchParams]);

  const setParams = (next: Partial<ListParams>) => {
    const merged = { ...params, ...next };
    const validated = listParamsSchema.parse(merged);
    const updated = new URLSearchParams();
    Object.entries(validated).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      updated.set(key, String(value));
    });
    router.replace(`${pathname}?${updated.toString()}`);
  };

  return { params, setParams };
}
