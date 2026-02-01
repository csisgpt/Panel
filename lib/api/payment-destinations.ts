import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import type { DestinationForm, PaymentDestination } from "@/lib/contracts/p2p";
import {
  createMockDestination,
  getMockUserDestinations,
  setMockDefaultDestination,
  updateMockDestination,
} from "@/lib/mock-data";

const USER_DESTINATIONS_BASE = "/p2p/destinations";
const ADMIN_DESTINATIONS_BASE = "/admin/p2p/destinations";

export async function listUserDestinations(): Promise<PaymentDestination[]> {
  if (isMockMode()) return getMockUserDestinations();
  return apiGet<PaymentDestination[]>(USER_DESTINATIONS_BASE);
}

export async function createUserDestination(payload: DestinationForm): Promise<PaymentDestination> {
  if (isMockMode()) return createMockDestination({ ...payload, id: "", isDefault: false } as PaymentDestination);
  return apiPost<PaymentDestination, DestinationForm>(USER_DESTINATIONS_BASE, payload);
}

export async function updateUserDestination(
  destinationId: string,
  payload: DestinationForm
): Promise<PaymentDestination> {
  if (isMockMode()) return updateMockDestination({ ...payload, id: destinationId } as PaymentDestination);
  return apiPatch<PaymentDestination, DestinationForm>(`${USER_DESTINATIONS_BASE}/${destinationId}`, payload);
}

export async function makeUserDestinationDefault(destinationId: string): Promise<PaymentDestination[]> {
  if (isMockMode()) return setMockDefaultDestination(destinationId);
  // TODO: Confirm backend naming for default-destination action.
  return apiPost<PaymentDestination[], { id: string }>(`${USER_DESTINATIONS_BASE}/${destinationId}/make-default`, {
    id: destinationId,
  });
}

export async function listAdminDestinations(): Promise<PaymentDestination[]> {
  if (isMockMode()) return getMockUserDestinations();
  return apiGet<PaymentDestination[]>(ADMIN_DESTINATIONS_BASE);
}
