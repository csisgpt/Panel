"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function InputGroup({ prefix, suffix, className, children, ...props }: InputGroupProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-1.5", className)} {...props}>
      {prefix ? <div className="text-sm text-muted-foreground">{prefix}</div> : null}
      <div className="flex-1">{children}</div>
      {suffix ? <div className="text-sm text-muted-foreground">{suffix}</div> : null}
    </div>
  );
}
