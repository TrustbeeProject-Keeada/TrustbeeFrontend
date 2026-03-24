import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  api,
  fallback,
  USE_BACKEND,
  setAuthToken,
  clearAuthToken,
  type User,
  type UserRole,
  type RegisterRequest,
  type UpdateProfileRequest,
} from "@/lib/api";

export type { User, UserRole, RegisterRequest };

// Re-export RegisterData as alias for backward compat
export type RegisterData = RegisterRequest;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmployer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
}

const defaultAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isEmployer: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => fallback.getStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    if (USE_BACKEND) {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      setUser(res.user);
    } else {
      const found = fallback.login(email, password);
      setUser(found);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (USE_BACKEND) {
      const res = await api.register(data);
      setAuthToken(res.token);
      setUser(res.user);
    } else {
      const newUser = fallback.register(data);
      setUser(newUser);
    }
  }, []);

  const logout = useCallback(() => {
    if (USE_BACKEND) {
      api.logout().catch(() => {});
    }
    clearAuthToken();
    fallback.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    if (!user) throw new Error("Not authenticated");
    if (USE_BACKEND) {
      const res = await api.updateProfile(data);
      setUser(res.user);
    } else {
      const updated = fallback.updateProfile(user, data);
      setUser(updated);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isEmployer: user?.role === "employer",
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
