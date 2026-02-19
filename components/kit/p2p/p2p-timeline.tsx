"use client";

type TimelineItem = {
  label: string;
  value?: string | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function P2PTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span>{formatDateTime(item.value)}</span>
        </div>
      ))}
    </div>
  );
}
