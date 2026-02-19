"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  title?: string;
  message?: string;
  mode?: "absolute" | "fixed";
  size?: "sm" | "md" | "lg";

  /** CTAها */
  showActions?: boolean;
  primaryLabel?: string;            // پیش‌فرض: رفرش صفحه
  secondaryLabel?: string;          // پیش‌فرض: بازگشت به داشبورد
  onPrimaryAction?: () => void;     // اگر ندی => window.location.reload()
  onSecondaryAction?: () => void;   // اگر ندی و secondaryHref بدی => router.push
  secondaryHref?: string;           // مثل "/admin" یا "/trader"
}

const sizeCardMap: Record<NonNullable<LoadingOverlayProps["size"]>, string> = {
  sm: "max-w-[360px]",
  md: "max-w-[420px]",
  lg: "max-w-[520px]",
};

export function LoadingOverlay({
  loading = true,
  title = "کمی صبر کنید",
  message = "در حال بارگذاری",
  mode = "absolute",
  size = "md",

  showActions = true,
  primaryLabel = "رفرش صفحه",
  secondaryLabel = "بازگشت به داشبورد",
  onPrimaryAction,
  onSecondaryAction,
  secondaryHref,

  className,
  ...props
}: LoadingOverlayProps) {
  const router = useRouter();
  if (!loading) return null;

  const handlePrimary = () => {
    if (onPrimaryAction) return onPrimaryAction();
    // safe default
    window.location.reload();
  };

  const handleSecondary = () => {
    if (onSecondaryAction) return onSecondaryAction();
    if (secondaryHref) return router.push(secondaryHref);
    // safe default: back
    router.back();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        mode === "fixed" ? "fixed" : "absolute",
        "inset-0 z-dialog",
        "flex items-center justify-center",
        "p-4 sm:p-6",
        "bg-background/55 supports-[backdrop-filter]:bg-background/45 backdrop-blur-lg",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200",
        className
      )}
      {...props}
    >
      <div className={cn("w-full max-w-[92vw] sm:max-w-[420px]", sizeCardMap[size])}>
        {/* Gradient border wrapper */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent p-[1px]">
          <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl soft-shadow">
            {/* soft glows */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            <div
              className={cn(
                "relative p-5 sm:p-6",
                "flex flex-col sm:flex-row sm:items-start gap-4",
                "text-center sm:text-right"
              )}
            >
              {/* icon */}
              <div className="mx-auto sm:mx-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background/60">
                  <Spinner size="md" />
                </div>
              </div>

              {/* content */}
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {title} <span className="text-muted-foreground/80"><LoadingDots /></span>
                </div>

                {message ? (
                  <div className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {message}
                  </div>
                ) : null}

                {/* progress (indeterminate) */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/70">
                  <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/80 via-accent/70 to-primary/80 motion-safe:animate-pulse" />
                </div>

                {/* skeleton */}
                <div className="mt-4 grid gap-2">
                  <div className="h-2 w-5/6 mx-auto sm:mx-0 rounded-full bg-muted/75 motion-safe:animate-pulse" />
                  <div className="h-2 w-2/3 mx-auto sm:mx-0 rounded-full bg-muted/60 motion-safe:animate-pulse" />
                </div>

                {/* small hint */}
                <div className="mt-4 text-[11px] sm:text-xs text-muted-foreground/80">
                  اگر طول کشید، اتصال اینترنت یا وضعیت سرور را بررسی کنید.
                </div>
              </div>

            </div>
            {/* actions */}
            {showActions ? (
              <div className="mt-5 flex flex-col-reverse item-center justify-center gap-2 px-4 pb-2 [&>*]:w-full sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleSecondary}
                >
                  {secondaryLabel}
                </Button>

                <Button
                  type="button"
                  variant="default"
                  className="w-full sm:w-auto"
                  onClick={handlePrimary}
                >
                  {primaryLabel}
                </Button>
              </div>
            ) : null}

            {/* top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
