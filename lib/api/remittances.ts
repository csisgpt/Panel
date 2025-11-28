import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockRemittance, getMockRemittances, Remittance } from "@/lib/mock-data";

export type CreateRemittanceDto = Omit<Remittance, "id" | "createdAt">;

export async function getRemittances(): Promise<Remittance[]> {
  if (isMockMode()) return getMockRemittances();
  return apiGet<Remittance[]>("/remittances");
}

export async function createRemittance(dto: CreateRemittanceDto): Promise<Remittance> {
  if (isMockMode()) return createMockRemittance(dto);
  return apiPost<Remittance, CreateRemittanceDto>("/remittances", dto);
}
