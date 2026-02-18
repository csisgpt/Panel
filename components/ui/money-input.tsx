"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FormError, FormField, FormHint, FormLabel } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  value?: number;
  onChange: (v?: number) => void;
  label?: string;
  placeholder?: string;
  currencyLabel?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

const numberFormatter = new Intl.NumberFormat("fa-IR");

function normalizeDigits(input: string) {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٬,\s]/g, "")
    .replace(/[^\d]/g, "");
}

export function MoneyInput({
  value,
  onChange,
  label = "مبلغ",
  placeholder = "مثلاً ۱٬۵۰۰٬۰۰۰",
  currencyLabel = "تومان",
  min,
  max,
  disabled,
  readOnly,
  error,
  className,
}: MoneyInputProps) {
  const displayValue = useMemo(() => {
    if (value === undefined || Number.isNaN(value)) return "";
    return numberFormatter.format(value);
  }, [value]);

  const hint = useMemo(() => {
    if (min !== undefined || max !== undefined) {
      return `حداقل ${min ? numberFormatter.format(min) : "-"} / حداکثر ${max ? numberFormatter.format(max) : "-"}`;
    }
    if (value && value > 0) return `${displayValue} ${currencyLabel}`;
    return undefined;
  }, [currencyLabel, displayValue, max, min, value]);

  return (
    <FormField className={className}>
      <FormLabel required>{label}</FormLabel>
      <div className="relative">
        <Input
          value={displayValue}
          onChange={(event) => {
            const normalized = normalizeDigits(event.target.value);
            if (!normalized) {
              onChange(undefined);
              return;
            }
            const parsed = Number(normalized);
            if (Number.isNaN(parsed)) return;
            onChange(parsed);
          }}
          placeholder={placeholder}
          inputMode="numeric"
          disabled={disabled}
          readOnly={readOnly}
          className={cn("pe-16", readOnly && "bg-muted")}
        />
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs text-muted-foreground">
          {currencyLabel}
        </span>
      </div>
      {error ? <FormError>{error}</FormError> : hint ? <FormHint>{hint}</FormHint> : null}
    </FormField>
  );
}
