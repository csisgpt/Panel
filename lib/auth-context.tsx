"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin } from "@/lib/api/auth";
import { LoginDto, BackendUser, UserRole } from "@/lib/types/backend";

interface AuthContextValue {
  user: BackendUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrader: boolean;
  isClient: boolean;
  loginAsRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (mobile: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "panel_user_v2";
const TOKEN_KEY = "panel_token_v2";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setAccessToken(storedToken);
    }
    setHydrated(true);
  }, []);

  const persistSession = (nextUser: BackendUser, token: string) => {
    setUser(nextUser);
    setAccessToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_KEY, token);
  };

  const loginWithCredentials = async (mobile: string, password: string, role: UserRole) => {
    const dto: LoginDto = { mobile, password };
    const response = await apiLogin(dto);
    if (response.user.role !== role) {
      throw new Error("نقش کاربر مطابقت ندارد");
    }
    persistSession(response.user, response.accessToken);
  };

  const loginAsRole = async (role: UserRole) => {
    const dto: LoginDto = { mobile: role === UserRole.ADMIN ? "09120000000" : "09121111111", password: "mock" };
    const response = await apiLogin(dto);
    const mappedUser = { ...response.user, role };
    persistSession(mappedUser, response.accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === UserRole.ADMIN,
      isTrader: user?.role === UserRole.TRADER,
      isClient: user?.role === UserRole.CLIENT,
      loginAsRole,
      loginWithCredentials,
      logout,
      accessToken,
    }),
    [user, accessToken]
  );

  if (!hydrated) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
