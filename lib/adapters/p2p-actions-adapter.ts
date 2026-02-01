import type { AllocationActions } from "@/lib/contracts/permissions";

export interface BackendAllocationActions {
  payerCanSubmitProof?: boolean;
  receiverCanConfirm?: boolean;
  adminCanFinalize?: boolean;
}

/**
 * Map backend allocation actions to frontend permissions contract.
 */
export function adaptAllocationActions(input?: BackendAllocationActions | null): AllocationActions {
  return {
    canSubmitProof: Boolean(input?.payerCanSubmitProof),
    canConfirmReceived: Boolean(input?.receiverCanConfirm),
    canDispute: false,
    canCancel: false,
    canAdminVerify: false,
    canFinalize: Boolean(input?.adminCanFinalize),
    // TODO: backend should expose attachment permissions.
    canViewAttachments: false,
    canDownloadAttachments: false,
  };
}
