import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, type Job } from "@/lib/api";

export type { Job };

/* ── Demo jobs shown when API is unreachable ────────── */
const demoCompany = { id: 0, companyName: "TrustBee Demo", email: "demo@trustbee.com", description: "Demo company" };

const DEMO_JOBS: Job[] = [
  {
    id: 1, title: "Frontend Developer", description: "Build beautiful UIs with React and TypeScript. Join our growing team and work on exciting projects.",
    country: "Sweden", city: "Stockholm", category: "IT", status: "ACTIVE", company: demoCompany,
    employmentType: "Full-time", expiresAt: "2026-12-31",
  },
  {
    id: 2, title: "Backend Engineer", description: "Design and maintain scalable APIs using Node.js and PostgreSQL. Remote-friendly position.",
    country: "Sweden", city: "Gothenburg", category: "IT", status: "ACTIVE", company: { ...demoCompany, companyName: "Nordic Tech AB" },
    employmentType: "Full-time", expiresAt: "2026-11-30",
  },
  {
    id: 3, title: "UX Designer", description: "Create user-centered designs for web and mobile apps. Collaborate with product and engineering teams.",
    country: "Sweden", city: "Malmö", category: "Design", status: "ACTIVE", company: { ...demoCompany, companyName: "DesignCo" },
    employmentType: "Full-time", expiresAt: "2026-10-15",
  },
  {
    id: 4, title: "Data Analyst", description: "Analyze business data and provide actionable insights. SQL and Python experience preferred.",
    country: "Sweden", city: "Stockholm", category: "Data", status: "ACTIVE", company: { ...demoCompany, companyName: "DataWorks" },
    employmentType: "Part-time", expiresAt: "2026-09-30",
  },
  {
    id: 5, title: "Project Manager", description: "Lead cross-functional teams and deliver projects on time. Agile/Scrum experience is a plus.",
    country: "Sweden", city: "Uppsala", category: "Management", status: "ACTIVE", company: { ...demoCompany, companyName: "BuildRight" },
    employmentType: "Full-time", expiresAt: "2026-12-01",
  },
  {
    id: 6, title: "DevOps Engineer", description: "Manage CI/CD pipelines and cloud infrastructure on AWS. Kubernetes experience required.",
    country: "Norway", city: "Oslo", category: "IT", status: "ACTIVE", company: { ...demoCompany, companyName: "CloudNine" },
    employmentType: "Full-time", expiresAt: "2026-11-15",
  },
];

interface JobContextType {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  isDemo: boolean;
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
  isDemo: false,
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
  const [isDemo, setIsDemo] = useState(false);

  const fetchJobs = useCallback(async (params?: Parameters<typeof api.getJobs>[0]) => {
    setLoading(true);
    try {
      const res = await api.getJobs(params);
      setJobs(res.jobs);
      setTotalJobs(res.meta.totalJobs);
      setCurrentPage(res.meta.currentPage);
      setTotalPages(res.meta.totalPages);
      setIsDemo(false);
    } catch (err) {
      console.error("Failed to fetch jobs, using demo data:", err);
      setJobs(DEMO_JOBS);
      setTotalJobs(DEMO_JOBS.length);
      setCurrentPage(1);
      setTotalPages(1);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: number) => {
    try {
      return await api.getJob(id);
    } catch {
      const demo = DEMO_JOBS.find((j) => j.id === id);
      if (demo) return demo;
      throw new Error("Job not found");
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
    <JobContext.Provider value={{ jobs, totalJobs, currentPage, totalPages, loading, isDemo, fetchJobs, getJob, createJob, updateJob, deleteJob, updateJobStatus }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
