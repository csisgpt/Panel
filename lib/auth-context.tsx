'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { wait } from "./utils";

interface User {
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("panel_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setHydrated(true);
  }, []);

  const login = async (username: string, password: string) => {
    await wait(600);
    if (username && password) {
      const mockUser = { name: "ادمین سیستم" };
      setUser(mockUser);
      localStorage.setItem("panel_user", JSON.stringify(mockUser));
      return;
    }
    throw new Error("invalid");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("panel_user");
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user]
  );

  if (!hydrated) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
