"use client";

import { X } from "lucide-react";
import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { Button } from "@/components/ui/button";

export type JalaliDatePickerProps = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

function toDateObject(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new DateObject({ date: parsed, calendar: persian, locale: persianFa });
}

export function JalaliDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "انتخاب تاریخ",
}: JalaliDatePickerProps) {
  return (
    <div className="space-y-1" dir="rtl">
      <DatePicker
        value={toDateObject(value)}
        onChange={(date) => {
          if (!date) {
            onChange(undefined);
            return;
          }
          const selected = (date as DateObject).toDate();
          onChange(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).toISOString());
        }}
        calendar={persian}
        locale={persianFa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD"
        inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
        containerClassName="w-full"
        disabled={disabled}
        editable={false}
        placeholder={placeholder}
      />
      {value ? (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onChange(undefined)} disabled={disabled}>
          <X className="h-3.5 w-3.5" />
          پاک کردن
        </Button>
      ) : null}
    </div>
  );
}
