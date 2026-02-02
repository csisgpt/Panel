export type ApiMode = "mock" | "http";

export const API_MODE: ApiMode = "http"
  // process.env.NEXT_PUBLIC_API_MODE === "http" ? "http" : "mock";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export function isMockMode() {
  return API_MODE === "mock";
}
