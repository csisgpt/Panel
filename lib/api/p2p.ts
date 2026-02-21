import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import type { ListParams } from "@/lib/querykit/schemas";
import {
  buildAdminAllocationsQuery as buildAdminAllocationsQueryInternal,
  buildTraderHistoryQuery,
  buildWithdrawalCandidatesQuery as buildWithdrawalCandidatesQueryInternal,
} from "@/lib/adapters/list-query-builders";
import { buildAdminP2PWithdrawalsQuery as buildAdminP2PWithdrawalsQueryInternal } from "@/lib/contract-mappers/p2p-withdrawals.mapper";
import { adaptListResponse } from "@/lib/adapters/list-response-adapter";
import { adaptP2PMeta } from "@/lib/adapters/p2p-meta-adapter";
import { normalizeListResponse } from "@/lib/contracts/list";
import type {
  AllocationProofDto,
  AllocationReceiverConfirmDto,
  DepositCandidate,
  P2PAllocation,
  P2POpsSummary,
  P2PSystemDestinationVm,
  P2PWithdrawal,
} from "@/lib/contracts/p2p";
import {
  mapP2PAllocationVm,
  mapP2PCandidateDepositVm,
  mapP2PWithdrawalVm,
  type AllocationVmDto,
  type DepositVmDto,
  type WithdrawalVmDto,
} from "@/lib/adapters/p2p-vm-mappers";
import { adaptOpsSummary, type BackendOpsSummaryDto } from "@/lib/adapters/p2p-ops-summary-adapter";
import { buildApiError } from "@/lib/api/http";
import {
  getMockOpsSummary,
  getMockP2PAllocationsEnvelope,
  getMockP2PWithdrawalsEnvelope,
  getMockP2PCandidates,
  getMockUserDestinations,
} from "@/lib/mock-data";

export type AssignToWithdrawalRequest =
  | {
    // Mirrors backend AssignWithdrawalDto (gold-nest: assign-withdrawal.dto.ts)
    mode: "CANDIDATES";
    items: Array<{ depositId: string; amount: number }>;
  }
  | {
    // Mirrors backend AssignWithdrawalDto (gold-nest: assign-withdrawal.dto.ts)
    mode: "SYSTEM_DESTINATION";
    destinationId: string;
    items: Array<{ amount: number; depositId?: string; candidateId?: string }>;
  };

type AllocationPaymentMethod = AllocationVmDto["payment"] extends { method: infer M } ? M : never;

function buildMockWithdrawalVm(withdrawal: P2PWithdrawal): WithdrawalVmDto {
  return {
    id: withdrawal.id,
    purpose: withdrawal.purpose ?? "",
    channel: withdrawal.channel ?? null,
    amount: withdrawal.amount,
    status: withdrawal.status,
    totals: {
      assigned: "0",
      settled: "0",
      remainingToAssign: withdrawal.remainingToAssign,
      remainingToSettle: withdrawal.remainingToAssign,
    },
    destination: withdrawal.destinationSummary
      ? { type: "CARD", masked: withdrawal.destinationSummary }
      : null,
    flags: {
      hasDispute: Boolean(withdrawal.hasDispute),
      hasProof: Boolean(withdrawal.hasProof),
      hasExpiringAllocations: Boolean(withdrawal.hasExpiringAllocations),
      isUrgent: Boolean(withdrawal.isUrgent ?? withdrawal.hasDispute),
    },
    createdAt: withdrawal.createdAt,
    updatedAt: withdrawal.updatedAt ?? withdrawal.createdAt,
    actions: withdrawal.actions ?? { canCancel: false, canAssign: true, canViewAllocations: true },
  };
}

function mapLegacyAllocationStatus(status: string) {
  if (status === "PROOF_SUBMITTED") return "PROOF_SUBMITTED" as const;
  if (status === "NEEDS_VERIFY") return "RECEIVER_CONFIRMED" as const;
  if (status === "DISPUTE") return "DISPUTED" as const;
  return "ASSIGNED" as const;
}

