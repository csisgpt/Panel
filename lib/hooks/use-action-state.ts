"use client";

import { useCallback, useState } from "react";
import type { ApiError } from "@/lib/contracts/errors";
import {
  ActionUIState,
  errorState,
  idleState,
  loadingState,
  successState,
} from "@/lib/contracts/action-ui-state";

/**
 * Small helper hook for local async UI state handling.
 */
export function useActionState(initial: ActionUIState = idleState()) {
  const [state, setState] = useState<ActionUIState>(initial);

  const setIdle = useCallback(() => setState(idleState()), []);
  const setLoading = useCallback(() => setState(loadingState()), []);
  const setSuccess = useCallback(() => setState(successState()), []);
  const setError = useCallback((error: ApiError) => setState(errorState(error)), []);

  return {
    state,
    setState,
    setIdle,
    setLoading,
    setSuccess,
    setError,
  };
}
