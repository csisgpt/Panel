export interface ApiError {
  status: number;
  code?: string;
  message: string;
  traceId?: string;
  details?: unknown;
}
