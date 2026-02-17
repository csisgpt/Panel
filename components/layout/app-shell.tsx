import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  density?: "compact" | "comfortable";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppShell({
  sidebar,
  topbar,
  density = "comfortable",
  collapsed,
  className,
  children,
  ...props
}: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-muted/30 text-foreground",
        className
      )}
      data-density={density}
      {...props}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
        {sidebar ? (
          <aside
            className={cn(
              "hidden h-screen shrink-0 border-l bg-card/95 backdrop-blur lg:sticky lg:top-0 lg:block",
              collapsed ? "w-[70px]" : "w-[280px]"
            )}
          >
            {sidebar}
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {topbar ? (
            <div className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
              {topbar}
            </div>
          ) : null}

          <main className="min-w-0 flex-1 bg-background">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
