import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type SavedJobEntry, type SavedCompanyEntry } from "@/lib/api";

export interface SavedJob {
  id: number;
  title: string;
  companyName: string;
  location?: string;
}

export interface SavedCompany {
  id: number;
  companyName: string;
  description?: string;
  logoUrl?: string;
}

interface SavedContextType {
  savedJobs: SavedJobEntry[];
  savedCompanies: SavedCompanyEntry[];
  loadingSaved: boolean;
  isJobSaved: (jobId: number) => boolean;
  toggleSaveJob: (jobId: number) => Promise<void>;
  removeCompany: (companyId: number) => Promise<void>;
  saveCompany: (companyId: number) => Promise<void>;
  refreshSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType>({
  savedJobs: [],
  savedCompanies: [],
  loadingSaved: false,
  isJobSaved: () => false,
  toggleSaveJob: async () => {},
  removeCompany: async () => {},
  saveCompany: async () => {},
  refreshSaved: async () => {},
});

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJobEntry[]>([]);
  const [savedCompanies, setSavedCompanies] = useState<SavedCompanyEntry[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const refreshSaved = useCallback(async () => {
    if (!user || user.role !== "JOB_SEEKER") return;
    setLoadingSaved(true);
    try {
      const [jobs, companies] = await Promise.all([
        api.getSavedJobs(),
        api.getSavedCompanies(),
      ]);
      setSavedJobs(jobs);
      setSavedCompanies(companies);
    } catch (err) {
      console.error("Failed to load saved items:", err);
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const isJobSaved = useCallback(
    (jobId: number) => savedJobs.some((j) => j.job?.id === jobId),
    [savedJobs]
  );

  const toggleSaveJob = useCallback(
    async (jobId: number) => {
      if (isJobSaved(jobId)) {
        await api.unsaveJob(jobId);
        setSavedJobs((prev) => prev.filter((j) => j.job?.id !== jobId));
      } else {
        await api.saveJob(jobId);
        await refreshSaved();
      }
    },
    [isJobSaved, refreshSaved]
  );

  const removeCompany = useCallback(async (companyId: number) => {
    await api.unsaveCompany(companyId);
    setSavedCompanies((prev) => prev.filter((c) => c.company?.id !== companyId));
  }, []);

  const saveCompany = useCallback(async (companyId: number) => {
    await api.saveCompany(companyId);
    await refreshSaved();
  }, [refreshSaved]);

  return (
    <SavedContext.Provider
      value={{ savedJobs, savedCompanies, loadingSaved, isJobSaved, toggleSaveJob, removeCompany, saveCompany, refreshSaved }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
