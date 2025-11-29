import { apiGet, apiPatch } from "./client";
import { isMockMode } from "./config";
import { AdminUiSettings, getAdminUiSettings, updateAdminUiSettings } from "@/lib/mock-data";

export async function getAdminSettings(): Promise<AdminUiSettings> {
  if (isMockMode()) return getAdminUiSettings();
  return apiGet<AdminUiSettings>("/admin/settings");
}

export async function updateAdminSettings(
  patch: Partial<AdminUiSettings>
): Promise<AdminUiSettings> {
  if (isMockMode()) return updateAdminUiSettings(patch);
  return apiPatch<AdminUiSettings, Partial<AdminUiSettings>>("/admin/settings", patch);
}
