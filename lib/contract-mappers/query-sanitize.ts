export function sanitizeAllowedQuery<T extends object, K extends keyof T & string>(
  params: T,
  allowedKeys: readonly K[]
): Partial<Pick<T, K>> {
  const allowed = new Set<string>(allowedKeys);
  const sanitized = Object.entries(params as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (!allowed.has(key)) return acc;
    if (value === undefined || value === null || value === "") return acc;
    acc[key] = value;
    return acc;
  }, {});

  return sanitized as Partial<Pick<T, K>>;
}

export function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  return search.toString();
}
