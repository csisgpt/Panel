import { BackendUser } from "@/lib/types/backend";

export interface PanelSession {
  token: string;
  user: BackendUser;
}

const LEGACY_USER_KEY = "panel_user_v2";
const LEGACY_TOKEN_KEY = "panel_token_v2";
const SESSION_KEY = "panel_session_v2";

export function setSession(session: PanelSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(session.user));
  localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): PanelSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PanelSession;
      if (parsed?.token && parsed?.user) return parsed;
    } catch {
      return null;
    }
  }
  const token = localStorage.getItem(LEGACY_TOKEN_KEY);
  const userRaw = localStorage.getItem(LEGACY_USER_KEY);
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw) as BackendUser;
      return { token, user };
    } catch {
      return null;
    }
  }
  return null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}
