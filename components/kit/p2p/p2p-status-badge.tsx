"use client";

import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "success" | "destructive" }> = {
  ASSIGNED: { label: "تخصیص‌شده", variant: "secondary" },
  PROOF_SUBMITTED: { label: "ثبت رسید", variant: "warning" },
  RECEIVER_CONFIRMED: { label: "تأیید گیرنده", variant: "default" },
  ADMIN_VERIFIED: { label: "تأیید ادمین", variant: "default" },
  FINALIZED: { label: "نهایی", variant: "success" },
  SETTLED: { label: "تسویه", variant: "success" },
  DISPUTED: { label: "اختلاف", variant: "destructive" },
  CANCELLED: { label: "لغو", variant: "destructive" },
  EXPIRED: { label: "منقضی", variant: "destructive" },
};

export function P2PStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant="secondary">-</Badge>;
  const normalized = status.toUpperCase();
  const meta = statusMap[normalized] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
