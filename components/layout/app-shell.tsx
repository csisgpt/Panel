import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
}

export function AppShell({ sidebar, topbar, className, children, ...props }: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen w-full bg-background", className)} {...props}>
      {sidebar ? <aside className="hidden w-64 border-l bg-card lg:block">{sidebar}</aside> : null}
      <div className="flex flex-1 flex-col">
        {topbar ? <div className="border-b bg-card">{topbar}</div> : null}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
