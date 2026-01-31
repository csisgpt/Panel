import { ApiError } from "@/lib/contracts/errors";

export interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
  retry?: number;
  retryDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 400;
const RETRY_STATUS = new Set([429, 503]);

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("panel_token_v2");
}

export async function fetchWithTimeout(
  url: string,
  options: HttpRequestOptions = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}

export async function fetchWithRetry(
  url: string,
  options: HttpRequestOptions = {}
): Promise<Response> {
  const retries = options.retry ?? DEFAULT_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetchWithTimeout(url, options);
      if (!res.ok && RETRY_STATUS.has(res.status) && attempt < retries) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
        continue;
      }
      return res;
    } catch (error) {
      if (attempt >= retries) throw error;
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
    }
  }
}

export function buildApiError(input: Partial<ApiError> & { message?: string }): ApiError {
  return {
    status: input.status ?? 0,
    code: input.code,
    message: input.message ?? "درخواست ناموفق بود",
    traceId: input.traceId,
    details: input.details,
  };
}
