"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full min-w-[280px] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border bg-card p-4 text-foreground shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-border/80",
        destructive: "border-destructive/50 bg-destructive/10 text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
));
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-semibold leading-6", className)} {...props} />
  )
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "ms-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted",
        className
      )}
      aria-label="Dismiss"
      {...props}
    >
      <span aria-hidden>×</span>
    </button>
  )
);
ToastClose.displayName = "ToastClose";

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export type ToastActionElement = React.ReactNode;

export { Toast, ToastTitle, ToastDescription, ToastClose };
