import dayjs from "dayjs";
import jalaliday from "jalaliday";
import relativeTime from "dayjs/plugin/relativeTime";

let initialized = false;

function ensureDayjs() {
  if (initialized) return;
  dayjs.extend(jalaliday);
  dayjs.extend(relativeTime);
  dayjs.locale("fa");
  initialized = true;
}

function toDayjs(date: string | Date) {
  ensureDayjs();
  const parsed = dayjs(date);
  if (!parsed.isValid()) return null;
  return parsed.calendar("jalali");
}

export function formatJalali(date: string | Date, format = "YYYY/MM/DD"): string {
  const parsed = toDayjs(date);
  if (!parsed) return "";
  return parsed.format(format);
}

export function formatJalaliDateTime(date: string | Date): string {
  return formatJalali(date, "YYYY/MM/DD HH:mm");
}

export function formatRelativeJalali(date: string | Date): string {
  const parsed = toDayjs(date);
  if (!parsed) return "";
  return parsed.fromNow();
}