function buildMockAllocationVm(allocation: P2PAllocation): AllocationVmDto {
  const mappedStatus = mapLegacyAllocationStatus(allocation.status);
  const attachments = allocation.attachments ?? [];
  const proofAttachments = (allocation.proofFileIds ?? []).map((fileId) => ({
    id: fileId,
    kind: "proof",
    file: { id: fileId, name: `file-${fileId}`, mime: "image/jpeg", size: 0 },
    createdAt: allocation.createdAt,
  }));
  return {
    id: allocation.id,
    withdrawalId: "mock-withdrawal",
    depositId: "mock-deposit",
    payer: { userId: "payer", mobile: allocation.payerMobile ?? undefined, displayName: allocation.payerName ?? undefined },
    receiver: {
      userId: "receiver",
      mobile: allocation.receiverMobile ?? undefined,
      displayName: allocation.receiverName ?? undefined,
    },
    amount: allocation.amount,
    status: mappedStatus,
    expiresAt: allocation.expiresAt ?? allocation.createdAt,
    paymentCode: allocation.paymentCode ?? undefined,
    payment: allocation.paymentMethod
      ? {
        method: allocation.paymentMethod as AllocationPaymentMethod,
        bankRef: allocation.bankRef ?? undefined,
        paidAt: allocation.paidAt ?? undefined,
      }
      : undefined,
    attachments: [...attachments.map((file) => ({
      id: file.id,
      kind: file.label ?? "proof",
      file: {
        id: file.id,
        name: file.fileName,
        mime: file.mimeType,
        size: file.sizeBytes,
      },
      createdAt: file.createdAt,
    })), ...proofAttachments],
    destinationToPay: allocation.destinationSummary
      ? { type: "CARD", masked: allocation.destinationSummary }
      : null,
    expiresInSeconds: allocation.expiresAt ? undefined : undefined,
    destinationCopyText: undefined,
    timestamps: {},
    flags: {
      isExpired: Boolean(allocation.isExpired),
      expiresSoon: Boolean(allocation.expiresSoon),
      hasProof: Boolean(allocation.hasProof),
      isFinalizable: Boolean(allocation.isFinalizable),
    },
    createdAt: allocation.createdAt,
    actions: {
      payerCanSubmitProof: Boolean(allocation.actions?.canSubmitProof),
      receiverCanConfirm: Boolean(allocation.actions?.canConfirmReceived),
      adminCanFinalize: Boolean(allocation.actions?.canFinalize),
    },
  };
}

function buildMockDepositVm(candidate: { id: string; name: string; mobile: string }): DepositVmDto {
  return {
    id: candidate.id,
    purpose: candidate.name,
    requestedAmount: "1500000",
    status: "PENDING",
    totals: { assigned: "0", settled: "0", remaining: "1500000" },
    payer: { userId: candidate.id, mobile: candidate.mobile, displayName: candidate.name },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actions: { canCancel: false, canBeAssigned: true },
    flags: { isFullyAvailable: true, isExpiring: false },
  };
}

export function buildAdminP2PWithdrawalsQuery(params: ListParams) {
  return buildAdminP2PWithdrawalsQueryInternal(params);
}

export function buildAdminP2PAllocationsQuery(params: ListParams) {
  return buildAdminAllocationsQueryInternal(params);
}

export function buildWithdrawalCandidatesQuery(params: ListParams) {
  return buildWithdrawalCandidatesQueryInternal(params);
}

export async function listAdminP2PWithdrawals(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PWithdrawalsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = (envelope.data ?? []).map((item) => mapP2PWithdrawalVm(buildMockWithdrawalVm(item)));
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = buildAdminP2PWithdrawalsQuery(params);
  const response = await apiGet<any>(`/admin/p2p/withdrawals?${query}`);
  const { items, meta } = normalizeListResponse<WithdrawalVmDto>(response as any);
  return { items: items.map(mapP2PWithdrawalVm), meta: adaptP2PMeta(meta as any) };
}

export async function listAdminP2PAllocations(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PAllocationsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = (envelope.data ?? []).map((item) => mapP2PAllocationVm(buildMockAllocationVm(item)));
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = buildAdminP2PAllocationsQuery(params);
  const response = await apiGet<any>(`/admin/p2p/allocations?${query}`);
  const { items, meta } = normalizeListResponse<AllocationVmDto>(response as any);
  return { items: items.map(mapP2PAllocationVm), meta: adaptP2PMeta(meta as any) };
}

export async function listWithdrawalCandidates(withdrawalId: string, params: ListParams): Promise<{ items: DepositCandidate[]; meta: ReturnType<typeof adaptP2PMeta> }> {
  if (isMockMode()) {
    const data = (await getMockP2PCandidates()).map((candidate) => mapP2PCandidateDepositVm(buildMockDepositVm(candidate)));
    const { meta } = adaptListResponse({
      items: data,
      meta: { page: params.page, limit: params.limit, total: data.length },
    });
    return { items: data, meta };
  }
  const query = buildWithdrawalCandidatesQuery(params);
  const response = await apiGet<any>(`/admin/p2p/withdrawals/${withdrawalId}/candidates?${query}`);
  const { items, meta } = normalizeListResponse<DepositVmDto>(response as any);
  return { items: items.map(mapP2PCandidateDepositVm), meta: adaptP2PMeta(meta as any) };
}

