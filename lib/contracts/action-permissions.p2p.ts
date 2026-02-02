import type { AllocationActions, DepositActions, WithdrawalActions } from "./permissions";

/**
 * P2P allocation permissions contract.
 */
export interface AllocationPermissions {
  allocationId?: string;
  actions: AllocationActions;
}

/**
 * P2P withdrawal permissions contract.
 */
export interface WithdrawalPermissions {
  withdrawalId?: string;
  actions: WithdrawalActions;
}

/**
 * P2P deposit permissions contract.
 */
export interface DepositPermissions {
  depositId?: string;
  actions: DepositActions;
}
