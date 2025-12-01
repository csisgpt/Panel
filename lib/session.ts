export type PanelRole = "TRADER" | "ADMIN";

export interface PanelSession {
  role: PanelRole;
  userId: string;
}

const SESSION_KEY = "panelSession";
const LEGACY_USER_KEY = "panel_user_v2";
const LEGACY_TOKEN_KEY = "panel_token_v2";

export function getSession(): PanelSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PanelSession;
    if (!parsed.role || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: PanelSession, userPayload?: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (userPayload) {
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userPayload));
    localStorage.setItem(LEGACY_TOKEN_KEY, `mock-token-${session.userId}`);
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}
