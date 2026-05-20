import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { api, type User, type UserRole, ApiError, setUnauthorizedHandler } from "@/lib/api";
import { toast } from "sonner";

export type { User, UserRole };

// ── Demo fallback (development only) ────────────
const DEV_DEMO_SEEKER: User = {
  id: 999,
  email: "demo@trustbee.com",
  role: "JOB_SEEKER",
  firstName: "Demo",
  lastName: "User",
  phoneNumber: "+46 70 000 0000",
  country: "Sweden",
  city: "Stockholm",
  bio: "Experienced full-stack developer with 5 years of experience in React, TypeScript, Node.js, and cloud infrastructure.",
  personalStatement:
    "I am a motivated software engineer looking for challenging opportunities in frontend and full-stack development.",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
  languages: ["English", "Swedish"],
  cv: "",
  portfolioLink: "https://demo-portfolio.trustbee.com",
};

const DEV_DEMO_RECRUITER: User = {
  id: 998,
  email: "recruiter@trustbee.com",
  role: "COMPANY_RECRUITER",
  companyName: "TrustBee Demo Corp",
  organizationNumber: "5500001234",
  phoneNumber: "+46 70 000 0001",
  description: "A demo company for testing purposes.",
  industry: "Technology",
  country: "Sweden",
  city: "Stockholm",
};

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
    organizationNumber: string;
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

  // Register the global 401 handler so any expired-cookie response immediately
  // clears the user — ProtectedRoute then redirects to /login automatically.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      api.clearSession();
      setUser(null);
    });
  }, []);

  // On mount: restore session using the stored session hint + cookie
  useEffect(() => {
    const hint = api.getSessionHint();
    if (!hint) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        let freshUser: User;
        if (hint.role === "COMPANY_RECRUITER") {
          const res = await api.getCompanyRecruiter(hint.id);
          freshUser = res.data;
        } else {
          freshUser = await api.getJobSeeker(hint.id);
        }
        setUser({ ...freshUser, role: hint.role });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // Cookie expired or invalid — clear session
          api.clearSession();
        } else if (import.meta.env.DEV) {
          // Dev only: show a notice but don't block the user
          toast.warning("Backend unreachable — session could not be restored.");
        } else {
          toast.error("Could not restore your session. Please log in again.");
          api.clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      try {
        let loggedIn: User;
        if (role === "COMPANY_RECRUITER") {
          loggedIn = await api.loginCompanyRecruiter(email, password);
        } else {
          loggedIn = await api.loginJobSeeker(email, password);
        }
        setUser(loggedIn);
      } catch (err) {
        if (
          import.meta.env.DEV &&
          err instanceof TypeError &&
          err.message.includes("fetch")
        ) {
          // Dev only: fall back to a demo user when the backend is unreachable
          const demoUser =
            role === "COMPANY_RECRUITER"
              ? { ...DEV_DEMO_RECRUITER, email }
              : { ...DEV_DEMO_SEEKER, email };
          setUser(demoUser);
          toast.info("[Dev] Backend unreachable — using demo mode.", {
            duration: 5000,
          });
          return;
        }
        throw err;
      }
    },
    [],
  );

  const registerJobSeeker = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      cv?: string;
      personalStatement?: string;
    }) => {
      if (
        import.meta.env.DEV
      ) {
        try {
          await api.registerJobSeeker(data);
          const loggedIn = await api.loginJobSeeker(data.email, data.password);
          setUser(loggedIn);
          return;
        } catch (err) {
          if (err instanceof TypeError && err.message.includes("fetch")) {
            const demoUser: User = {
              ...DEV_DEMO_SEEKER,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              personalStatement:
                data.personalStatement || DEV_DEMO_SEEKER.personalStatement,
            };
            setUser(demoUser);
            toast.info("[Dev] Backend unreachable — registered in demo mode.", {
              duration: 5000,
            });
            return;
          }
          throw err;
        }
      }

      await api.registerJobSeeker(data);
      const loggedIn = await api.loginJobSeeker(data.email, data.password);
      setUser(loggedIn);
    },
    [],
  );

  const registerCompanyRecruiter = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      organizationNumber: string;
      phoneNumber: string;
      description?: string;
      logoUrl?: string;
    }) => {
      if (import.meta.env.DEV) {
        try {
          await api.registerCompanyRecruiter(data);
          const loggedIn = await api.loginCompanyRecruiter(
            data.email,
            data.password,
          );
          setUser(loggedIn);
          return;
        } catch (err) {
          if (err instanceof TypeError && err.message.includes("fetch")) {
            const demoUser: User = {
              ...DEV_DEMO_RECRUITER,
              email: data.email,
              companyName: data.companyName,
              organizationNumber: data.organizationNumber,
              phoneNumber: data.phoneNumber,
              description: data.description,
            };
            setUser(demoUser);
            toast.info("[Dev] Backend unreachable — registered in demo mode.", {
              duration: 5000,
            });
            return;
          }
          throw err;
        }
      }

      await api.registerCompanyRecruiter(data);
      const loggedIn = await api.loginCompanyRecruiter(
        data.email,
        data.password,
      );
      setUser(loggedIn);
    },
    [],
  );

  const logout = useCallback(() => {
    api.logout().catch(() => {
      // Ignore network errors on logout — session hint is already cleared
    });
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      (async () => {
        try {
          let freshUser: User;
          if (currentUser.role === "COMPANY_RECRUITER") {
            const res = await api.getCompanyRecruiter(currentUser.id);
            freshUser = res.data;
          } else {
            freshUser = await api.getJobSeeker(currentUser.id);
          }
          setUser((prev) => (prev ? { ...prev, ...freshUser } : prev));
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("Failed to refresh profile:", error);
          }
        }
      })();

      return currentUser;
    });
  }, []);

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user) throw new Error("Not authenticated");

      // Optimistic update
      setUser((prev) => (prev ? { ...prev, ...data } : prev));

      let updated: User;
      if (user.role === "COMPANY_RECRUITER") {
        updated = await api.updateCompanyRecruiter(user.id, data);
      } else {
        updated = await api.updateJobSeeker(user.id, data);
      }
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
    },
    [user],
  );

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
// @refresh reset
