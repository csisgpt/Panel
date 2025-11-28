import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockDeposit, getMockDeposits } from "@/lib/mock-data";
import { CreateDepositDto, DepositRequest } from "@/lib/types/backend";

export async function getDeposits(): Promise<DepositRequest[]> {
  if (isMockMode()) return getMockDeposits();
  return apiGet<DepositRequest[]>("/deposits");
}

export async function createDeposit(dto: CreateDepositDto): Promise<DepositRequest> {
  if (isMockMode()) return createMockDeposit(dto);
  return apiPost<DepositRequest, CreateDepositDto>("/deposits", dto);
}
