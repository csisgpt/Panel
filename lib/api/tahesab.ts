import { apiGet, apiPatch } from "./client";
import { isMockMode } from "./config";
import {
  getMockTahesabLogs,
  getMockTahesabMappings,
  updateMockTahesabMapping,
  TahesabLog,
  TahesabMapping,
} from "@/lib/mock-data";

export async function getTahesabLogs(): Promise<TahesabLog[]> {
  if (isMockMode()) return getMockTahesabLogs();
  return apiGet<TahesabLog[]>("/tahesab/logs");
}

export async function getTahesabMappings(): Promise<TahesabMapping[]> {
  if (isMockMode()) return getMockTahesabMappings();
  return apiGet<TahesabMapping[]>("/tahesab/mappings");
}

export async function updateTahesabMapping(
  id: string,
  partial: Partial<TahesabMapping>
): Promise<TahesabMapping> {
  if (isMockMode()) return updateMockTahesabMapping(id, partial);
  return apiPatch<TahesabMapping, Partial<TahesabMapping>>(`/tahesab/mappings/${id}`, partial);
}
