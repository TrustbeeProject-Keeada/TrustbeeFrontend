import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, fallback, USE_BACKEND, type Job } from "@/lib/api";

export type { Job };

interface JobContextType {
  jobs: Job[];
  getJob: (id: string) => Job | undefined;
  getEmployerJobs: (employerId: string) => Job[];
  createJob: (job: Omit<Job, "id" | "posted">) => Promise<Job>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

const defaultJobContext: JobContextType = {
  jobs: [],
  getJob: () => undefined,
  getEmployerJobs: () => [],
  createJob: async () => ({} as Job),
  updateJob: async () => {},
  deleteJob: async () => {},
  refreshJobs: async () => {},
};

const JobContext = createContext<JobContextType>(defaultJobContext);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => fallback.loadJobs());

  const persist = (updated: Job[]) => {
    setJobs(updated);
    if (!USE_BACKEND) fallback.saveJobs(updated);
  };

  const refreshJobs = useCallback(async () => {
    if (USE_BACKEND) {
      const res = await api.getJobs();
      setJobs(res.jobs);
    }
  }, []);

  const getJob = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);
  const getEmployerJobs = useCallback((employerId: string) => jobs.filter((j) => j.employerId === employerId), [jobs]);

  const createJob = useCallback(
    async (data: Omit<Job, "id" | "posted">) => {
      if (USE_BACKEND) {
        const res = await api.createJob(data);
        setJobs((prev) => [res.job, ...prev]);
        return res.job;
      }
      const newJob: Job = { ...data, id: crypto.randomUUID(), posted: "Just now" };
      persist([newJob, ...jobs]);
      return newJob;
    },
    [jobs]
  );

  const updateJob = useCallback(
    async (id: string, data: Partial<Job>) => {
      if (USE_BACKEND) {
        await api.updateJob(id, data);
        await refreshJobs();
        return;
      }
      persist(jobs.map((j) => (j.id === id ? { ...j, ...data } : j)));
    },
    [jobs, refreshJobs]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      if (USE_BACKEND) {
        await api.deleteJob(id);
        setJobs((prev) => prev.filter((j) => j.id !== id));
        return;
      }
      persist(jobs.filter((j) => j.id !== id));
    },
    [jobs]
  );

  return (
    <JobContext.Provider value={{ jobs, getJob, getEmployerJobs, createJob, updateJob, deleteJob, refreshJobs }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
