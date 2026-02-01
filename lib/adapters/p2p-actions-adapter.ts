import type { AllocationActions } from "@/lib/contracts/permissions";

export interface BackendAllocationActions {
  payerCanSubmitProof?: boolean;
  receiverCanConfirm?: boolean;
  adminCanFinalize?: boolean;
  adminCanVerify?: boolean;
  adminCanCancel?: boolean;
  canSubmitProof?: boolean;
  canConfirmReceived?: boolean;
  canDispute?: boolean;
  canCancel?: boolean;
  canAdminVerify?: boolean;
  canFinalize?: boolean;
  canViewAttachments?: boolean;
  canDownloadAttachments?: boolean;
}

/**
 * Map backend allocation actions to frontend permissions contract.
 */
function isProofSubmittedStatus(status?: string | null) {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return ["PROOF_SUBMITTED", "NEEDS_VERIFY", "PENDING_VERIFY"].includes(normalized);
}

function isTerminalStatus(status?: string | null) {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return ["FINALIZED", "CANCELLED", "REJECTED", "FAILED", "EXPIRED"].includes(normalized);
}

export function adaptAllocationActions(
  input?: BackendAllocationActions | null,
  status?: string | null
): AllocationActions {
  const canAdminVerify =
    input?.adminCanVerify ?? input?.canAdminVerify ?? (isProofSubmittedStatus(status) ? true : false);
  const canCancel =
    input?.adminCanCancel ?? input?.canCancel ?? (status ? !isTerminalStatus(status) : false);
  const canFinalize = input?.adminCanFinalize ?? input?.canFinalize ?? false;
  return {
    canSubmitProof: Boolean(input?.payerCanSubmitProof ?? input?.canSubmitProof),
    canConfirmReceived: Boolean(input?.receiverCanConfirm ?? input?.canConfirmReceived),
    canDispute: Boolean(input?.canDispute),
    // TODO: Replace with backend can* aliases when available.
    canCancel,
    canAdminVerify,
    canFinalize,
    // TODO: backend should expose attachment permissions.
    canViewAttachments: Boolean(input?.canViewAttachments),
    canDownloadAttachments: Boolean(input?.canDownloadAttachments),
  };
}
