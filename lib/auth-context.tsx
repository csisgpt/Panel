"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, register as apiRegister, me as apiMe } from "@/lib/api/auth";
import { LoginDto, BackendUser, RegisterDto } from "@/lib/types/backend";
import { clearSession, getSession, setSession } from "@/lib/session";
import { isApiError } from "@/lib/contracts/errors";

interface AuthContextValue {
  user: BackendUser | null;
  isAuthenticated: boolean;
  loginWithCredentials: (mobile: string, password: string) => Promise<BackendUser>;
  registerWithCredentials: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  bootstrap: () => Promise<BackendUser | null>;
  accessToken: string | null;
  hydrated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      setAccessToken(session.token);
    }
    setHydrated(true);
  }, []);

  const persistSession = useCallback((nextUser: BackendUser, token: string) => {
    setUser(nextUser);
    setAccessToken(token);
    setSession({ user: nextUser, token });
  }, []);

  const loginWithCredentials = useCallback(async (mobile: string, password: string) => {
    const dto: LoginDto = { mobile, password };
    const response = await apiLogin(dto);
    persistSession(response.user, response.accessToken);
    return response.user;
  }, [persistSession]);

  const registerWithCredentials = useCallback(async (dto: RegisterDto) => {
    await apiRegister(dto);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    clearSession();
  }, []);

  const bootstrap = useCallback(async () => {
    const existing = getSession();
    if (!existing?.token) return null;
    try {
      const profile = await apiMe();
      persistSession(profile, existing.token);
      return profile;
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        logout();
        return null;
      }
      throw err;
    }
  }, [persistSession, logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loginWithCredentials,
      registerWithCredentials,
      logout,
      bootstrap,
      accessToken,
      hydrated,
    }),
    [user, accessToken, loginWithCredentials, registerWithCredentials, logout, bootstrap, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
