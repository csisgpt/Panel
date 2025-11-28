'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const toastVariants = cva(
  "pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-card p-4 shadow-lg",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />;
  }
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(\
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
ToastDescription.displayName = "ToastDescription";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export type ToastActionElement = React.ReactNode;

export { Toast, ToastTitle, ToastDescription };
