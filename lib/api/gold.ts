import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockGoldLot, getMockGoldLots } from "@/lib/mock-data";
import { CreateGoldLotDto, GoldLot } from "@/lib/types/backend";

export async function getGoldLots(): Promise<GoldLot[]> {
  if (isMockMode()) return getMockGoldLots();
  return apiGet<GoldLot[]>("/gold/lots");
}

export async function createGoldLot(dto: CreateGoldLotDto): Promise<GoldLot> {
  if (isMockMode()) return createMockGoldLot(dto);
  return apiPost<GoldLot, CreateGoldLotDto>("/gold/lots", dto);
}
