import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import type { DestinationForm } from "@/lib/contracts/p2p";
import type { PaymentDestinationView } from "@/lib/types/backend";
import {
  createMockDestination,
  getMockUserDestinations,
  setMockDefaultDestination,
  updateMockDestination,
} from "@/lib/mock-data";

const ME_DESTINATIONS_BASE = "/me/payout-destinations";
const ADMIN_DESTINATIONS_BASE = "/admin/destinations";

function normalizeDestinationPayload(payload: DestinationForm): DestinationForm {
  if (payload.type && payload.value) return payload;
  if (payload.iban) {
    return { ...payload, type: "IBAN", value: payload.iban };
  }
  if (payload.cardNumber) {
    return { ...payload, type: "CARD", value: payload.cardNumber };
  }
  return payload;
}

function mapMockDestinationToView(input: any): PaymentDestinationView {
  const maskedValue = input.maskedValue ?? input.iban ?? input.cardNumber ?? input.label ?? input.id;
  return {
    id: input.id,
    type: input.type ?? (input.iban ? "IBAN" : input.cardNumber ? "CARD" : "ACCOUNT"),
    maskedValue,
    bankName: input.bankName,
    ownerNameMasked: undefined,
    title: input.title ?? input.label,
    isDefault: Boolean(input.isDefault),
    status: input.status ?? "ACTIVE",
    lastUsedAt: null,
  };
}

export async function listUserDestinations(): Promise<PaymentDestinationView[]> {
  if (isMockMode()) return (await getMockUserDestinations()).map(mapMockDestinationToView);
  return apiGet<PaymentDestinationView[]>(ME_DESTINATIONS_BASE);
}

export async function createUserDestination(payload: DestinationForm): Promise<PaymentDestinationView> {
  if (isMockMode()) {
    const created = await createMockDestination({ label: payload.title ?? payload.value, id: "", isDefault: false } as any);
    return mapMockDestinationToView(created as any);
  }
  return apiPost<PaymentDestinationView, DestinationForm>(ME_DESTINATIONS_BASE, normalizeDestinationPayload(payload));
}

export async function updateUserDestination(
  destinationId: string,
  payload: DestinationForm
): Promise<PaymentDestinationView> {
  if (isMockMode()) {
    const updated = await updateMockDestination({ label: payload.title ?? payload.value, id: destinationId } as any);
    return mapMockDestinationToView(updated as any);
  }
  return apiPatch<PaymentDestinationView, DestinationForm>(`${ME_DESTINATIONS_BASE}/${destinationId}`, normalizeDestinationPayload(payload));
}

export async function makeUserDestinationDefault(destinationId: string): Promise<PaymentDestinationView> {
  if (isMockMode()) {
    const items = await setMockDefaultDestination(destinationId);
    const current = items.find((item) => item.id === destinationId) ?? items[0];
    return mapMockDestinationToView(current as any);
  }
  return apiPost<PaymentDestinationView, Record<string, never>>(`${ME_DESTINATIONS_BASE}/${destinationId}/make-default`, {});
}

export async function listAdminDestinations(direction: "PAYOUT" | "COLLECTION" = "PAYOUT"): Promise<PaymentDestinationView[]> {
  if (isMockMode()) return (await getMockUserDestinations()).map(mapMockDestinationToView);
  return apiGet<PaymentDestinationView[]>(`${ADMIN_DESTINATIONS_BASE}?direction=${direction}`);
}

export async function createSystemDestination(payload: DestinationForm): Promise<PaymentDestinationView> {
  if (isMockMode()) {
    const created = await createMockDestination({ label: payload.title ?? payload.value, id: "", isDefault: false } as any);
    return mapMockDestinationToView(created as any);
  }
  return apiPost<PaymentDestinationView, DestinationForm>(`${ADMIN_DESTINATIONS_BASE}/system`, normalizeDestinationPayload(payload));
}
