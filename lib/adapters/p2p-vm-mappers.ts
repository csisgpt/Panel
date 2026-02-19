import type { WithdrawalActions } from "@/lib/contracts/permissions";
import type { P2PAllocation, P2PWithdrawal } from "@/lib/contracts/p2p";
import type { FileMeta } from "@/lib/types/backend";
import { adaptAllocationActions } from "@/lib/adapters/p2p-actions-adapter";

export interface WithdrawalVmDto {
  id: string;
  purpose?: string;
  channel?: string | null;
  amount: string;
  status: string;
  totals: {
    assigned: string;
    settled: string;
    remainingToAssign: string;
    remainingToSettle: string;
  };
  destination?: {
    type: "IBAN" | "CARD" | "ACCOUNT";
    masked: string;
    bankName?: string;
    title?: string;
  } | null;
  flags: {
    hasDispute: boolean;
    hasProof: boolean;
    hasExpiringAllocations: boolean;
    isUrgent: boolean;
  };
  createdAt: string;
  updatedAt: string;
  actions: WithdrawalActions;
}

export interface DepositVmDto {
  id: string;
  purpose?: string;
  requestedAmount: string;
  status: string;
  totals: {
    assigned: string;
    settled: string;
    remaining: string;
  };
  createdAt: string;
  updatedAt: string;
  actions: {
    canCancel: boolean;
    canBeAssigned: boolean;
  };
  flags: {
    isFullyAvailable: boolean;
    isExpiring: boolean;
  };
}

export interface AllocationVmDto {
  id: string;
  withdrawalId: string;
  depositId: string;
  payer: {
    userId: string;
    mobile?: string;
    displayName?: string;
  };
  receiver: {
    userId: string;
    mobile?: string;
    displayName?: string;
  };
  amount: string;
  status:
    | "ASSIGNED"
    | "PROOF_SUBMITTED"
    | "RECEIVER_CONFIRMED"
    | "ADMIN_VERIFIED"
    | "SETTLED"
    | "DISPUTED"
    | "CANCELLED"
    | "EXPIRED";
  expiresAt: string;
  paymentCode?: string | null;
  payment?: {
    method: "CARD_TO_CARD" | "SATNA" | "PAYA" | "TRANSFER" | "UNKNOWN";
    bankRef?: string;
    paidAt?: string;
  };
  attachments: Array<{
    id: string;
    kind: string;
    file: {
      id: string;
      name: string;
      mime: string;
      size: number;
    };
    createdAt: string;
  }>;
  destinationToPay?: {
    type: "IBAN" | "CARD" | "ACCOUNT";
    bankName?: string;
    ownerName?: string;
    title?: string;
    fullValue?: string;
    masked: string;
  } | null;
  expiresInSeconds?: number;
  destinationCopyText?: string;
  timestamps: {
    proofSubmittedAt?: string;
    receiverConfirmedAt?: string;
    adminVerifiedAt?: string;
    settledAt?: string;
  };
  flags: {
    isExpired: boolean;
    expiresSoon: boolean;
    hasProof: boolean;
    isFinalizable: boolean;
  };
  createdAt: string;
  actions: {
    payerCanSubmitProof: boolean;
    receiverCanConfirm: boolean;
    adminCanFinalize: boolean;
  };
}

export interface CandidateRow {
  id: string;
  requestedAmount: string;
  remainingAmount: string;
  status: string;
  isFullyAvailable: boolean;
  isExpiring: boolean;
  createdAt: string;
  updatedAt: string;
  actions: {
    canCancel: boolean;
    canBeAssigned: boolean;
  };
  raw?: unknown;
}

function buildDestinationSummary(destination?: WithdrawalVmDto["destination"] | null) {
  if (!destination) return null;
  const bankLabel = destination.bankName ? `${destination.bankName} - ` : "";
  const title = destination.title ? `${destination.title} ` : "";
  return `${bankLabel}${title}${destination.masked}`;
}

function mapAttachmentToFileMeta(attachment: AllocationVmDto["attachments"][number]): FileMeta {
  return {
    id: attachment.file.id,
    createdAt: attachment.createdAt,
    uploadedById: "",
    storageKey: "",
    fileName: attachment.file.name,
    mimeType: attachment.file.mime,
    sizeBytes: attachment.file.size,
    label: attachment.kind,
  };
}

export function mapP2PWithdrawalVm(vm: WithdrawalVmDto): P2PWithdrawal {
  return {
    id: vm.id,
    createdAt: vm.createdAt,
    updatedAt: vm.updatedAt,
    amount: vm.amount,
    remainingToAssign: vm.totals.remainingToAssign,
    status: vm.status,
    purpose: vm.purpose,
    channel: vm.channel ?? null,
    destinationSummary: buildDestinationSummary(vm.destination),
    hasProof: vm.flags.hasProof,
    hasDispute: vm.flags.hasDispute,
    hasExpiringAllocations: vm.flags.hasExpiringAllocations,
    isUrgent: vm.flags.isUrgent,
    actions: vm.actions,
    raw: vm,
  };
}

export function mapP2PAllocationVm(vm: AllocationVmDto): P2PAllocation {
  const destinationSummary = vm.destinationToPay
    ? `${vm.destinationToPay.bankName ? `${vm.destinationToPay.bankName} - ` : ""}${vm.destinationToPay.masked}`
    : null;
  return {
    id: vm.id,
    createdAt: vm.createdAt,
    status: vm.status,
    amount: vm.amount,
    withdrawalId: vm.withdrawalId ?? null,
    depositId: vm.depositId ?? null,
    expiresAt: vm.expiresAt,
    payerName: vm.payer.displayName ?? null,
    payerMobile: vm.payer.mobile ?? null,
    receiverName: vm.receiver.displayName ?? null,
    receiverMobile: vm.receiver.mobile ?? null,
    paymentMethod: vm.payment?.method ?? null,
    bankRef: vm.payment?.bankRef ?? null,
    paidAt: vm.payment?.paidAt ?? null,
    payment: vm.payment
      ? { method: vm.payment.method, bankRef: vm.payment.bankRef ?? null, paidAt: vm.payment.paidAt ?? null }
      : null,
    attachments: vm.attachments.map(mapAttachmentToFileMeta),
    destinationSummary,
    destinationToPay: vm.destinationToPay ?? null,
    destinationCopyText: vm.destinationCopyText ?? null,
    paymentCode: vm.paymentCode ?? null,
    timestamps: {
      proofSubmittedAt: vm.timestamps?.proofSubmittedAt ?? null,
      receiverConfirmedAt: vm.timestamps?.receiverConfirmedAt ?? null,
      adminVerifiedAt: vm.timestamps?.adminVerifiedAt ?? null,
      settledAt: vm.timestamps?.settledAt ?? null,
    },
    isExpired: vm.flags.isExpired,
    expiresSoon: vm.flags.expiresSoon,
    hasProof: vm.flags.hasProof,
    isFinalizable: vm.flags.isFinalizable,
    actions: adaptAllocationActions(vm.actions, vm.status),
    raw: vm,
  };
}

export function mapP2PCandidateDepositVm(vm: DepositVmDto): CandidateRow {
  return {
    id: vm.id,
    requestedAmount: vm.requestedAmount,
    remainingAmount: vm.totals.remaining,
    status: vm.status,
    isFullyAvailable: vm.flags.isFullyAvailable,
    isExpiring: vm.flags.isExpiring,
    createdAt: vm.createdAt,
    updatedAt: vm.updatedAt,
    actions: vm.actions,
    raw: vm,
  };
}
