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
  status: string;
  purpose?: string;
  channel?: string | null;
  userMobile?: string | null;
  destinationSummary?: string | null;
  hasProof?: boolean;
  hasDispute?: boolean;
  hasExpiringAllocations?: boolean;
  isUrgent?: boolean;
  actions?: WithdrawalActions;
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
  receiverName?: string | null;
  receiverMobile?: string | null;
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
