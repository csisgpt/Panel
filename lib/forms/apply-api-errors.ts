import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiFieldError, isApiError } from "@/lib/contracts/errors";

type ApplyApiValidationOptions = {
  rootPath?: string;
};

const bracketPattern = /\[(\d+)\]/g;

function normalizePath(path: string) {
  return path.replace(bracketPattern, ".$1");
}

export function applyApiValidationErrorsToRHF<TFields extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFields>,
  options: ApplyApiValidationOptions = {}
) {
  if (!isApiError(error)) return;
  const details = error.details;
  if (!Array.isArray(details)) return;

  const rootPath = (options.rootPath ?? "root") as Path<TFields>;
  const fallbackMessage = error.message || "خطای اعتبارسنجی";

  let hasFieldErrors = false;

  details.forEach((detail) => {
    if (!detail || typeof detail !== "object") return;
    const fieldError = detail as ApiFieldError;
    if (typeof fieldError.path !== "string") return;
    const path = normalizePath(fieldError.path) as Path<TFields>;
    const message = typeof fieldError.message === "string" ? fieldError.message : fallbackMessage;
    setError(path, { type: "server", message });
    hasFieldErrors = true;
  });

  if (!hasFieldErrors) {
    setError(rootPath, { type: "server", message: fallbackMessage });
  }
}
