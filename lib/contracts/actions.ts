/**
 * @deprecated Use ActionUIState from `action-ui-state` for local async state
 * and ActionPermissions from `permissions` for backend permissions.
 */
export type ActionState = "idle" | "loading" | "success" | "error";

/**
 * @deprecated Use ActionUIState from `action-ui-state`.
 */
export interface ActionFlags {
  state: ActionState;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * @deprecated Use ActionUIState from `action-ui-state`.
 */
export function deriveActionFlags(state: ActionState): ActionFlags {
  return {
    state,
    isIdle: state === "idle",
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
  };
}

export type { ActionUIState, ActionUIStatus } from "./action-ui-state";
export type { ActionPermissions } from "./permissions";
