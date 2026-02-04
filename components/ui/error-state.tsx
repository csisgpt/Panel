"use client";

import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title = "خطایی رخ داد", description, actionLabel = "تلاش مجدد", onAction, className, ...props }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-destructive/5 p-8 text-center", className)} {...props}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-destructive">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
