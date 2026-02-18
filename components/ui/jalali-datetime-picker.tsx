"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormLabel } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

type JalaliDateTimePickerProps = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
};

type JalaliDatePickerProps = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function faDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const toLatin = (input: string) => input.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return {
    year: Number(toLatin(map.year || "0")),
    month: Number(toLatin(map.month || "0")),
    day: Number(toLatin(map.day || "0")),
  };
}

function formatJalaliDateTime(date?: Date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatJalaliDate(date?: Date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getMonthStart(date: Date) {
  const current = new Date(date);
  for (let i = 0; i < 40; i += 1) {
    if (faDateParts(current).day === 1) break;
    current.setDate(current.getDate() - 1);
  }
  return current;
}

function getMonthDays(anchor: Date) {
  const monthStart = getMonthStart(anchor);
  const month = faDateParts(monthStart).month;
  const gridStart = new Date(monthStart);
  const weekday = (gridStart.getDay() + 1) % 7;
  gridStart.setDate(gridStart.getDate() - weekday);

  const days: Array<{ date: Date; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    days.push({ date, inMonth: faDateParts(date).month === month });
  }
  return { monthStart, days };
}

function JalaliCalendar({
  selected,
  onSelect,
  withTime,
  onNow,
  onClear,
}: {
  selected?: Date;
  onSelect: (date: Date) => void;
  withTime?: boolean;
  onNow: () => void;
  onClear: () => void;
}) {
  const [anchor, setAnchor] = useState<Date>(selected ?? new Date());
  const [hour, setHour] = useState((selected ?? new Date()).getHours());
  const [minute, setMinute] = useState((selected ?? new Date()).getMinutes());
  const { monthStart, days } = useMemo(() => getMonthDays(anchor), [anchor]);
  const monthTitle = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "long", year: "numeric" }).format(monthStart);

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" onClick={() => setAnchor((prev) => new Date(prev.setDate(prev.getDate() + 32)))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{monthTitle}</div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setAnchor((prev) => new Date(prev.setDate(prev.getDate() - 32)))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEK_DAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, inMonth }) => {
          const day = faDateParts(date).day;
          const isSelected = selected ? date.toDateString() === selected.toDateString() : false;
          return (
            <button
              key={date.toISOString()}
              type="button"
              className={cn(
                "h-8 rounded-md text-sm",
                inMonth ? "text-foreground" : "text-muted-foreground/50",
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              onClick={() => {
                const next = new Date(date);
                if (withTime) next.setHours(hour, minute, 0, 0);
                onSelect(next);
              }}
            >
              {new Intl.NumberFormat("fa-IR").format(day)}
            </button>
          );
        })}
      </div>
      {withTime ? (
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-md border bg-background px-2 text-sm" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
            {Array.from({ length: 24 }).map((_, idx) => (
              <option key={idx} value={idx}>{new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(idx)}</option>
            ))}
          </select>
          <span>:</span>
          <select className="h-9 rounded-md border bg-background px-2 text-sm" value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
            {Array.from({ length: 60 }).map((_, idx) => (
              <option key={idx} value={idx}>{new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(idx)}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onNow}>اکنون</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>پاک کردن</Button>
      </div>
    </div>
  );
}

function PickerTrigger({ value, placeholder, withTime }: { value?: string; placeholder: string; withTime?: boolean }) {
  const date = value ? new Date(value) : undefined;
  return (
    <div className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm">
      <span className={cn(!date && "text-muted-foreground")}>{withTime ? formatJalaliDateTime(date) : formatJalaliDate(date) || placeholder}</span>
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export function JalaliDatePicker({ value, onChange, disabled, placeholder = "انتخاب تاریخ" }: JalaliDatePickerProps) {
  const selected = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button type="button" className="w-full text-right" disabled={disabled}>
          <PickerTrigger value={value} placeholder={placeholder} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <JalaliCalendar
          selected={selected}
          onSelect={(date) => onChange(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)).toISOString())}
          onNow={() => onChange(new Date().toISOString())}
          onClear={() => onChange(undefined)}
        />
      </PopoverContent>
    </Popover>
  );
}

export function JalaliDateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "انتخاب تاریخ و زمان",
  label = "تاریخ و زمان پرداخت",
}: JalaliDateTimePickerProps) {
  const selected = value ? new Date(value) : undefined;

  return (
    <FormField>
      <FormLabel required>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <button type="button" className="w-full text-right" disabled={disabled}>
            <PickerTrigger value={value} placeholder={placeholder} withTime />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px]">
          <JalaliCalendar
            selected={selected}
            withTime
            onSelect={(date) => onChange(date.toISOString())}
            onNow={() => onChange(new Date().toISOString())}
            onClear={() => onChange(undefined)}
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <button type="button" onClick={() => onChange(undefined)} className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <X className="h-3.5 w-3.5" /> پاک کردن
        </button>
      ) : null}
    </FormField>
  );
}
