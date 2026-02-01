import { mockLogin, mockRegister, mockMe } from "@/lib/mock-data";
import { apiGet, apiPost } from "./client";
import { isMockMode } from "./config";
import { LoginDto, LoginResponse, RegisterDto, RegisterResponse, BackendUser } from "@/lib/types/backend";

export async function login(dto: LoginDto): Promise<LoginResponse> {
  if (isMockMode()) {
    return mockLogin(dto);
  }
  return apiPost<LoginResponse, LoginDto>("/auth/login", dto);
}

export async function register(dto: RegisterDto): Promise<RegisterResponse> {
  if (isMockMode()) {
    return mockRegister(dto);
  }
  return apiPost<RegisterResponse, RegisterDto>("/auth/register", dto);
}

export async function me(): Promise<BackendUser> {
  if (isMockMode()) {
    return mockMe();
  }
  return apiGet<BackendUser>("/auth/me");
}
