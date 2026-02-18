"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField, FormHint, FormLabel } from "@/components/ui/form-field";

type MaskType = "bankRef" | "card" | "iban" | "account" | "numeric";

interface MaskedInputProps {
  maskType: MaskType;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  copyValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  hint?: string;
}

const onlyDigits = (v: string) =>
  v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

function applyMask(type: MaskType, raw: string) {
  const digits = onlyDigits(raw);
  if (type === "card") return digits.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  if (type === "iban") {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 26);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  }
  if (type === "bankRef" || type === "numeric") return digits;
  if (type === "account") return digits.slice(0, 24);
  return raw;
}

export function MaskedInput({
  maskType,
  value,
  onChange,
  label,
  placeholder,
  copyValue,
  disabled,
  readOnly,
  error,
  hint,
}: MaskedInputProps) {
  return (
    <FormField>
      {label ? <FormLabel>{label}</FormLabel> : null}
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => onChange(applyMask(maskType, event.target.value))}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className="pe-10"
        />
        {copyValue ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute inset-y-0 end-1 my-auto h-8 w-8"
            onClick={() => navigator.clipboard.writeText(copyValue)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {error ? <FormError>{error}</FormError> : hint ? <FormHint>{hint}</FormHint> : null}
    </FormField>
  );
}
