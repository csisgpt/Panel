import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockTrade, getMockTradeById, getMockTrades } from "@/lib/mock-data";
import { CreateTradeDto, Trade } from "@/lib/types/backend";

export async function getMyTrades(): Promise<Trade[]> {
  if (isMockMode()) return getMockTrades();
  return apiGet<Trade[]>("/trades/my");
}

export async function createTrade(dto: CreateTradeDto): Promise<Trade> {
  if (isMockMode()) return createMockTrade(dto);
  return apiPost<Trade, CreateTradeDto>("/trades", dto);
}

export async function getTrade(id: string): Promise<Trade> {
  if (isMockMode()) return getMockTradeById(id);
  return apiGet<Trade>(`/trades/${id}`);
}
