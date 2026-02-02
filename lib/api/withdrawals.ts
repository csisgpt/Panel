import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockWithdrawal, getMockWithdrawals, getMockWithdrawalsEnvelope } from "@/lib/mock-data";
import { CreateWithdrawalDto, WithdrawRequest } from "@/lib/types/backend";
import { normalizeListResponse, type ListEnvelope, type ListMeta } from "@/lib/contracts/list";

export interface WithdrawalListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listWithdrawals(
  params: WithdrawalListParams = {}
): Promise<{ items: WithdrawRequest[]; meta: ListMeta }> {
  if (isMockMode()) {
    return normalizeListResponse(getMockWithdrawalsEnvelope(params));
  }
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await apiGet<ListEnvelope<WithdrawRequest>>(`/withdrawals${query ? `?${query}` : ""}`);
  return normalizeListResponse(response);
}

export async function getWithdrawals(): Promise<WithdrawRequest[]> {
  if (isMockMode()) return getMockWithdrawals();
  const { items } = await listWithdrawals();
  return items;
}

export async function createWithdrawal(dto: CreateWithdrawalDto): Promise<WithdrawRequest> {
  if (isMockMode()) return createMockWithdrawal(dto);
  return apiPost<WithdrawRequest, CreateWithdrawalDto>("/withdrawals", dto);
}
