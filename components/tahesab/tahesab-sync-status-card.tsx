import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TahesabSyncStatus } from "@/lib/types/backend";

interface TahesabSyncStatusCardProps {
  status: (TahesabSyncStatus & { lastErrorAt?: string | null }) | null;
  title?: string;
  description?: string;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("fa-IR");
}

export function TahesabSyncStatusCard({ status, title = "وضعیت اتصال", description }: TahesabSyncStatusCardProps) {
  const connected = status?.connected;
  const lastErrorAt = (status as (TahesabSyncStatus & { lastErrorAt?: string }))?.lastErrorAt ?? status?.pendingSince;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Badge variant={connected ? "success" : status?.errorMessage ? "destructive" : "secondary"}>
          {connected ? "متصل" : status?.errorMessage ? "خطا" : "قطع"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">آخرین تلاش</span>
          <span className="font-semibold">{formatDate(status?.lastSyncedAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">آخرین موفقیت</span>
          <span className="font-semibold">{formatDate(status?.lastSuccessfulSyncAt)}</span>
        </div>
        {lastErrorAt && (
          <div className="flex items-center justify-between text-destructive">
            <span className="text-muted-foreground">آخرین خطا</span>
            <span className="font-semibold">{formatDate(lastErrorAt)}</span>
          </div>
        )}
        {status?.errorMessage && <p className="text-xs text-destructive">{status.errorMessage}</p>}
        {status?.nextScheduledAt && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">سینک بعدی</span>
            <span className="font-semibold">{formatDate(status.nextScheduledAt)}</span>
          </div>
        )}
        {typeof status?.queueLength === "number" && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">آیتم‌های در صف</span>
            <span className="font-semibold">{status.queueLength}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
