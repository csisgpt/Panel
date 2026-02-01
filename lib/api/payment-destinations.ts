import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import type { DestinationForm, PaymentDestination } from "@/lib/contracts/p2p";
import {
  createMockDestination,
  getMockUserDestinations,
  setMockDefaultDestination,
  updateMockDestination,
} from "@/lib/mock-data";

export async function listUserDestinations(): Promise<PaymentDestination[]> {
  if (isMockMode()) return getMockUserDestinations();
  return apiGet<PaymentDestination[]>("/destinations");
}

export async function createUserDestination(payload: DestinationForm): Promise<PaymentDestination> {
  if (isMockMode()) return createMockDestination({ ...payload, id: "", isDefault: false } as PaymentDestination);
  return apiPost<PaymentDestination, DestinationForm>("/destinations", payload);
}

export async function updateUserDestination(
  destinationId: string,
  payload: DestinationForm
): Promise<PaymentDestination> {
  if (isMockMode()) return updateMockDestination({ ...payload, id: destinationId } as PaymentDestination);
  return apiPatch<PaymentDestination, DestinationForm>(`/destinations/${destinationId}`, payload);
}

export async function makeUserDestinationDefault(destinationId: string): Promise<PaymentDestination[]> {
  if (isMockMode()) return setMockDefaultDestination(destinationId);
  return apiPost<PaymentDestination[], { id: string }>(`/destinations/${destinationId}/make-default`, {
    id: destinationId,
  });
}

export async function listAdminDestinations(): Promise<PaymentDestination[]> {
  if (isMockMode()) return getMockUserDestinations();
  return apiGet<PaymentDestination[]>("/admin/destinations");
}
