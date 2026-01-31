"use client";

import { Button } from "@/components/ui/button";
import type { ListMeta } from "@/lib/contracts/list";

export function Pagination({ meta, onPageChange }: { meta: ListMeta; onPageChange: (page: number) => void }) {
  const totalPages = meta.totalPages ?? Math.ceil(meta.total / meta.limit);
  return (
    <div className="flex items-center justify-between text-sm">
      <span>
        صفحه {meta.page} از {totalPages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
