import dayjs from "dayjs";
import jalaliday from "jalaliday";
import relativeTime from "dayjs/plugin/relativeTime";

let initialized = false;

function ensureDayjs() {
  if (initialized) return;
  dayjs.extend(jalaliday);
  dayjs.extend(relativeTime);
  initialized = true;
}

function parseDate(date: string | Date) {
  ensureDayjs();
  const parsed = dayjs(date);
  if (!parsed.isValid()) return null;
  return parsed;
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatRelativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, "hour");
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");
  return rtf.format(diffSec, "second");
}

export function formatJalali(date: string | Date, format = "YYYY/MM/DD"): string {
  const parsed = parseDate(date);
  if (!parsed) return "";
  return parsed.calendar("jalali").locale("fa").format(format);
}

export function formatJalaliDateTime(date: string | Date): string {
  return formatJalali(date, "YYYY/MM/DD HH:mm");
}

export function formatRelativeJalali(date: string | Date): string {
  const parsed = parseDate(date);
  if (!parsed) return "";
  return parsed.calendar("jalali").locale("fa").fromNow();
}
