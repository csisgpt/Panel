import type { PropsWithChildren } from "react";

export function FormSection({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
