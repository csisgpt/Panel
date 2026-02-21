import type { AllocationActions, WithdrawalActions } from "@/lib/contracts/permissions";
import type { FileMeta, PaymentMethod } from "@/lib/types/backend";

export enum P2PAllocationStatus {
  ASSIGNED = "ASSIGNED",
  PROOF_SUBMITTED = "PROOF_SUBMITTED",
  RECEIVER_CONFIRMED = "RECEIVER_CONFIRMED",
  ADMIN_VERIFIED = "ADMIN_VERIFIED",
  FINALIZED = "FINALIZED",
  SETTLED = "SETTLED",
  DISPUTED = "DISPUTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface P2PWithdrawal {
  id: string;
  createdAt: string;
  updatedAt?: string;
  amount: string;
  remainingToAssign: string;
  totals?: {
    assigned: string;
    settled: string;
    remainingToAssign: string;
    remainingToSettle: string;
  };
  status: string;
  purpose?: string;
  channel?: string | null;
  userMobile?: string | null;
  withdrawer?: P2PUserSummary | null;
  destination?: WithdrawalDestination | null;
  destinationSummary?: string | null;
  hasProof?: boolean;
  hasDispute?: boolean;
  hasExpiringAllocations?: boolean;
  isUrgent?: boolean;
  actions?: WithdrawalActions;
  allowedActions?: Array<{ key: "ASSIGN" | "CANCEL" | string; enabled: boolean; reasonDisabled?: string }>;
  riskFlags?: string[];
  allocations?: P2PAllocation[];
  raw?: unknown;
}

export interface P2PUserSummary {
  userId: string;
  mobile?: string;
  displayName?: string;
  userStatus?: string;
  kycLevel?: string;
  kycStatus?: string;
}

export interface WithdrawalDestination {
  type?: "IBAN" | "CARD" | "ACCOUNT";
  masked?: string;
  fullValue?: string;
  title?: string;
  bankName?: string;
  ownerName?: string;
  copyText?: string;
}

export interface DepositCandidate {
  id: string;
  requestedAmount: string;
  remainingAmount: string;
  status: string;
  isFullyAvailable: boolean;
  isExpiring: boolean;
  createdAt: string;
  updatedAt: string;
  payer?: P2PUserSummary | null;
  actions: {
    canCancel: boolean;
    canBeAssigned: boolean;
  };
  raw?: unknown;
}

export interface P2PAllocation {
  id: string;
  createdAt: string;
  status: P2PAllocationStatus | string;
  amount: string;
  withdrawalId?: string | null;
  depositId?: string | null;
  expiresAt?: string | null;
  payerName?: string | null;
  payerMobile?: string | null;
  payer?: P2PUserSummary | null;
  receiverName?: string | null;
  receiverMobile?: string | null;
  receiver?: P2PUserSummary | null;
  paymentMethod?: PaymentMethod | string | null;
  bankRef?: string | null;
  paidAt?: string | null;
  attachments?: FileMeta[];
  proofFileIds?: string[];
  destinationSummary?: string | null;
  destinationToPay?: {
    type?: "IBAN" | "CARD" | "ACCOUNT";
    bankName?: string;
    ownerName?: string;
    title?: string;
    fullValue?: string;
    masked?: string;
  } | null;
  destinationCopyText?: string | null;
  paymentCode?: string | null;
  payment?: {
    method?: PaymentMethod | string;
    bankRef?: string | null;
    paidAt?: string | null;
  } | null;
  timestamps?: {
    proofSubmittedAt?: string | null;
    receiverConfirmedAt?: string | null;
    adminVerifiedAt?: string | null;
    settledAt?: string | null;
  } | null;
  isExpired?: boolean;
  expiresSoon?: boolean;
  hasProof?: boolean;
  isFinalizable?: boolean;
  actions?: AllocationActions;
  allowedActions?: Array<{ key: string; enabled: boolean; reasonDisabled?: string }>;
  raw?: unknown;
}

export interface P2POpsSummary {
  needsAssignment: number;
  partiallyAssigned?: number;
  proofSubmitted: number;
  expiringSoon: number;
  disputes: number;
  finalizable?: number;
}

export interface PaymentDestination {
  id: string;
  type?: "IBAN" | "CARD" | "ACCOUNT";
  maskedValue?: string;
  bankName?: string;
  ownerNameMasked?: string;
  title?: string;
  isDefault?: boolean;
  status?: "ACTIVE" | "PENDING_VERIFY" | "DISABLED";
  lastUsedAt?: string | null;
  label?: string;
  iban?: string;
  cardNumber?: string;
}


export interface P2PSystemDestinationVm {
  id: string;
  title?: string | null;
  type: "IBAN" | "CARD" | "ACCOUNT";
  fullValue?: string | null;
  maskedValue: string;
  ownerName?: string | null;
  copyText?: string | null;
  bankName?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  lastUsedAt?: string | null;
  allocationCount?: number;
  status?: "ACTIVE" | "PENDING_VERIFY" | "DISABLED";
}

export interface DestinationForm {
  type?: "IBAN" | "CARD" | "ACCOUNT";
  value?: string;
  bankName?: string;
  title?: string;
  ownerName?: string;
  label?: string;
  iban?: string;
  cardNumber?: string;
}

export interface AllocationProofInfo {
  fileId: string;
  file?: FileMeta;
}

export interface AllocationProofDto {
  bankRef: string;
  method: PaymentMethod;
  paidAt?: string;
  fileIds: string[];
}

export interface AllocationReceiverConfirmDto {
  confirmed: boolean;
  reason?: string;
}
