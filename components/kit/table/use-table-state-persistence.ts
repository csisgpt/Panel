"use client";

import { useCallback, useEffect, useState } from "react";

interface PersistedTableState {
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  pageSize?: number;
}

/**
 * Persist table state (column visibility/order/page size) in localStorage.
 */
export function useTableStatePersistence(storageKey: string) {
  const [state, setState] = useState<PersistedTableState>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedTableState;
      setState(parsed ?? {});
    } catch {
      setState({});
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: PersistedTableState) => {
      setState(next);
      if (typeof window === "undefined") return;
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const setColumnVisibility = useCallback(
    (columnVisibility: Record<string, boolean>) =>
      persist({ ...state, columnVisibility }),
    [persist, state]
  );

  const setColumnOrder = useCallback(
    (columnOrder: string[]) => persist({ ...state, columnOrder }),
    [persist, state]
  );

  const setPageSize = useCallback(
    (pageSize: number) => persist({ ...state, pageSize }),
    [persist, state]
  );

  return {
    state,
    setColumnVisibility,
    setColumnOrder,
    setPageSize,
  };
}
