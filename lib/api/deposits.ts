import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockDeposit, getMockDeposits, getMockDepositsEnvelope } from "@/lib/mock-data";
import { CreateDepositDto, DepositRequest } from "@/lib/types/backend";
import { normalizeListResponse, type ListEnvelope, type ListMeta } from "@/lib/contracts/list";

export interface DepositListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listDeposits(
  params: DepositListParams = {}
): Promise<{ items: DepositRequest[]; meta: ListMeta }> {
  if (isMockMode()) {
    return normalizeListResponse(getMockDepositsEnvelope(params));
  }
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);
  const query = search.toString();
  const response = await apiGet<ListEnvelope<DepositRequest>>(`/deposits${query ? `?${query}` : ""}`);
  return normalizeListResponse(response);
}

export async function getDeposits(): Promise<DepositRequest[]> {
  if (isMockMode()) return getMockDeposits();
  const { items } = await listDeposits();
  return items;
}

export async function createDeposit(dto: CreateDepositDto): Promise<DepositRequest> {
  if (isMockMode()) return createMockDeposit(dto);
  return apiPost<DepositRequest, CreateDepositDto>("/deposits", dto);
}
