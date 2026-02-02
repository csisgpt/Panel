export type SortModel = { id: string; desc?: boolean } | string;
export type FiltersModel = Record<string, unknown>;

export interface TableState {
  page?: number;
  limit?: number;
  sort?: SortModel;
  filters?: FiltersModel;
  search?: string;
}
