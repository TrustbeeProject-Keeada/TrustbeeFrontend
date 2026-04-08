import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, type Job } from "@/lib/api";

export type { Job };

interface JobContextType {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
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

  const fetchJobs = useCallback(async (params?: Parameters<typeof api.getJobs>[0]) => {
    setLoading(true);
    try {
      const res = await api.getJobs(params);
      setJobs(res.jobs);
      setTotalJobs(res.meta.totalJobs);
      setCurrentPage(res.meta.currentPage);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: number) => {
    return api.getJob(id);
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
    <JobContext.Provider value={{ jobs, totalJobs, currentPage, totalPages, loading, fetchJobs, getJob, createJob, updateJob, deleteJob, updateJobStatus }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
