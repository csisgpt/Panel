import { mockLogin } from "@/lib/mock-data";
import { apiPost } from "./client";
import { isMockMode } from "./config";
import { LoginDto, LoginResponse } from "@/lib/types/backend";

export async function login(dto: LoginDto): Promise<LoginResponse> {
  if (isMockMode()) {
    return mockLogin(dto);
  }
  return apiPost<LoginResponse, LoginDto>("/auth/login", dto);
}
