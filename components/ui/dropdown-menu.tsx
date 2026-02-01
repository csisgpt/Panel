"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-right">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return children;
  const triggerProps = {
    onClick: () => context.setOpen(!context.open),
  };
  if (asChild) {
    return React.cloneElement(children, { ...triggerProps, ...children.props });
  }
  return (
    <button type="button" {...triggerProps} className="cursor-pointer">
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align,
  children,
}: {
  align?: "start" | "center" | "end";
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;
  const alignment = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";
  return (
    <div className={cn("absolute z-50 mt-2 w-48 overflow-hidden rounded-xl border bg-card p-2 shadow-lg", alignment)}>
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  children,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange?.(!checked)}
      className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-muted")}
    >
      <span>{children}</span>
      {checked ? <span>✓</span> : null}
    </button>
  );
}
