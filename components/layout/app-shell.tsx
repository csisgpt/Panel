import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  density?: "compact" | "comfortable";
}

export function AppShell({ sidebar, topbar, density = "comfortable", className, children, ...props }: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen w-full bg-muted/30", className)} data-density={density} {...props}>
      {sidebar ? (
        <aside className="hidden w-[260px] border-l bg-card/95 backdrop-blur lg:block">{sidebar}</aside>
      ) : null}
      <div className="flex flex-1 flex-col">
        {topbar ? <div className="border-b bg-card/90 backdrop-blur">{topbar}</div> : null}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
