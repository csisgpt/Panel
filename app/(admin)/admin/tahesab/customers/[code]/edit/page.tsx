import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getTahesabCustomerByCode } from "@/lib/api/tahesab";
import { TahesabCustomerForm } from "../../_components/customer-form";

export const metadata = {
  title: "ویرایش مشتری تاهساب",
};

export default async function TahesabCustomerEditPage({ params }: { params: { code: string } }) {
  const customer = await getTahesabCustomerByCode(params.code);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ویرایش مشتری</h1>
          <p className="text-sm text-muted-foreground">کد: {params.code}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/tahesab/customers/${params.code}`}>بازگشت به پروفایل</Link>
        </Button>
      </div>
      <TahesabCustomerForm mode="edit" initialData={customer} />
    </div>
  );
}
