import { UserRole } from "@/lib/types/backend";

interface RedirectInput {
  userRole: UserRole;
  returnTo?: string | null;
}

const ADMIN_ROOT = "/admin";
const TRADER_ROOT = "/trader";

export function resolvePostLoginRedirect({ userRole, returnTo }: RedirectInput) {
  if (returnTo && isSafeReturnTo(returnTo)) {
    if (returnTo.startsWith(ADMIN_ROOT) && userRole === UserRole.ADMIN) {
      return returnTo;
    }
    if (returnTo.startsWith(TRADER_ROOT) && (userRole === UserRole.CLIENT || userRole === UserRole.TRADER)) {
      return returnTo;
    }
    if (!returnTo.startsWith(ADMIN_ROOT) && !returnTo.startsWith(TRADER_ROOT)) {
      return returnTo;
    }
  }

  return userRole === UserRole.ADMIN ? "/admin/dashboard" : "/trader/dashboard";
}

function isSafeReturnTo(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}
