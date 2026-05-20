import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, type Job } from "@/lib/api";

export type { Job };

// Demo jobs — only used in development when the backend is unreachable
const DEV_DEMO_COMPANY = { id: 0, companyName: "TrustBee Demo", email: "demo@trustbee.com", description: "Demo company" };

const DEV_DEMO_JOBS: Job[] = [
  {
    id: 1, title: "Frontend Developer", description: "Build beautiful UIs with React and TypeScript.",
    country: "Sweden", city: "Stockholm", category: "IT", status: "ACTIVE", company: DEV_DEMO_COMPANY,
    employmentType: "Full-time", expiresAt: "2026-12-31",
  },
  {
    id: 2, title: "Backend Engineer", description: "Design and maintain scalable APIs using Node.js and PostgreSQL.",
    country: "Sweden", city: "Gothenburg", category: "IT", status: "ACTIVE", company: { ...DEV_DEMO_COMPANY, companyName: "Nordic Tech AB" },
    employmentType: "Full-time", expiresAt: "2026-11-30",
  },
  {
    id: 3, title: "UX Designer", description: "Create user-centered designs for web and mobile apps.",
    country: "Sweden", city: "Malmö", category: "Design", status: "ACTIVE", company: { ...DEV_DEMO_COMPANY, companyName: "DesignCo" },
    employmentType: "Full-time", expiresAt: "2026-10-15",
  },
];

interface JobContextType {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchJobs: (params?: {
    search?: string;
    status?: string;
    companyId?: number;
    city?: string;
    country?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getJob: (id: number) => Promise<Job>;
  createJob: (data: {
    title: string;
    description: string;
    expiresAt: string;
    webpage_url?: string;
    city?: string;
    country?: string;
    category?: string;
  }) => Promise<Job>;
  updateJob: (id: number, data: Record<string, unknown>) => Promise<void>;
  deleteJob: (id: number) => Promise<void>;
  updateJobStatus: (id: number, status: "ACTIVE" | "ARCHIVED") => Promise<void>;
}

const JobContext = createContext<JobContextType>({
  jobs: [],
  totalJobs: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  fetchJobs: async () => {},
  getJob: async () => ({} as Job),
  createJob: async () => ({} as Job),
  updateJob: async () => {},
  deleteJob: async () => {},
  updateJobStatus: async () => {},
});

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (params?: Parameters<typeof api.getJobs>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobs(params);
      setJobs(res.jobs);
      setTotalJobs(res.meta.totalJobs);
      setCurrentPage(res.meta.currentPage);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      if (import.meta.env.DEV && err instanceof TypeError && (err as TypeError).message.includes("fetch")) {
        // Dev only: show demo jobs when backend is unreachable
        setJobs(DEV_DEMO_JOBS);
        setTotalJobs(DEV_DEMO_JOBS.length);
        setCurrentPage(1);
        setTotalPages(1);
        setError("[Dev] Backend unreachable — showing demo jobs.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to load jobs.";
        setError(msg);
        setJobs([]);
        setTotalJobs(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: number) => {
    try {
      return await api.getJob(id);
    } catch (err) {
      if (import.meta.env.DEV) {
        const demo = DEV_DEMO_JOBS.find((j) => j.id === id);
        if (demo) return demo;
      }
      throw err;
    }
  }, []);

  const createJob = useCallback(async (data: Parameters<typeof api.createJob>[0]) => {
    const newJob = await api.createJob(data);
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  }, []);

  const updateJob = useCallback(async (id: number, data: Record<string, unknown>) => {
    const updated = await api.updateJob(id, data);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
  }, []);

  const deleteJob = useCallback(async (id: number) => {
    await api.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const updateJobStatus = useCallback(async (id: number, status: "ACTIVE" | "ARCHIVED") => {
    const updated = await api.updateJobStatus(id, status);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
  }, []);

  return (
    <JobContext.Provider value={{ jobs, totalJobs, currentPage, totalPages, loading, error, fetchJobs, getJob, createJob, updateJob, deleteJob, updateJobStatus }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
