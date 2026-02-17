import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "full";
}

const sizeMap: Record<NonNullable<PageShellProps["size"]>, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

export function PageShell({ className, size = "default", ...props }: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full space-y-6 p-4 sm:px-6 lg:px-8 max-h-[calc(100vh-66px)] overflow-hidden flex flex-col h-full", className)} {...props} />
  );
}
