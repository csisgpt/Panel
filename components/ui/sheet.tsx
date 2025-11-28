'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return open ? (
    <div className="fixed inset-0 z-50 flex">
      <div className="h-full w-72 translate-x-0 bg-card shadow-2xl transition-transform">
        {children}
      </div>
      <div className="flex-1 bg-black/40" onClick={() => onOpenChange(false)} />
    </div>
  ) : null;
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
