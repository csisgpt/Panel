import { Badge } from "@/components/ui/badge";

export function ProofChip() {
  return <Badge variant="success">رسید دارد</Badge>;
}

export function DisputeChip() {
  return <Badge variant="destructive">اعتراض فعال</Badge>;
}

export function UrgentChip() {
  return <Badge variant="warning">فوری</Badge>;
}
