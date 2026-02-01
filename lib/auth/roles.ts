import { BackendUser, UserRole } from "@/lib/types/backend";

export function isAdmin(user?: BackendUser | null) {
  return user?.role === UserRole.ADMIN;
}

export function isUserPanel(user?: BackendUser | null) {
  return user?.role === UserRole.CLIENT || user?.role === UserRole.TRADER;
}
