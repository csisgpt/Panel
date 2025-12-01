import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TahesabCustomerForm } from "../_components/customer-form";

export const metadata = {
  title: "مشتری جدید تاهساب",
};

export default function TahesabCustomerCreatePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ثبت مشتری جدید</h1>
          <p className="text-sm text-muted-foreground">اطلاعات مشتری را وارد کنید</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/tahesab/customers">بازگشت به لیست</Link>
        </Button>
      </div>

      <TahesabCustomerForm mode="create" />
    </div>
  );
}
