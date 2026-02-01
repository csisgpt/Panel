import type { ApiError } from "./errors";

export type ActionUIStatus = "idle" | "loading" | "success" | "error";

export interface ActionUIState {
  status: ActionUIStatus;
  error?: ApiError;
}

/** Build an idle UI state. */
export function idleState(): ActionUIState {
  return { status: "idle" };
}

/** Build a loading UI state. */
export function loadingState(): ActionUIState {
  return { status: "loading" };
}

/** Build a success UI state. */
export function successState(): ActionUIState {
  return { status: "success" };
}

/** Build an error UI state. */
export function errorState(error: ApiError): ActionUIState {
  return { status: "error", error };
}
