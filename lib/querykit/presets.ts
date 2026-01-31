import type { ListParams } from "./schemas";

export interface QueryPreset {
  id: string;
  label: string;
  params: Partial<ListParams>;
}

export const defaultPresets: QueryPreset[] = [
  {
    id: "all",
    label: "همه",
    params: { page: 1, limit: 20 },
  },
  {
    id: "urgent",
    label: "فوری",
    params: { expiresSoon: true, page: 1, limit: 20 },
  },
  {
    id: "with-proof",
    label: "با رسید",
    params: { hasProof: true, page: 1, limit: 20 },
  },
];
