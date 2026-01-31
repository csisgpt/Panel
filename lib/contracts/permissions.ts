import type { ApiError } from "./errors";

/** Generic permissions map for action gates. */
export type ActionPermissions = Record<string, boolean>;

/**
 * Safely checks a permission flag by key.
 */
export function hasPermission(actions: ActionPermissions | null | undefined, key: string) {
  if (!actions) return false;
  return Boolean(actions[key]);
}

export interface AllocationActions {
  canSubmitProof: boolean;
  canConfirmReceived: boolean;
  canDispute: boolean;
  canCancel: boolean;
  canAdminVerify: boolean;
  canFinalize: boolean;
  canViewAttachments: boolean;
  canDownloadAttachments: boolean;
}

export interface WithdrawalActions {
  canSelectDestination: boolean;
  canCancel: boolean;
  canViewAllocations: boolean;
}

export interface DepositActions {
  canCancel: boolean;
  canViewAttachments: boolean;
}

/**
 * Optional convenience wrapper for permissions + UI state bundling.
 */
export interface ActionPermissionState<T extends ActionPermissions> {
  actions: T;
  lastError?: ApiError | null;
}
