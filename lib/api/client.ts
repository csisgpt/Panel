import { API_BASE_URL } from "./config";
import { normalizeApiError } from "./error-normalizer";
import { fetchWithRetry, getAuthToken, parseResponse } from "./http";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetchWithRetry(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw await normalizeApiError(res);
  }

  return await parseResponse<T>(res);
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T, B = unknown>(path: string, body: B): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPatch<T, B = unknown>(path: string, body: B): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
