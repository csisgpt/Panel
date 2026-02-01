import type { AllocationActions, WithdrawalActions } from "@/lib/contracts/permissions";
import type { FileMeta } from "@/lib/types/backend";

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
  status: string;
  amount: string;
  expiresAt?: string | null;
  payerName?: string | null;
  payerMobile?: string | null;
  receiverName?: string | null;
  receiverMobile?: string | null;
  paymentMethod?: string | null;
  bankRef?: string | null;
  paidAt?: string | null;
  attachments?: FileMeta[];
  proofFileIds?: string[];
  destinationSummary?: string | null;
  paymentCode?: string | null;
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
