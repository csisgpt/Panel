import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function Toolbar({ left, right, className, ...props }: ToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}
