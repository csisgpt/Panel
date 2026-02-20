import type { AllocationActions, WithdrawalActions } from "@/lib/contracts/permissions";
import type { DepositCandidate, P2PAllocation, P2PUserSummary, P2PWithdrawal, WithdrawalDestination } from "@/lib/contracts/p2p";
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
  withdrawer?: {
    userId: string;
    mobile?: string;
    displayName?: string;
    userStatus?: string;
    kycLevel?: string;
    kycStatus?: string;
  } | null;
  destination?: {
    type: "IBAN" | "CARD" | "ACCOUNT";
    masked: string;
    fullValue?: string;
    bankName?: string;
    ownerName?: string;
    title?: string;
    copyText?: string;
  } | null;
  flags: {
    hasDispute: boolean;
    hasProof: boolean;
    hasExpiringAllocations: boolean;
    isUrgent: boolean;
  };
  riskFlags?: string[];
  allowedActions?: Array<{ key: "ASSIGN" | "CANCEL" | string; enabled: boolean; reasonDisabled?: string }>;
  allocations?: AllocationVmDto[];
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
  payer?: {
    userId: string;
    mobile?: string;
    displayName?: string;
    userStatus?: string;
    kycLevel?: string;
    kycStatus?: string;
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
  allowedActions?: Array<{ key: string; enabled: boolean; reasonDisabled?: string }>;
  createdAt: string;
  actions: {
    payerCanSubmitProof: boolean;
    receiverCanConfirm: boolean;
    adminCanFinalize: boolean;
  };
}

function mapUserSummary(dto?: DepositVmDto["payer"] | WithdrawalVmDto["withdrawer"] | AllocationVmDto["payer"] | null): P2PUserSummary | null {
  if (!dto?.userId) return null;
  return {
    userId: dto.userId,
    mobile: dto.mobile,
    displayName: dto.displayName,
    userStatus: "userStatus" in dto ? dto.userStatus : undefined,
    kycLevel: "kycLevel" in dto ? dto.kycLevel : undefined,
    kycStatus: "kycStatus" in dto ? dto.kycStatus : undefined,
  };
}

function mapDestination(dto?: WithdrawalVmDto["destination"] | AllocationVmDto["destinationToPay"] | null): WithdrawalDestination | null {
  if (!dto) return null;
  return {
    type: dto.type,
    title: dto.title,
    bankName: dto.bankName,
    ownerName: dto.ownerName,
    fullValue: dto.fullValue,
    masked: dto.masked,
    copyText: "copyText" in dto ? dto.copyText : undefined,
  };
}

function buildDestinationSummary(destination?: WithdrawalDestination | null) {
  if (!destination) return null;
  const value = destination.fullValue ?? destination.masked;
  if (!value) return null;
  const bankLabel = destination.bankName ? `${destination.bankName} - ` : "";
  const title = destination.title ? `${destination.title} ` : "";
  return `${bankLabel}${title}${value}`;
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

function toAllocationActions(actions: AllocationVmDto["actions"], status: string, allowedActions?: AllocationVmDto["allowedActions"]): AllocationActions {
  const adapted = adaptAllocationActions(actions, status);
  if (!allowedActions?.length) return adapted;
  const enabled = (key: string, fallback: boolean) => allowedActions.find((a) => a.key === key)?.enabled ?? fallback;
  return {
    ...adapted,
    canSubmitProof: enabled("SUBMIT_PROOF", adapted.canSubmitProof),
    canConfirmReceived: enabled("RECEIVER_CONFIRM", adapted.canConfirmReceived),
    canAdminVerify: enabled("ADMIN_VERIFY", adapted.canAdminVerify),
    canFinalize: enabled("FINALIZE", adapted.canFinalize),
    canCancel: enabled("CANCEL", adapted.canCancel),
    canDispute: enabled("DISPUTE", adapted.canDispute),
  };
}

export function mapP2PWithdrawalVm(vm: WithdrawalVmDto): P2PWithdrawal {
  const destination = mapDestination(vm.destination);
  const withdrawer = mapUserSummary(vm.withdrawer);
  return {
    id: vm.id,
    createdAt: vm.createdAt,
    updatedAt: vm.updatedAt,
    amount: vm.amount,
    totals: vm.totals,
    remainingToAssign: vm.totals.remainingToAssign,
    status: vm.status,
    purpose: vm.purpose,
    channel: vm.channel ?? null,
    withdrawer,
    userMobile: withdrawer?.mobile ?? null,
    destination,
    destinationSummary: buildDestinationSummary(destination),
    hasProof: vm.flags.hasProof,
    hasDispute: vm.flags.hasDispute,
    hasExpiringAllocations: vm.flags.hasExpiringAllocations,
    isUrgent: vm.flags.isUrgent,
    actions: vm.actions,
    allowedActions: vm.allowedActions,
    riskFlags: vm.riskFlags ?? [],
    allocations: vm.allocations?.map(mapP2PAllocationVm),
    raw: vm,
  };
}

export function mapP2PAllocationVm(vm: AllocationVmDto): P2PAllocation {
  const destinationToPay = vm.destinationToPay ?? null;
  const destinationSummary = destinationToPay
    ? `${destinationToPay.bankName ? `${destinationToPay.bankName} - ` : ""}${destinationToPay.fullValue ?? destinationToPay.masked}`
    : null;
  const payer = mapUserSummary(vm.payer);
  const receiver = mapUserSummary(vm.receiver);
  return {
    id: vm.id,
    createdAt: vm.createdAt,
    status: vm.status,
    amount: vm.amount,
    withdrawalId: vm.withdrawalId ?? null,
    depositId: vm.depositId ?? null,
    expiresAt: vm.expiresAt,
    payer,
    payerName: payer?.displayName ?? null,
    payerMobile: payer?.mobile ?? null,
    receiver,
    receiverName: receiver?.displayName ?? null,
    receiverMobile: receiver?.mobile ?? null,
    paymentMethod: vm.payment?.method ?? null,
    bankRef: vm.payment?.bankRef ?? null,
    paidAt: vm.payment?.paidAt ?? null,
    payment: vm.payment
      ? { method: vm.payment.method, bankRef: vm.payment.bankRef ?? null, paidAt: vm.payment.paidAt ?? null }
      : null,
    attachments: vm.attachments.map(mapAttachmentToFileMeta),
    destinationSummary,
    destinationToPay,
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
    actions: toAllocationActions(vm.actions, vm.status, vm.allowedActions),
    allowedActions: vm.allowedActions ?? [],
    raw: vm,
  };
}

export function mapP2PCandidateDepositVm(vm: DepositVmDto): DepositCandidate {
  return {
    id: vm.id,
    requestedAmount: vm.requestedAmount,
    remainingAmount: vm.totals.remaining,
    status: vm.status,
    isFullyAvailable: vm.flags.isFullyAvailable,
    isExpiring: vm.flags.isExpiring,
    createdAt: vm.createdAt,
    updatedAt: vm.updatedAt,
    payer: mapUserSummary(vm.payer),
    actions: vm.actions,
    raw: vm,
  };
}
