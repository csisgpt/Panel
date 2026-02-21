import { API_BASE_URL } from "./config";
import { normalizeApiError } from "./error-normalizer";
import { fetchWithRetry, getAuthToken, parseResponse, unwrapApiResult } from "./http";

function getAuthHeader() {
  if (typeof window === "undefined") return undefined;
  const token = localStorage.getItem("panel_token_v2");
  if (!token) return undefined;
  return `Bearer ${token}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (process.env.NEXT_PUBLIC_API_ENVELOPE === "1") {
    headers.set("x-api-envelope", "1");
  }
  const res = await fetchWithRetry(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw await normalizeApiError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const parsed = await parseResponse<unknown>(res);
  return unwrapApiResult(parsed) as T;
}

async function requestForm<T>(path: string, formData: FormData, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (process.env.NEXT_PUBLIC_API_ENVELOPE === "1") {
    headers.set("x-api-envelope", "1");
  }
  const res = await fetchWithRetry(url, {
    ...options,
    method: "POST",
    headers,
    body: formData,
    cache: "no-store",
  });

  if (!res.ok) {
    throw await normalizeApiError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  const parsed = await parseResponse<unknown>(res);
  return unwrapApiResult(parsed) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T, B = unknown>(path: string, body: B, options?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...options,
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

export function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return requestForm<T>(path, formData);
}

export function apiPut<T, B = unknown>(path: string, body: B): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}


export async function apiGetBlob(pathOrUrl: string): Promise<Blob> {
  const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
  const url = isAbsolute ? pathOrUrl : `${API_BASE_URL}${pathOrUrl}`;
  const token = getAuthToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (process.env.NEXT_PUBLIC_API_ENVELOPE === "1") {
    headers.set("x-api-envelope", "1");
  }

  const res = await fetchWithRetry(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw await normalizeApiError(res);
  }

  return res.blob();
}
