import * as React from "react";
import { cn } from "@/lib/utils";

export interface TableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchSlot?: React.ReactNode;
  columnsSlot?: React.ReactNode;
  densitySlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function TableToolbar({ searchSlot, columnsSlot, densitySlot, rightSlot, className, ...props }: TableToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {searchSlot}
        {columnsSlot}
        {densitySlot}
      </div>
      {rightSlot ? <div className="flex flex-wrap items-center gap-2">{rightSlot}</div> : null}
    </div>
  );
}
