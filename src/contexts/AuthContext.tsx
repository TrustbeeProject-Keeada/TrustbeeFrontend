import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { api, type User, type UserRole } from "@/lib/api";

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmployer: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  registerJobSeeker: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    cv?: string;
    personalStatement?: string;
  }) => Promise<void>;
  registerCompanyRecruiter: (data: {
    email: string;
    password: string;
    companyName: string;
    organizationNumber: number;
    phoneNumber: string;
    description?: string;
    logoUrl?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isEmployer: false,
  login: async () => {},
  registerJobSeeker: async () => {},
  registerCompanyRecruiter: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if we have a token + login info, fetch fresh profile from API
  useEffect(() => {
    const info = api.getStoredLoginInfo();
    if (!info) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        let freshUser: User;
        if (info.role === "COMPANY_RECRUITER") {
          freshUser = await api.getCompanyRecruiter(info.id);
        } else {
          freshUser = await api.getJobSeeker(info.id);
        }
        // Merge token back since profile endpoints don't return it
        setUser({ ...freshUser, token: info.token, role: info.role });
      } catch {
        // Token expired or invalid — clear
        api.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    let loggedIn: User;
    if (role === "COMPANY_RECRUITER") {
      loggedIn = await api.loginCompanyRecruiter(email, password);
    } else {
      loggedIn = await api.loginJobSeeker(email, password);
    }
    setUser(loggedIn);
  }, []);

  const registerJobSeeker = useCallback(async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    cv?: string;
    personalStatement?: string;
  }) => {
    await api.registerJobSeeker(data);
    const loggedIn = await api.loginJobSeeker(data.email, data.password);
    setUser(loggedIn);
  }, []);

  const registerCompanyRecruiter = useCallback(async (data: {
    email: string;
    password: string;
    companyName: string;
    organizationNumber: number;
    phoneNumber: string;
    description?: string;
    logoUrl?: string;
  }) => {
    await api.registerCompanyRecruiter(data);
    const loggedIn = await api.loginCompanyRecruiter(data.email, data.password);
    setUser(loggedIn);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      let freshUser: User;
      if (user.role === "COMPANY_RECRUITER") {
        freshUser = await api.getCompanyRecruiter(user.id);
      } else {
        freshUser = await api.getJobSeeker(user.id);
      }
      setUser((prev) => prev ? { ...prev, ...freshUser } : prev);
    } catch {}
  }, [user]);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    if (!user) throw new Error("Not authenticated");
    let updated: User;
    if (user.role === "COMPANY_RECRUITER") {
      updated = await api.updateCompanyRecruiter(user.id, data);
    } else {
      updated = await api.updateJobSeeker(user.id, data);
    }
    setUser((prev) => prev ? { ...prev, ...updated } : prev);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isEmployer: user?.role === "COMPANY_RECRUITER",
        login,
        registerJobSeeker,
        registerCompanyRecruiter,
        logout,
        updateProfile,
        refreshProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
