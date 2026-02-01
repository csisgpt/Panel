import type { AllocationActions } from "@/lib/contracts/permissions";
import type { Attachment, FileMeta } from "@/lib/types/backend";

export interface P2PWithdrawal {
  id: string;
  createdAt: string;
  amount: string;
  remainingToAssign: string;
  userMobile: string;
  status: string;
  destinationSummary?: string | null;
  hasProof?: boolean;
  hasDispute?: boolean;
  expiresAt?: string | null;
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
  proofFileIds?: string[];
  proofAttachments?: Attachment[];
  actions?: AllocationActions;
}

export interface P2POpsSummary {
  needsAssignment: number;
  proofSubmitted: number;
  expiringSoon: number;
  disputes: number;
}

export interface PaymentDestination {
  id: string;
  label: string;
  iban?: string;
  cardNumber?: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface DestinationForm {
  label: string;
  iban?: string;
  cardNumber?: string;
  bankName?: string;
}

export interface AllocationProofInfo {
  fileId: string;
  file?: FileMeta;
}
