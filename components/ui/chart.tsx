import { cn } from "@/lib/utils";

export function ChartContainer({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-soft", className)}>
      {title && <div className="mb-3 text-sm font-medium text-muted-foreground">{title}</div>}
      {children}
    </div>
  );
}