export async function assignToWithdrawal(withdrawalId: string, payload: AssignToWithdrawalRequest) {
  if (payload.mode === "CANDIDATES" && payload.items.some((item) => !item.amount || item.amount <= 0)) {
    throw buildApiError({ message: "مبلغ تخصیص برای هر آیتم اجباری است", code: "validation_failed" });
  }
  if (payload.mode === "SYSTEM_DESTINATION" && (!payload.destinationId || !payload.items.length || payload.items.some((item) => !item.amount || item.amount <= 0))) {
    throw buildApiError({ message: "مقصد سیستمی و مبلغ تخصیص اجباری است", code: "validation_failed" });
  }

  if (isMockMode()) {
    const envelope = getMockP2PWithdrawalsEnvelope();
    const withdrawal = envelope.data?.find((item) => item.id === withdrawalId);
    if (!withdrawal) {
      throw buildApiError({ message: "برداشت یافت نشد", code: "not_found" });
    }
    const remaining = Number(withdrawal.remainingToAssign ?? 0);
    const totalAssigned = payload.mode === "CANDIDATES"
      ? payload.items.reduce((sum, item) => sum + Number(item.amount), 0)
      : payload.items.reduce((sum, item) => sum + Number(item.amount), 0);
    if (totalAssigned > remaining) {
      throw buildApiError({
        message: "مجموع تخصیص از باقی‌مانده بیشتر است",
        code: "validation_failed",
        details: { remaining, totalAssigned },
      });
    }
    return (getMockP2PAllocationsEnvelope().data ?? []).map((item) => mapP2PAllocationVm(buildMockAllocationVm(item)));
  }
  const response = await apiPost<AllocationVmDto[]>(`/admin/p2p/withdrawals/${withdrawalId}/assign`, payload);
  return response.map(mapP2PAllocationVm);
}

export async function getOpsSummary(): Promise<P2POpsSummary> {
  if (isMockMode()) {
    const mock = await getMockOpsSummary();
    return adaptOpsSummary({
      withdrawalsWaitingAssignmentCount: mock.needsAssignment,
      withdrawalsPartiallyAssignedCount: 0,
      allocationsExpiringSoonCount: mock.expiringSoon,
      allocationsProofSubmittedCount: mock.proofSubmitted,
      allocationsDisputedCount: mock.disputes,
      allocationsFinalizableCount: 0,
    });
  }
  const response = await apiGet<BackendOpsSummaryDto>("/admin/p2p/ops-summary");
  return adaptOpsSummary(response);
}

export async function verifyAllocation(allocationId: string, payload: { approved: boolean; note?: string }) {
  const response = await apiPost<AllocationVmDto, { approved: boolean; note?: string }>(
    `/admin/p2p/allocations/${allocationId}/verify`,
    payload
  );
  return mapP2PAllocationVm(response);
}

export async function finalizeAllocation(allocationId: string) {
  const response = await apiPost<AllocationVmDto, Record<string, never>>(
    `/admin/p2p/allocations/${allocationId}/finalize`,
    {}
  );
  return mapP2PAllocationVm(response);
}

export async function cancelAllocation(allocationId: string) {
  const response = await apiPost<AllocationVmDto, Record<string, never>>(
    `/admin/p2p/allocations/${allocationId}/cancel`,
    {}
  );
  return mapP2PAllocationVm(response);
}

export async function listMyAllocationsAsPayer(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PAllocationsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = (envelope.data ?? []).map((item) => mapP2PAllocationVm(buildMockAllocationVm(item)));
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = buildTraderHistoryQuery(params);
  const response = await apiGet<any>(`/p2p/allocations/my-as-payer?${query}`);
  const { items, meta } = normalizeListResponse<AllocationVmDto>(response as any);
  return { items: items.map(mapP2PAllocationVm), meta: adaptP2PMeta(meta as any) };
}

export async function listMyAllocationsAsReceiver(params: ListParams) {
  if (isMockMode()) {
    const envelope = getMockP2PAllocationsEnvelope({
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
      sort: params.sort ? `${params.sort.key}:${params.sort.dir}` : undefined,
      filtersApplied: params.filters,
    });
    const items = (envelope.data ?? []).map((item) => mapP2PAllocationVm(buildMockAllocationVm(item)));
    return { items, meta: adaptP2PMeta(envelope.meta) };
  }
  const query = buildTraderHistoryQuery(params);
  const response = await apiGet<any>(`/p2p/allocations/my-as-receiver?${query}`);
  const { items, meta } = normalizeListResponse<AllocationVmDto>(response as any);
  return { items: items.map(mapP2PAllocationVm), meta: adaptP2PMeta(meta as any) };
}

export async function submitAllocationProof(allocationId: string, payload: AllocationProofDto) {
  const response = await apiPost<AllocationVmDto, AllocationProofDto>(
    `/p2p/allocations/${allocationId}/proof`,
    payload
  );
  return mapP2PAllocationVm(response);
}

