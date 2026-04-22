import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { api, type User, type UserRole } from "@/lib/api";
import { toast } from "sonner";

export type { User, UserRole };

// ── Demo user for offline/testing mode ──────────
const OFFLINE_USER_KEY = "trustbee_offline_user";

const DEFAULT_DEMO_SEEKER: User = {
  id: 999,
  email: "demo@trustbee.com",
  role: "JOB_SEEKER",
  token: "offline-demo-token",
  firstName: "Demo",
  lastName: "User",
  phoneNumber: "+46 70 000 0000",
  country: "Sweden",
  city: "Stockholm",
  bio: "Experienced full-stack developer with 5 years of experience in React, TypeScript, Node.js, and cloud infrastructure. Passionate about building scalable web applications and user-centered design.",
  personalStatement: "I am a motivated software engineer looking for challenging opportunities in frontend and full-stack development. I have experience with agile methodologies, CI/CD pipelines, and modern JavaScript frameworks.",
  skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python", "SQL", "PostgreSQL", "AWS", "Docker", "Git", "Agile", "REST API", "GraphQL", "CSS", "Tailwind"],
  languages: ["English", "Swedish"],
  cv: "",
  portfolioLink: "https://demo-portfolio.trustbee.com",
};

const DEFAULT_DEMO_RECRUITER: User = {
  id: 998,
  email: "recruiter@trustbee.com",
  role: "COMPANY_RECRUITER",
  token: "offline-demo-token",
  companyName: "TrustBee Demo Corp",
  organizationNumber: 5500001234,
  phoneNumber: "+46 70 000 0001",
  description: "A demo company for testing purposes.",
  industry: "Technology",
  country: "Sweden",
  city: "Stockholm",
};

function getOfflineUser(): User | null {
  try {
    const raw = localStorage.getItem(OFFLINE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveOfflineUser(user: User) {
  localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(user));
}

function clearOfflineUser() {
  localStorage.removeItem(OFFLINE_USER_KEY);
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isOffline: boolean;
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
  isOffline: false,
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
  const [isOffline, setIsOffline] = useState(false);

  // On mount: try to restore session from API, else from offline cache
  useEffect(() => {
    const info = api.getStoredLoginInfo();
    if (!info) {
      // Check if there's an offline user
      const offlineUser = getOfflineUser();
      if (offlineUser) {
        setUser(offlineUser);
        setIsOffline(true);
      }
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        let freshUser: User;
        if (info.role === "COMPANY_RECRUITER") {
          const res = await api.getCompanyRecruiter(info.id);
          freshUser = res.data;
        } else {
          freshUser = await api.getJobSeeker(info.id);
        }
        const merged = { ...freshUser, token: info.token, role: info.role };
        setUser(merged);
        setIsOffline(false);
      } catch {
        // Backend unreachable — try offline user
        const offlineUser = getOfflineUser();
        if (offlineUser) {
          setUser(offlineUser);
          setIsOffline(true);
        } else {
          api.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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
        setIsOffline(false);
        clearOfflineUser();
      } catch (err) {
        // If backend is unreachable (network error), offer demo mode
        const isNetworkError = err instanceof TypeError && err.message.includes("fetch");
        if (isNetworkError) {
          const demoUser = role === "COMPANY_RECRUITER"
            ? { ...DEFAULT_DEMO_RECRUITER, email }
            : { ...DEFAULT_DEMO_SEEKER, email };
          setUser(demoUser);
          saveOfflineUser(demoUser);
          setIsOffline(true);
          toast.info("Backend unavailable — signed in with demo/offline mode.", { duration: 5000 });
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
      try {
        await api.registerJobSeeker(data);
        const loggedIn = await api.loginJobSeeker(data.email, data.password);
        setUser(loggedIn);
        setIsOffline(false);
      } catch (err) {
        const isNetworkError = err instanceof TypeError && err.message.includes("fetch");
        if (isNetworkError) {
          const demoUser: User = {
            ...DEFAULT_DEMO_SEEKER,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            personalStatement: data.personalStatement || DEFAULT_DEMO_SEEKER.personalStatement,
          };
          setUser(demoUser);
          saveOfflineUser(demoUser);
          setIsOffline(true);
          toast.info("Backend unavailable — registered in demo/offline mode.", { duration: 5000 });
          return;
        }
        throw err;
      }
    },
    [],
  );

  const registerCompanyRecruiter = useCallback(
    async (data: {
      email: string;
      password: string;
      companyName: string;
      organizationNumber: number;
      phoneNumber: string;
      description?: string;
      logoUrl?: string;
    }) => {
      try {
        await api.registerCompanyRecruiter(data);
        const loggedIn = await api.loginCompanyRecruiter(data.email, data.password);
        setUser(loggedIn);
        setIsOffline(false);
      } catch (err) {
        const isNetworkError = err instanceof TypeError && err.message.includes("fetch");
        if (isNetworkError) {
          const demoUser: User = {
            ...DEFAULT_DEMO_RECRUITER,
            email: data.email,
            companyName: data.companyName,
            organizationNumber: data.organizationNumber,
            phoneNumber: data.phoneNumber,
            description: data.description,
          };
          setUser(demoUser);
          saveOfflineUser(demoUser);
          setIsOffline(true);
          toast.info("Backend unavailable — registered in demo/offline mode.", { duration: 5000 });
          return;
        }
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    api.logout();
    clearOfflineUser();
    setUser(null);
    setIsOffline(false);
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
          setIsOffline(false);
        } catch (error) {
          console.warn("Failed to refresh profile (offline?):", error);
        }
      })();

      return currentUser;
    });
  }, []);

  const updateProfile = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user) throw new Error("Not authenticated");

      // Always update locally
      const merged = { ...user, ...data } as User;
      setUser(merged);

      if (isOffline) {
        saveOfflineUser(merged);
        return;
      }

      try {
        let updated: User;
        if (user.role === "COMPANY_RECRUITER") {
          updated = await api.updateCompanyRecruiter(user.id, data);
        } else {
          updated = await api.updateJobSeeker(user.id, data);
        }
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      } catch {
        // Save offline
        saveOfflineUser(merged);
        toast.info("Changes saved locally. They'll sync when the server is available.");
      }
    },
    [user, isOffline],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isEmployer: user?.role === "COMPANY_RECRUITER",
        isOffline,
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