"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full min-w-[280px] max-w-sm items-center gap-3 rounded-2xl border bg-card p-4 text-foreground shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-border/80",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// این پروپ‌ها فقط برای خود Toast wrapper هستن؛
// عمداً HTMLAttributes رو extend نمی‌کنیم که title قاطی نشه.
export interface ToastProps extends VariantProps<typeof toastVariants> {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any; // بقیه چیزها مثل open, onOpenChange, title, description, action فقط حمل می‌شن، به <div> پاس داده نمی‌شن
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, children }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
    >
      {children}
    </div>
  )
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export interface ToastCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-medium opacity-70 transition hover:opacity-100",
        className
      )}
      {...props}
    >
      {children ?? "×"}
    </button>
  )
);
ToastClose.displayName = "ToastClose";

export type ToastActionElement = React.ReactNode;

export { Toast, ToastTitle, ToastDescription, ToastClose };