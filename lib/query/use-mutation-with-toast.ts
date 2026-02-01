"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { ApiError } from "@/lib/contracts/errors";

export function useMutationWithToast<TData, TVariables = void>(
  options: UseMutationOptions<TData, ApiError, TVariables> & {
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const { successMessage = "عملیات با موفقیت انجام شد", errorMessage, ...rest } = options;

  return useMutation<TData, ApiError, TVariables>({
    ...rest,
    onSuccess: (data, variables, context) => {
      toast({ title: successMessage });
      rest.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast({
        title: errorMessage ?? error.message,
        description: error.traceId ? `Trace: ${error.traceId}` : undefined,
        variant: "destructive",
      });
      rest.onError?.(error, variables, context);
    },
  });
}
