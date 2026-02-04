import * as React from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

const gapMap: Record<NonNullable<StackProps["gap"]>, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function Stack({ direction = "column", gap = "md", className, ...props }: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapMap[gap],
        className
      )}
      {...props}
    />
  );
}
