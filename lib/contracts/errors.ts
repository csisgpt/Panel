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
