import { ApiError } from "@/lib/contracts/errors";
import { buildApiError } from "./http";

export async function normalizeApiError(
  response?: Response,
  fallbackError?: unknown
): Promise<ApiError> {
  if (response) {
    let body: any = null;
    try {
      body = await response.clone().json();
    } catch {
      try {
        body = await response.clone().text();
      } catch {
        body = null;
      }
    }

    if (body && typeof body === "object") {
      if (body.ok === false) {
        return buildApiError({
          status: response.status,
          code: body.error?.code ?? "unknown_error",
          message: body.error?.message ?? "Request failed",
          traceId: body.traceId ?? body.trace_id ?? null,
          details: body.error?.details ?? body.details ?? null,
        });
      }
      if (body.error && typeof body.error === "object") {
        return buildApiError({
          status: response.status,
          code: body.error?.code ?? "unknown_error",
          message: body.error?.message ?? "Request failed",
          traceId: body.traceId ?? body.trace_id ?? null,
          details: body.error?.details ?? body.details ?? null,
        });
      }
      return buildApiError({
        status: response.status,
        code: body.code ?? body.errorCode,
        message: body.message ?? body.error ?? response.statusText,
        traceId: body.traceId ?? body.trace_id,
        details: body.details ?? body.meta,
      });
    }

    return buildApiError({
      status: response.status,
      message: typeof body === "string" && body.length > 0 ? body : response.statusText,
    });
  }

  if (fallbackError instanceof Error) {
    return buildApiError({ message: fallbackError.message });
  }

  return buildApiError({ message: "خطای ناشناخته" });
}
