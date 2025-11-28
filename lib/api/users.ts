import { apiGet, apiPatch, apiPost } from "./client";
import { isMockMode } from "./config";
import { createMockUser, getMockUser, getMockUsers, updateMockUser } from "@/lib/mock-data";
import { BackendUser, CreateUserDto, UpdateUserDto } from "@/lib/types/backend";

export async function getUsers(): Promise<BackendUser[]> {
  if (isMockMode()) return getMockUsers();
  return apiGet<BackendUser[]>("/users");
}

export async function getUser(id: string): Promise<BackendUser | null> {
  if (isMockMode()) return getMockUser(id);
  return apiGet<BackendUser>(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<BackendUser> {
  if (isMockMode()) return createMockUser(dto);
  return apiPost<BackendUser, CreateUserDto>("/users", dto);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<BackendUser> {
  if (isMockMode()) return updateMockUser(id, dto);
  return apiPatch<BackendUser, UpdateUserDto>(`/users/${id}`, dto);
}
