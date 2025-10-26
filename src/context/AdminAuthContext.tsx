// src/context/AdminAuthContext.tsx
import { createContext, useState, useEffect, useContext } from "react";

export interface AdminUser {
  id: string;
  email: string;
  isAdmin: boolean;
  adminRole?: 'main' | 'company';
  companyId?: string;
  name?: string;
  surname?: string;
  image?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (userData: AdminUser, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: AdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("admin-user");
      const savedToken = localStorage.getItem("admin-token");
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Error loading admin auth state:", error);
      // Clear corrupted data
      localStorage.removeItem("admin-user");
      localStorage.removeItem("admin-token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: AdminUser, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("admin-user", JSON.stringify(userData));
    localStorage.setItem("admin-token", authToken);
  };

  const logout = () => {
    localStorage.removeItem("admin-user");
    localStorage.removeItem("admin-token");
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData: AdminUser) => {
    setUser(userData);
    localStorage.setItem("admin-user", JSON.stringify(userData));
  };

  return (
    <AdminAuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
