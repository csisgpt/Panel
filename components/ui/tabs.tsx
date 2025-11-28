'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ items, defaultValue }: { items: TabItem[]; defaultValue?: string }) {
  const [active, setActive] = React.useState(defaultValue ?? items[0]?.value);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-2">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => setActive(item.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active === item.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">
        {items.find((item) => item.value === active)?.content}
      </div>
    </div>
  );
}
