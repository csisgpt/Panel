"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  message?: string;
}

export function LoadingOverlay({ loading = true, message = "در حال بارگذاری...", className, ...props }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 text-sm text-muted-foreground backdrop-blur",
        className
      )}
      {...props}
    >
      <Spinner size="md" />
      {message ? <span>{message}</span> : null}
    </div>
  );
}
