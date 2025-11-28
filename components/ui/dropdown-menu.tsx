"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: { label: string; onSelect?: () => void }[];
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
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
    <div ref={menuRef} className="relative inline-block text-right">
      <button type="button" onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </button>
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border bg-card p-2 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onSelect?.();
                setOpen(false);
              }}
              className={cn("w-full rounded-lg px-3 py-2 text-sm text-right transition hover:bg-muted")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
