import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { db, type Job } from "@/lib/api";

export type { Job };

interface JobContextType {
  jobs: Job[];
  getJob: (id: string) => Job | undefined;
  getEmployerJobs: (employerId: string) => Job[];
  createJob: (job: Omit<Job, "id" | "posted">) => Job;
  updateJob: (id: string, data: Partial<Job>) => void;
  deleteJob: (id: string) => void;
}

const JobContext = createContext<JobContextType>({
  jobs: [],
  getJob: () => undefined,
  getEmployerJobs: () => [],
  createJob: () => ({} as Job),
  updateJob: () => {},
  deleteJob: () => {},
});

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => db.loadJobs());

  const save = (updated: Job[]) => {
    setJobs(updated);
    db.saveJobs(updated);
  };

  const getJob = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);
  const getEmployerJobs = useCallback((eid: string) => jobs.filter((j) => j.employerId === eid), [jobs]);

  const createJob = useCallback(
    (data: Omit<Job, "id" | "posted">) => {
      const newJob: Job = { ...data, id: crypto.randomUUID(), posted: "Just now" };
      save([newJob, ...jobs]);
      return newJob;
    },
    [jobs],
  );

  const updateJob = useCallback(
    (id: string, data: Partial<Job>) => {
      save(jobs.map((j) => (j.id === id ? { ...j, ...data } : j)));
    },
    [jobs],
  );

  const deleteJob = useCallback(
    (id: string) => {
      save(jobs.filter((j) => j.id !== id));
    },
    [jobs],
  );

  return (
    <JobContext.Provider value={{ jobs, getJob, getEmployerJobs, createJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  return useContext(JobContext);
}
