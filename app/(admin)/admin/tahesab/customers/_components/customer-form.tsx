"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createTahesabCustomer,
  getTahesabCustomers,
  updateTahesabCustomer,
  type TahesabCustomer,
} from "@/lib/api/tahesab";

interface CustomerFormProps {
  mode: "create" | "edit";
  initialData?: TahesabCustomer | null;
}

export function TahesabCustomerForm({ mode, initialData }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [groupOptions, setGroupOptions] = useState<Record<string, string>>(() => {
    if (!initialData?.groupId || !initialData.groupName) return {};
    return { [initialData.groupId]: initialData.groupName };
  });

  const {
    register,
    handleSubmit,
    formState,
    reset,
    getValues,
  } = useForm<TahesabCustomer>({
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      groupId: initialData?.groupId,
      groupName: initialData?.groupName,
      mobile: initialData?.mobile,
      nationalId: initialData?.nationalId,
      city: initialData?.city,
      address: (initialData as any)?.address,
      defaultMetal: initialData?.defaultMetal,
    },
  });

  const selectedGroupName = useMemo(
    () => (initialData?.groupId && initialData.groupName ? { id: initialData.groupId, name: initialData.groupName } : null),
    [initialData?.groupId, initialData?.groupName]
  );

  const loadGroups = async () => {
    try {
      const existing = await getTahesabCustomers();
      const map: Record<string, string> = {};
      existing.forEach((c) => {
        if (c.groupId && c.groupName) map[c.groupId] = c.groupName;
      });
      setGroupOptions(map);
    } catch (err) {
      // ignore silently
    }
  };

  const onSubmit = async (values: TahesabCustomer) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createTahesabCustomer(values);
        toast({ title: "مشتری ایجاد شد", description: created.name });
        reset();
        router.push(`/admin/tahesab/customers/${created.code}`);
        return;
      }

      if (initialData?.code) {
        const updated = await updateTahesabCustomer(initialData.code, values);
        toast({ title: "ذخیره شد", description: updated.name });
        router.push(`/admin/tahesab/customers/${initialData.code}`);
      }
    } catch (err) {
      toast({
        title: "خطا",
        description: "ذخیره اطلاعات ناموفق بود.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">نام</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="نام مشتری" />
              {formState.errors.name && <p className="text-xs text-destructive">نام الزامی است.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupId">گروه</Label>
              <Select
                onOpenChange={(open) => {
                  if (open && Object.keys(groupOptions).length === 0) loadGroups();
                }}
                defaultValue={initialData?.groupId}
                onValueChange={(value) =>
                  reset({
                    ...getValues(),
                    groupId: value,
                    groupName: groupOptions[value] ?? getValues().groupName,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedGroupName?.name ?? "انتخاب گروه"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupOptions).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                  {Object.keys(groupOptions).length === 0 && (
                    <SelectItem value="none" disabled>
                      گروهی یافت نشد
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">موبایل</Label>
              <Input id="mobile" {...register("mobile")} placeholder="0912xxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">کد ملی</Label>
              <Input id="nationalId" {...register("nationalId")} placeholder="کد ملی" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input id="city" {...register("city")} placeholder="شهر" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultMetal">فلز پیش‌فرض</Label>
              <Input id="defaultMetal" {...register("defaultMetal")} placeholder="مثلاً طلا" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea id="address" {...register("address")} rows={3} placeholder="آدرس کامل" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "در حال ذخیره..." : mode === "create" ? "ایجاد" : "ذخیره"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
