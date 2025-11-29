import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { addMockPricingLog, getMockPricingLogs, PricingLog } from "@/lib/mock-data";

export async function getPricingLogs(): Promise<PricingLog[]> {
  if (isMockMode()) return getMockPricingLogs();
  return apiGet<PricingLog[]>("/pricing/logs");
}

export async function addPricingLog(
  log: Omit<PricingLog, "id" | "createdAt">
): Promise<void> {
  if (isMockMode()) return addMockPricingLog(log);
  await apiPost<unknown, Omit<PricingLog, "id" | "createdAt">>("/pricing/logs", log);
}
