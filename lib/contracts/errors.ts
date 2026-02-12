export type ApiFieldError = { path: string; message: string };

export interface ApiError {
  status: number;
  code?: string;
  message: string;
  traceId?: string;
  details?: unknown | ApiFieldError[];
}

export function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.message === "string" && typeof record.status === "number";
}

export function getFieldErrorMap(details: unknown): Record<string, string> {
  if (!Array.isArray(details)) return {};
  return details.reduce<Record<string, string>>((acc, item) => {
    if (!item || typeof item !== "object") return acc;
    const entry = item as ApiFieldError;
    if (typeof entry.path === "string" && typeof entry.message === "string") {
      acc[entry.path] = entry.message;
    }
    return acc;
  }, {});
}

const errorFaMap: Record<string, string> = {
  VALIDATION_ERROR: "داده‌های ورودی معتبر نیست.",
  UNAUTHORIZED: "دسترسی غیرمجاز.",
  FORBIDDEN: "شما دسترسی لازم را ندارید.",
  NOT_FOUND: "موردی یافت نشد.",
  CONFLICT: "تعارض در داده‌ها رخ داده است.",
  USER_NOT_FOUND: "کاربر یافت نشد.",
  GROUP_HAS_USERS: "این گروه دارای کاربر است و قابل حذف نیست.",
  GROUP_DEFAULT_CANNOT_DELETE: "گروه پیش‌فرض قابل حذف نیست.",
  KYC_INVALID_FILE_IDS: "شناسه فایل‌های KYC معتبر نیست.",
  KYC_FILES_FORBIDDEN: "فایل‌های انتخاب‌شده برای شما مجاز نیست.",
  TAHESAB_DISABLED: "اتصال ته‌حساب غیرفعال است.",
  TAHESAB_CUSTOMER_CODE_REQUIRED: "کد مشتری ته‌حساب برای کاربر ثبت نشده است.",
};

export function formatApiErrorFa(error: unknown, fallback = "خطایی رخ داده است.") {
  if (!isApiError(error)) return fallback;
  if (error.code && errorFaMap[error.code]) return errorFaMap[error.code];
  return error.message || fallback;
}
