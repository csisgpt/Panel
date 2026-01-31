import { z } from "zod";

export const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  hasProof: z.coerce.boolean().optional(),
  expiresSoon: z.coerce.boolean().optional(),
});

export type ListParams = z.infer<typeof listParamsSchema>;
