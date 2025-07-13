
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  userPhone: string | null;
  login: (phone: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedPhone = localStorage.getItem("userPhone");
    if (storedPhone) {
      setUserPhone(storedPhone);
    }
  }, []);

  const login = (phone: string) => {
    localStorage.setItem("userPhone", phone);
    setUserPhone(phone);
  };

  const logout = () => {
    localStorage.removeItem("userPhone");
    setUserPhone(null);
  };

  const isAuthenticated = !!userPhone;
  
  const value = { userPhone, login, logout, isAuthenticated };

  // Render children only after mount to avoid hydration mismatch
  return (
    <AuthContext.Provider value={value}>
      {isMounted ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
