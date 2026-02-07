"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListMeta } from "@/lib/contracts/list";

/**
 * Meta-driven pagination controls for server lists.
 */
export function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  disabled = false,
}: {
  meta: ListMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  disabled?: boolean;
}) {
  const totalPages = meta.totalPages ?? Math.ceil(meta.total / meta.limit);
  const hasPrev = meta.hasPrevPage ?? meta.page > 1;
  const hasNext = meta.hasNextPage ?? meta.page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span>
        صفحه {meta.page} از {totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange ? (
          <Select
            value={String(meta.limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="تعداد در صفحه" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((limit) => (
                <SelectItem key={limit} value={String(limit)}>
                  {limit} در صفحه
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
