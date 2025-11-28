import { getMockSystemStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TahesabConnectionPage() {
  const status = await getMockSystemStatus();
  return (
    <Card>
      <CardHeader>
        <CardTitle>وضعیت اتصال تاهساب</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>اتصال آنلاین: {status.tahesabOnline ? "بله" : "خیر"}</div>
        <div>آخرین همگام‌سازی: {status.lastSyncAt}</div>
      </CardContent>
    </Card>
  );
}
