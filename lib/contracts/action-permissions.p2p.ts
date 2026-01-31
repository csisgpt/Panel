import type { AllocationActions, DepositActions, WithdrawalActions } from "./permissions";

/**
 * P2P allocation permissions contract.
 */
export interface AllocationPermissions extends AllocationActions {
  allocationId?: string;
}

/**
 * P2P withdrawal permissions contract.
 */
export interface WithdrawalPermissions extends WithdrawalActions {
  withdrawalId?: string;
}

/**
 * P2P deposit permissions contract.
 */
export interface DepositPermissions extends DepositActions {
  depositId?: string;
}
