"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Table filter toolbar with optional debounced search and reset action.
 */
export function FilterBar({
  search,
  onSearchChange,
  onReset,
  debounceMs = 300,
  placeholder = "جستجو",
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  onReset?: () => void;
  debounceMs?: number;
  placeholder?: string;
  children?: ReactNode;
}) {
  const [localSearch, setLocalSearch] = useState(search ?? "");

  useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);

  const shouldSearch = useMemo(() => Boolean(onSearchChange), [onSearchChange]);

  useEffect(() => {
    if (!shouldSearch) return;
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localSearch, debounceMs, onSearchChange, shouldSearch]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      {onSearchChange ? (
        <Input
          placeholder={placeholder}
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className="max-w-xs"
        />
      ) : null}
      {children}
      {onReset ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setLocalSearch("");
            onReset();
          }}
        >
          پاک‌سازی
        </Button>
      ) : null}
    </div>
  );
}
