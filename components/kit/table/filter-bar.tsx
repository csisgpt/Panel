import React from "react";

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">{children}</div>;
}
