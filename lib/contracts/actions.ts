export type ActionState = "idle" | "loading" | "success" | "error";

export interface ActionFlags {
  state: ActionState;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function deriveActionFlags(state: ActionState): ActionFlags {
  return {
    state,
    isIdle: state === "idle",
    isLoading: state === "loading",
    isSuccess: state === "success",
    isError: state === "error",
  };
}
