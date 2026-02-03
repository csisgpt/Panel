"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SavedView<T = unknown> {
  id: string;
  name: string;
  params: T;
}

export interface SavedViewsProps<T = unknown> extends React.HTMLAttributes<HTMLDivElement> {
  storageKey: string;
  enabled?: boolean;
  value?: string;
  onSelect?: (view: SavedView<T>) => void;
  onSave?: (name: string) => T;
}

export function SavedViews<T = unknown>({
  storageKey,
  enabled,
  value,
  onSelect,
  onSave,
  className,
  ...props
}: SavedViewsProps<T>) {
  const [views, setViews] = React.useState<Array<SavedView<T>>>([]);
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      setViews(JSON.parse(raw) as Array<SavedView<T>>);
    } catch {
      setViews([]);
    }
  }, [enabled, storageKey]);

  const persist = (next: Array<SavedView<T>>) => {
    setViews(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  if (!enabled) return null;

  return (
    <div className={cn("space-y-3 rounded-xl border bg-card p-4", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {views.map((view) => (
          <Button
            key={view.id}
            type="button"
            variant={value === view.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect?.(view)}
          >
            {view.name}
          </Button>
        ))}
      </div>
      {onSave ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="نام نما"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!name.trim()) return;
              const newView: SavedView<T> = {
                id: crypto.randomUUID(),
                name: name.trim(),
                params: onSave(name.trim()),
              };
              persist([newView, ...views]);
              setName("");
            }}
          >
            ذخیره نما
          </Button>
        </div>
      ) : null}
    </div>
  );
}
