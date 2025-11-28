import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { getMockSystemStatus, updateMockSystemStatus } from "@/lib/mock-data";
import { SystemStatus } from "@/lib/types/backend";

export async function getSystemStatus(): Promise<SystemStatus> {
  if (isMockMode()) {
    return getMockSystemStatus();
  }
  return apiGet<SystemStatus>("/system/status");
}

export async function testSystemConnection(): Promise<SystemStatus> {
  if (isMockMode()) {
    return updateMockSystemStatus({ tahesabOnline: true });
  }
  return apiPost<SystemStatus>("/system/test", {});
}

export async function syncSystemStatus(): Promise<SystemStatus> {
  if (isMockMode()) {
    return updateMockSystemStatus({ lastSyncAt: new Date().toISOString() });
  }
  return apiPost<SystemStatus>("/system/sync", {});
}
