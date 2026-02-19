import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  PENDING: { label: "در انتظار", variant: "warning" },
  WAITING_ASSIGNMENT : {label: "در انتظار تخصیص مقصد", variant: "warning"} ,
  APPROVED: { label: "تایید شد", variant: "success" },
  REJECTED: { label: "رد شد", variant: "destructive" },
  CANCELLED: { label: "لغو شد", variant: "secondary" },
  SUBMITTED: { label: "ارسال شد", variant: "default" },
  ASSIGNED: { label: "تخصیص شد", variant: "secondary" },
  PROOF_SUBMITTED: { label: "رسید ثبت شد", variant: "warning" },
  RECEIVER_CONFIRMED: { label: "تایید گیرنده", variant: "success" },
  DISPUTED: { label: "اختلاف", variant: "destructive" },
  FINALIZED: { label: "نهایی شد", variant: "success" },
  ADMIN_VERIFIED: { label: "بررسی شد", variant: "success" },
  SETTLED: { label: "تسویه شد", variant: "success" },
  EXPIRED: { label: "منقضی", variant: "secondary" },
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const mapped = statusMap[status] ?? { label: status, variant: "outline" };
  return <Badge variant={mapped.variant}>{label ?? mapped.label}</Badge>;
}
