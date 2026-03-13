"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Role = "Admin" | "Manager" | "Operator" | "Viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  org: string;
  avatar: string | null;
  initials: string;
}

interface AuthContextValue {
  user: User;
  role: string;
  setRole: (role: string) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<Pick<User, "name" | "email">>) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const defaultUser: User = {
  id: "usr_001",
  name: "Alex Morgan",
  email: "alex.morgan@uniflo.io",
  role: "Admin",
  org: "Uniflo Demo Co",
  avatar: null,
  initials: "AM",
};

function readAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("uniflo-auth") === "true";
}

function readRole(): string {
  if (typeof window === "undefined") return "admin";
  return localStorage.getItem("uniflo-role") || "admin";
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [role, setRoleState] = useState(() => readRole());
  const [isAuthenticated, setIsAuthenticated] = useState(() => readAuth());

  const setRole = useCallback((newRole: string) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("uniflo-role", newRole);
    }
  }, []);

  const login = useCallback((_email: string, _password: string) => {
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("uniflo-auth", "true");
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("uniflo-auth");
      localStorage.removeItem("uniflo-role");
    }
  }, []);

  const updateUser = useCallback((updates: Partial<Pick<User, "name" | "email">>) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
      initials: updates.name ? getInitials(updates.name) : prev.initials,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setRole, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
