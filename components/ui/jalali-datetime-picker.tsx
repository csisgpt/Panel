"use client";

import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel } from "@/components/ui/form-field";
import { toBackendDateTime } from "@/lib/date/jalali-serialization";

export type JalaliDateTimePickerProps = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
};

function toDateObject(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new DateObject({ date: parsed, calendar: persian, locale: persianFa });
}

export function JalaliDateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "انتخاب تاریخ و زمان",
  label = "تاریخ و زمان پرداخت",
}: JalaliDateTimePickerProps) {
  return (
    <FormField>
      <FormLabel required>{label}</FormLabel>
      <div className="space-y-2" dir="rtl">
        <DatePicker
          value={toDateObject(value)}
          onChange={(date) => {
            if (!date) {
              onChange(undefined);
              return;
            }
            onChange(toBackendDateTime((date as DateObject).toDate()));
          }}
          calendar={persian}
          locale={persianFa}
          calendarPosition="bottom-right"
          format="YYYY/MM/DD - HH:mm"
          inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          containerClassName="w-full"
          disabled={disabled}
          editable={false}
          placeholder={placeholder}
          plugins={[]}
          timePicker
          timePickerPosition="bottom"
        />
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onChange(toBackendDateTime(new Date()))} disabled={disabled}>
            اکنون
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)} disabled={disabled || !value}>
            پاک کردن
          </Button>
        </div>
      </div>
    </FormField>
  );
}
