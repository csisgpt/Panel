"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

const innerInsetMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "inset-[2px]",
  md: "inset-[3px]",
  lg: "inset-[4px]",
};

export function Spinner({
  size = "md",
  label = "در حال بارگذاری",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative inline-flex items-center justify-center", sizeMap[size], className)}
      {...props}
    >
      {/* حلقه‌ی گرادیانی */}
      <div
        className={cn(
          "absolute inset-0 rounded-full motion-safe:animate-spin",
          "bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0deg,hsl(var(--accent))_140deg,transparent_320deg)]"
        )}
      />

      {/* کات‌آوت */}
      <div className={cn("absolute rounded-full bg-background", innerInsetMap[size])} />

      {/* رینگ ظریف */}
      <div className="absolute inset-0 rounded-full ring-1 ring-border/60" />

      <span className="sr-only">{label}</span>
    </div>
  );
}
