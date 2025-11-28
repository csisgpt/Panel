import { API_BASE_URL } from "./config";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
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
