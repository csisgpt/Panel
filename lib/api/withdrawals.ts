import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockWithdrawal, getMockWithdrawals } from "@/lib/mock-data";
import { CreateWithdrawalDto, WithdrawRequest } from "@/lib/types/backend";

export async function getWithdrawals(): Promise<WithdrawRequest[]> {
  if (isMockMode()) return getMockWithdrawals();
  return apiGet<WithdrawRequest[]>("/withdrawals");
}

export async function createWithdrawal(dto: CreateWithdrawalDto): Promise<WithdrawRequest> {
  if (isMockMode()) return createMockWithdrawal(dto);
  return apiPost<WithdrawRequest, CreateWithdrawalDto>("/withdrawals", dto);
}
