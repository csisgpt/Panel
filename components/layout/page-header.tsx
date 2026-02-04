import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, meta, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-start md:justify-between", className)} {...props}>
      <div className="space-y-2">
        {breadcrumbs ? <div className="text-xs text-muted-foreground">{breadcrumbs}</div> : null}
        {title ? <h1 className="text-2xl font-semibold text-foreground">{title}</h1> : null}
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