export async function confirmAllocationReceipt(allocationId: string, payload: AllocationReceiverConfirmDto) {
  const response = await apiPost<AllocationVmDto, AllocationReceiverConfirmDto>(
    `/p2p/allocations/${allocationId}/receiver-confirm`,
    payload
  );
  return mapP2PAllocationVm(response);
}


export async function getAdminP2PWithdrawalDetail(withdrawalId: string): Promise<P2PWithdrawal> {
  if (isMockMode()) {
    const envelope = getMockP2PWithdrawalsEnvelope();
    const found = (envelope.data ?? []).find((item) => item.id === withdrawalId);
    if (!found) throw buildApiError({ message: "برداشت یافت نشد", code: "not_found" });
    return mapP2PWithdrawalVm(buildMockWithdrawalVm(found));
  }
  const response = await apiGet<WithdrawalVmDto>(`/admin/p2p/withdrawals/${withdrawalId}`);
  return mapP2PWithdrawalVm(response);
}

export async function getAdminP2PAllocationDetail(allocationId: string): Promise<P2PAllocation> {
  if (isMockMode()) {
    const envelope = getMockP2PAllocationsEnvelope();
    const found = (envelope.data ?? []).find((item) => item.id === allocationId);
    if (!found) throw buildApiError({ message: "تخصیص یافت نشد", code: "not_found" });
    return mapP2PAllocationVm(buildMockAllocationVm(found));
  }
  const response = await apiGet<AllocationVmDto>(`/admin/p2p/allocations/${allocationId}`);
  return mapP2PAllocationVm(response);
}

export type P2PSystemDestinationDto = {
  id: string;
  title?: string | null;
  bankName?: string | null;
  ownerName?: string | null;
  type: "IBAN" | "CARD" | "ACCOUNT";
  fullValue?: string | null;
  masked?: string | null;
  maskedValue?: string | null;
  copyText?: string | null;
  isActive?: boolean;
  allocationCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  lastUsedAt?: string | null;
  status?: "ACTIVE" | "PENDING_VERIFY" | "DISABLED";
};

function mapSystemDestination(dto: P2PSystemDestinationDto): P2PSystemDestinationVm {
  const resolvedStatus = dto.status ?? (dto.isActive ? "ACTIVE" : "DISABLED");

  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    fullValue: dto.fullValue ?? null,
    maskedValue: dto.fullValue ?? dto.copyText ?? dto.masked ?? dto.maskedValue ?? "-",
    bankName: dto.bankName,
    ownerName: dto.ownerName ?? null,
    copyText: dto.copyText ?? null,
    isActive: dto.isActive ?? resolvedStatus === "ACTIVE",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
    deletedAt: dto.deletedAt ?? null,
    lastUsedAt: dto.lastUsedAt ?? null,
    allocationCount: dto.allocationCount,
    status: resolvedStatus,
  };
}

export async function listAdminP2PSystemDestinations(): Promise<P2PSystemDestinationVm[]> {
  if (isMockMode()) {
    const items = await getMockUserDestinations();
    return items.map((item) =>
      mapSystemDestination({
        id: item.id,
        type: "ACCOUNT",
        maskedValue: item.label ?? item.id,
        title: item.label ?? item.id,
        bankName: "-",
        status: "ACTIVE",
        lastUsedAt: null,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
    );
  }

  const raw = await apiGet<any>("/admin/p2p/system-destinations");

  const items: P2PSystemDestinationDto[] =
    Array.isArray(raw) ? raw :
      Array.isArray(raw?.items) ? raw.items :
        Array.isArray(raw?.data) ? raw.data :
          [];

  return items.map(mapSystemDestination);
}

export async function adminCreateSystemDestination(payload: {
  title: string;
  type: "IBAN" | "CARD" | "ACCOUNT";
  value: string;
  bankName?: string;
  ownerName?: string;
  isActive?: boolean;
}) {
  const response = await apiPost<P2PSystemDestinationDto, typeof payload>("/admin/p2p/system-destinations", payload);
  return mapSystemDestination(response);
}

export async function adminUpdateSystemDestination(id: string, payload: Partial<{
  title: string;
  type: "IBAN" | "CARD" | "ACCOUNT";
  value: string;
  bankName: string;
  ownerName: string;
  isActive: boolean;
}>) {
  const response = await apiPatch<P2PSystemDestinationDto, typeof payload>(`/admin/p2p/system-destinations/${id}`, payload);
  return mapSystemDestination(response);
}

export async function adminSetSystemDestinationStatus(id: string, isActive: boolean) {
  const response = await apiPatch<P2PSystemDestinationDto, { isActive: boolean }>(`/admin/p2p/system-destinations/${id}/status`, { isActive });
  return mapSystemDestination(response);
}

export async function adminDeleteSystemDestination(id: string) {
  await apiDelete(`/admin/p2p/system-destinations/${id}`);
}


export const adminListSystemDestinations = listAdminP2PSystemDestinations;
