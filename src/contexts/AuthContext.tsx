import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { db, type User, type UserRole, type RegisterRequest, type UpdateProfileRequest } from "@/lib/api";

export type { User, UserRole, RegisterRequest };
export type RegisterData = RegisterRequest;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmployer: boolean;
  login: (email: string, password: string) => void;
  register: (data: RegisterData) => void;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isEmployer: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => db.getStoredUser());

  const login = useCallback((email: string, password: string) => {
    const found = db.login(email, password);
    setUser(found);
  }, []);

  const register = useCallback((data: RegisterData) => {
    const newUser = db.register(data);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    db.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: UpdateProfileRequest) => {
    if (!user) throw new Error("Not authenticated");
    const updated = db.updateProfile(user, data);
    setUser(updated);
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
