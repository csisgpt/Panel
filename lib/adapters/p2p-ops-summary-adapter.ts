import type { P2POpsSummary } from "@/lib/contracts/p2p";

export interface BackendOpsSummaryDto {
  withdrawalsWaitingAssignmentCount: number;
  withdrawalsPartiallyAssignedCount: number;
  allocationsExpiringSoonCount: number;
  allocationsProofSubmittedCount: number;
  allocationsDisputedCount: number;
  allocationsFinalizableCount: number;
}

export function adaptOpsSummary(input: BackendOpsSummaryDto): P2POpsSummary {
  return {
    needsAssignment: input.withdrawalsWaitingAssignmentCount,
    partiallyAssigned: input.withdrawalsPartiallyAssignedCount,
    expiringSoon: input.allocationsExpiringSoonCount,
    proofSubmitted: input.allocationsProofSubmittedCount,
    disputes: input.allocationsDisputedCount,
    finalizable: input.allocationsFinalizableCount,
  };
}
