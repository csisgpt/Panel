import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import type { ListParams } from "@/lib/querykit/schemas";
import { listParamsToQuery } from "@/lib/adapters/list-params-to-query";
import { adaptListResponse } from "@/lib/adapters/list-response-adapter";
import { adaptP2PMeta } from "@/lib/adapters/p2p-meta-adapter";
import { adaptAllocationActions } from "@/lib/adapters/p2p-actions-adapter";
import { buildApiError } from "@/lib/api/http";
import type { P2PAllocation, P2POpsSummary, P2PWithdrawal } from "@/lib/contracts/p2p";
import {
  getMockOpsSummary,
  getMockP2PAllocationsEnvelope,
  getMockP2PWithdrawalsEnvelope,
  getMockP2PCandidates,
} from "@/lib/mock-data";

export async function listAdminP2PWithdrawals(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PWithdrawalsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = envelope.data ?? [];
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = listParamsToQuery(params, { offsetBased: true });
  const response = await apiGet<{ data: P2PWithdrawal[]; meta: any }>(`/admin/p2p/withdrawals?${query}`);
  return { items: response.data ?? [], meta: adaptP2PMeta(response.meta) };
}

export async function listAdminP2PAllocations(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PAllocationsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = (envelope.data ?? []).map((item) => ({
      ...item,
      actions: adaptAllocationActions(item.actions as any, item.status),
    }));
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = listParamsToQuery(params, { offsetBased: true });
  const response = await apiGet<{ data: P2PAllocation[]; meta: any }>(`/admin/p2p/allocations?${query}`);
  const items = (response.data ?? []).map((item) => ({
    ...item,
    actions: adaptAllocationActions((item as any).actions, item.status),
  }));
  return { items, meta: adaptP2PMeta(response.meta) };
}

export async function listWithdrawalCandidates(withdrawalId: string, params: ListParams) {
  if (isMockMode()) {
    const data = await getMockP2PCandidates();
    const { meta } = adaptListResponse({ items: data, meta: { page: params.page, limit: params.limit, total: data.length } });
    return { items: data, meta };
  }
  const query = listParamsToQuery(params, { offsetBased: true });
  const response = await apiGet<{ data: any[]; meta: any }>(`/admin/p2p/withdrawals/${withdrawalId}/candidates?${query}`);
  return { items: response.data ?? [], meta: adaptP2PMeta(response.meta) };
}

export type AssignToWithdrawalDto = {
  candidateIds: string[];
};

function normalizeAssignPayload(payload: AssignToWithdrawalDto | { candidateId: string }): AssignToWithdrawalDto {
  if ("candidateId" in payload) {
    return { candidateIds: [payload.candidateId] };
  }
  return payload;
}

function getMockCandidateAmount(candidateId: string) {
  const fallback = 1500000;
  const numericPart = Number(candidateId.replace(/\D/g, "")) || 0;
  return fallback + numericPart * 250000;
}

export async function assignToWithdrawal(
  withdrawalId: string,
  payload: AssignToWithdrawalDto | { candidateId: string }
) {
  const dto = normalizeAssignPayload(payload);
  if (isMockMode()) {
    const envelope = getMockP2PWithdrawalsEnvelope();
    const withdrawal = envelope.data?.find((item) => item.id === withdrawalId);
    if (!withdrawal) {
      throw buildApiError({ message: "برداشت یافت نشد", code: "not_found" });
    }
    const remaining = Number(withdrawal.remainingToAssign ?? 0);
    const totalAssigned = dto.candidateIds.reduce((sum, candidateId) => {
      return sum + getMockCandidateAmount(candidateId);
    }, 0);
    if (totalAssigned > remaining) {
      throw buildApiError({
        message: "مجموع تخصیص از باقی‌مانده بیشتر است",
        code: "validation_failed",
        details: { remaining, totalAssigned },
      });
    }
    return { success: true };
  }
  return apiPost(`/admin/p2p/withdrawals/${withdrawalId}/assign`, dto);
}

export async function getOpsSummary(): Promise<P2POpsSummary> {
  if (isMockMode()) return getMockOpsSummary();
  return apiGet<P2POpsSummary>("/admin/p2p/ops-summary");
}
