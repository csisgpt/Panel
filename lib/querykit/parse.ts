import { listParamsSchema, type ListParams } from "./schemas";

export function parseListParams(searchParams: URLSearchParams): ListParams {
  const raw = Object.fromEntries(searchParams.entries());
  return listParamsSchema.parse(raw);
}
