"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export function FormField({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, required, children, ...props }: React.HTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <Label className={cn("flex items-center gap-1 text-sm", className)} {...props}>
      {children}
      {required ? <span className="text-xs text-destructive">*</span> : null}
    </Label>
  );
}

export function FormHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

export function FormError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-destructive", className)} {...props} />;
}

export function FormRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4 md:grid-cols-2", className)} {...props} />;
}
