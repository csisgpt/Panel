"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField, FormLabel } from "@/components/ui/form-field";

interface JalaliDateTimePickerProps {
  value?: string;
  onChange: (value?: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  withTime?: boolean;
}

export function JalaliDateTimePicker({
  value,
  onChange,
  label = "تاریخ و زمان پرداخت",
  placeholder = "انتخاب تاریخ...",
  error,
  withTime = true,
}: JalaliDateTimePickerProps) {
  const inputValue = value ? new Date(value).toISOString().slice(0, withTime ? 16 : 10) : "";

  return (
    <FormField>
      <FormLabel required>{label}</FormLabel>
      <div className="space-y-2">
        <Input
          type={withTime ? "datetime-local" : "date"}
          value={inputValue}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value ? new Date(event.target.value).toISOString() : undefined)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(new Date().toISOString())}>
          اکنون
        </Button>
      </div>
      {error ? <FormError>{error}</FormError> : null}
    </FormField>
  );
}
