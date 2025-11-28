import { apiGet } from "./client";
import { isMockMode } from "./config";
import { getMockInstrumentPrices, getMockInstruments } from "@/lib/mock-data";
import { Instrument, InstrumentPrice } from "@/lib/types/backend";

export async function getInstruments(): Promise<Instrument[]> {
  if (isMockMode()) return getMockInstruments();
  return apiGet<Instrument[]>("/instruments");
}

export async function getInstrumentPrices(): Promise<InstrumentPrice[]> {
  if (isMockMode()) return getMockInstrumentPrices();
  return apiGet<InstrumentPrice[]>("/instruments/prices");
}
