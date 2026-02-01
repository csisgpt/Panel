import type { AllocationActions } from "@/lib/contracts/permissions";

export interface BackendAllocationActions {
  payerCanSubmitProof?: boolean;
  receiverCanConfirm?: boolean;
  adminCanFinalize?: boolean;
}

/**
 * Map backend allocation actions to frontend permissions contract.
 */
function isProofSubmittedStatus(status?: string | null) {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return ["PROOF_SUBMITTED", "RECEIVER_CONFIRMED"].includes(normalized);
}

function isTerminalStatus(status?: string | null) {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return ["SETTLED", "CANCELLED", "EXPIRED"].includes(normalized);
}

export function adaptAllocationActions(
  input?: BackendAllocationActions | null,
  status?: string | null
): AllocationActions {
  const normalizedStatus = status?.toUpperCase();
  const canAdminVerify = isProofSubmittedStatus(status);
  const canCancel = Boolean(
    normalizedStatus &&
      !isTerminalStatus(normalizedStatus) &&
      ["ASSIGNED", "PROOF_SUBMITTED", "RECEIVER_CONFIRMED", "ADMIN_VERIFIED"].includes(normalizedStatus)
  );
  const canFinalize = Boolean(input?.adminCanFinalize);
  return {
    canSubmitProof: Boolean(input?.payerCanSubmitProof),
    canConfirmReceived: Boolean(input?.receiverCanConfirm),
    canDispute: false,
    // TODO: Replace rule-based admin verify/cancel with backend flags if added.
    canCancel,
    canAdminVerify,
    canFinalize,
    // TODO: backend should expose attachment permissions.
    canViewAttachments: false,
    canDownloadAttachments: false,
  };
}
