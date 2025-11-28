import { ReactNode } from "react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border border-border/70", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {subtitle && <p className="text-xs text-emerald-500">{subtitle}</p>}
          </div>
          {icon && <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
