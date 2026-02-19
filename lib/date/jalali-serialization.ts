// Backend contract notes document `createdFrom/createdTo/paidFrom/paidTo` and `paidAt` as ISO-8601.
// Source: docs/backend-contract-notes.md sections "P2P Admin Allocations" and "User Allocations".
export type BackendDateMode = "ISO" | "YMD_GREGORIAN";

export const BACKEND_FILTER_DATE_MODE: BackendDateMode = "ISO";
export const BACKEND_PAIDAT_MODE: BackendDateMode = "ISO";

export function toBackendDateTime(value: Date): string {
  if (BACKEND_PAIDAT_MODE === "YMD_GREGORIAN") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  return value.toISOString();
}

export function toBackendDateOnlyStart(value: Date): string {
  if (BACKEND_FILTER_DATE_MODE === "YMD_GREGORIAN") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function toBackendDateOnlyEnd(value: Date): string {
  if (BACKEND_FILTER_DATE_MODE === "YMD_GREGORIAN") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}
