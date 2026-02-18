"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField, FormLabel } from "@/components/ui/form-field";

export type JalaliDateTimePickerProps = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
};

function formatForInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function parseFromInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function JalaliDateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "انتخاب تاریخ و زمان",
  label = "تاریخ و زمان پرداخت",
  error,
}: JalaliDateTimePickerProps) {
  const preview = value
    ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "";

  return (
    <FormField>
      <FormLabel required>{label}</FormLabel>
      <div className="space-y-2" dir="rtl">
        <Input
          type="datetime-local"
          value={formatForInput(value)}
          onChange={(event) => onChange(parseFromInput(event.target.value))}
          placeholder={placeholder}
          disabled={disabled}
        />
        {preview ? <p className="text-xs text-muted-foreground">نمایش شمسی: {preview}</p> : null}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(new Date().toISOString())} disabled={disabled}>
            اکنون
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)} disabled={disabled || !value}>
            پاک کردن
          </Button>
        </div>
      </div>
      {error ? <FormError>{error}</FormError> : null}
    </FormField>
  );
}
