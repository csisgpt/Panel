'use client';

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }

  return context;
}

export function Tabs({ items, defaultValue }: { items: TabItem[]; defaultValue?: string }) {
  const [active, setActive] = React.useState(defaultValue ?? items[0]?.value ?? "");

  return (
    <TabsContext.Provider value={{ value: active, setValue: setActive }}>
      <div className="w-full">
        <TabsList>
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            {item.content}
          </TabsContent>
        ))}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex flex-wrap gap-2 rounded-2xl bg-muted/60 p-2", className)}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: active, setValue } = useTabsContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: active } = useTabsContext();

  if (active !== value) return null;

  return <div className="rounded-2xl border bg-card/70 p-4 shadow-sm">{children}</div>;
}

export function TabsRoot({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) {
  const [active, setActive] = React.useState(defaultValue ?? "");

  return <TabsContext.Provider value={{ value: active, setValue: setActive }}>{children}</TabsContext.Provider>;
}
