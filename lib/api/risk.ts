import { apiGet, apiPatch } from "./client";
import { isMockMode } from "./config";
import { getMockRiskSettings, updateMockRiskSettings, RiskSettingsConfig } from "@/lib/mock-data";

export async function getRiskSettings(): Promise<RiskSettingsConfig> {
  if (isMockMode()) return getMockRiskSettings();
  return apiGet<RiskSettingsConfig>("/risk/settings");
}

export async function updateRiskSettings(
  partial: Partial<RiskSettingsConfig>
): Promise<RiskSettingsConfig> {
  if (isMockMode()) return updateMockRiskSettings(partial);
  return apiPatch<RiskSettingsConfig, Partial<RiskSettingsConfig>>("/risk/settings", partial);
}
