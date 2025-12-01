import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTahesabRawDocumentById } from "@/lib/api/tahesab";

export const metadata = {
  title: "جزئیات سند خام تاهساب",
};

export default async function TahesabRawDocumentDetailPage({ params }: { params: { id: string } }) {
  const doc = await getTahesabRawDocumentById(params.id);

  if (!doc) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">سند {doc.documentNo}</h1>
        <p className="text-sm text-muted-foreground">مشتری: {doc.customerName ?? doc.customerCode ?? "-"}</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>اطلاعات کلی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">تاریخ</p>
            <p className="font-semibold">{new Date(doc.date).toLocaleDateString("fa-IR")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">نوع</p>
            <p className="font-semibold">{doc.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">فلز</p>
            <p className="font-semibold">{doc.metal ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">مبلغ / وزن</p>
            <p className="font-semibold">{doc.amount ?? doc.weight ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>ردیف‌ها</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {doc.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">ردیفی موجود نیست.</p>
          ) : (
            <table className="w-full text-right text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">ردیف</th>
                  <th className="p-2">شرح</th>
                  <th className="p-2">مبلغ</th>
                  <th className="p-2">وزن</th>
                  <th className="p-2">فلز</th>
                </tr>
              </thead>
              <tbody>
                {doc.lines.map((line) => (
                  <tr key={line.rowNo} className="border-t">
                    <td className="p-2">{line.rowNo}</td>
                    <td className="p-2">{line.description ?? "-"}</td>
                    <td className="p-2">{line.amount ?? "-"}</td>
                    <td className="p-2">{line.weight ?? "-"}</td>
                    <td className="p-2">{line.metal ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded bg-muted/40 p-3 text-xs">{JSON.stringify(doc.rawPayload ?? {}, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
