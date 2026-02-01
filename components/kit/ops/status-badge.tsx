import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  PENDING: { label: "در انتظار", variant: "warning" },
  APPROVED: { label: "تایید شد", variant: "success" },
  REJECTED: { label: "رد شد", variant: "destructive" },
  CANCELLED: { label: "لغو شد", variant: "secondary" },
  SUBMITTED: { label: "ارسال شد", variant: "default" },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const mapped = statusMap[status] ?? { label: status, variant: "outline" };
  return <Badge variant={mapped.variant}>{label ?? mapped.label}</Badge>;
}
