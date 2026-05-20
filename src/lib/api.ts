/**
 * TrustBee — API layer.
 * Auth is handled via httpOnly cookies (set by the backend on login).
 * Minimal session info (id, role) is kept in localStorage only to know
 * which profile endpoint to call on page load — never the raw token.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type UserRole = "JOB_SEEKER" | "COMPANY_RECRUITER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  // Job seeker fields
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  bio?: string;
  cv?: string;
  personalStatement?: string;
  profilePicture?: string;
  portfolioLink?: string;
  languages?: string[];
  skills?: string[];
  // Company recruiter fields
  companyName?: string;
  organizationNumber?: string;
  description?: string;
  logoUrl?: string;
  industry?: string;
}

export interface JobCompany {
  id: number;
  companyName: string;
  email?: string;
  description?: string;
  country?: string;
  logoUrl?: string;
}

export interface Job {
  id: number | string;
  title: string;
  description: string | { text?: string; text_formatted?: string };
  webpage_url?: string;
  country?: string;
  city?: string;
  category?: string;
  status?: string;
  expiresAt?: string;
  company: JobCompany;
  employmentType?: string;
  salaryType?: string;
  source?: "trustbee" | "job_bank";
}

export interface JobsResponse {
  jobs: Job[];
  meta: {
    totalJobs: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface JobBankHit {
  id: string;
  title: string;
  company: string;
  url: string;
  applicationDeadline?: string;
  location?: string;
  employmentType?: string;
  salaryType?: string;
  occupation?: string;
  removed?: boolean;
}

export interface Application {
  id: number;
  jobSeekerId: number;
  jobId: number;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  updatedAt?: string;
  jobSeeker?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface SavedJobEntry {
  id: number;
  savedAt: string;
  job: Job;
}

export interface SavedCompanyEntry {
  id: number;
  savedAt: string;
  company: JobCompany;
}

export interface RegisterJobSeekerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cv?: string;
  personalStatement?: string;
}

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  companyName: string;
  organizationNumber: string;
  phoneNumber: string;
  description?: string;
  logoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type UpdateProfileRequest = Record<string, unknown>;

// ━━━ Global 401 handler ━━━━━━━━━━━━━━━━━━━━━━━━
// AuthContext registers this so any expired-session response clears the user
// immediately — ProtectedRoute then redirects to /login automatically.
let _onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}

// ━━━ Session hint stored in localStorage (id + role only, never the token) ━━━
const SESSION_KEY = "trustbee_session";

interface SessionHint {
  id: number;
  role: UserRole;
}

// ━━━ Error class ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ━━━ Core fetch wrapper ━━━━━━━━━━━━━━━━━━━━━━━━━
async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include", // send httpOnly cookie on every request
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && _onUnauthorized) {
      _onUnauthorized();
    }
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body.message || body.status || body.error || msg;
    } catch {
      // Unable to parse response body, use default message
    }
    throw new ApiError(msg, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ━━━ API methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const api = {
  // ── Auth ──────────────────────────────────────
  async loginJobSeeker(email: string, password: string): Promise<User> {
    const data = await apiCall<{ status: string; jobseeker: User }>(
      "/auth/loginjobseeker",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    const user = data.jobseeker;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: user.id, role: user.role } satisfies SessionHint),
    );
    return user;
  },

  async loginCompanyRecruiter(email: string, password: string): Promise<User> {
    const data = await apiCall<{ status: string; companyRecruiter: User }>(
      "/auth/logincompanyrecruiter",
      { method: "POST", body: JSON.stringify({ email, password }) },
    );
    const user = data.companyRecruiter;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: user.id, role: user.role } satisfies SessionHint),
    );
    return user;
  },

  async registerJobSeeker(body: RegisterJobSeekerRequest): Promise<User> {
    const data = await apiCall<{ status: string; jobseeker: User }>(
      "/auth/registerjobseeker",
      { method: "POST", body: JSON.stringify(body) },
    );
    return data.jobseeker;
  },

  async registerCompanyRecruiter(body: RegisterCompanyRequest): Promise<User> {
    const data = await apiCall<{ status: string; companyRecruiter: User }>(
      "/auth/registercompanyrecruiter",
      { method: "POST", body: JSON.stringify(body) },
    );
    return data.companyRecruiter;
  },

  async logout(): Promise<void> {
    try {
      await apiCall("/auth/logout", { method: "POST" });
    } finally {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: {
    token: string;
    email: string;
    role: string;
    newPassword: string;
  }): Promise<void> {
    await apiCall("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getSessionHint(): SessionHint | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ── Job Seekers ───────────────────────────────
  async getJobSeeker(id: number): Promise<User> {
    return apiCall<User>(`/jobseekers/${id}`);
  },

  async getJobSeekerDashboard(
    id: number,
  ): Promise<{ status: string; data: Record<string, unknown> }> {
    return apiCall(`/jobseekers/${id}/dashboard`);
  },

  async updateJobSeeker(
    id: number,
    data: Record<string, unknown>,
  ): Promise<User> {
    const res = await apiCall<{ status: string; jobseeker: User }>(
      `/jobseekers/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
    );
    return res.jobseeker;
  },

  async deleteJobSeeker(id: number): Promise<void> {
    await apiCall(`/jobseekers/${id}`, { method: "DELETE" });
  },

  // ── Company Recruiters ────────────────────────
  async getCompanyRecruiter(
    id: number,
  ): Promise<{ status: string; data: User }> {
    return apiCall(`/companyrecruiter/${id}`);
  },

  async updateCompanyRecruiter(
    id: number,
    data: Record<string, unknown>,
  ): Promise<User> {
    const res = await apiCall<{ status: string; data: User }>(
      `/companyrecruiter/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
    );
    return res.data;
  },

  async deleteCompanyRecruiter(id: number): Promise<void> {
    await apiCall(`/companyrecruiter/${id}`, { method: "DELETE" });
  },

  // ── Jobs ─────────────────────────────────────
  async getJobs(params?: {
    search?: string;
    status?: string;
    companyId?: number;
    city?: string;
    country?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<JobsResponse> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== "all") query.set(k, String(v));
      });
    }
    const qs = query.toString();

    // When filtering by company, only fetch from the TrustBee DB.
    if (params?.companyId) {
      const res = await apiCall<JobsResponse>(`/jobs${qs ? `?${qs}` : ""}`);
      return {
        jobs: res.jobs.map((job) => ({ ...job, source: "trustbee" as const })),
        meta: res.meta,
      };
    }

    // For public browsing, merge TrustBee DB jobs with external job bank jobs.
    const [trustbeeRes, jobBankRes] = await Promise.all([
      apiCall<JobsResponse>(`/jobs${qs ? `?${qs}` : ""}`),
      apiCall<{
        jobs: Job[];
        meta: { totalJobs: number; currentPage: number; totalPages: number };
      }>(`/jobs/job_bank${qs ? `?${qs}` : ""}`).catch(() => ({
        jobs: [],
        meta: { totalJobs: 0, currentPage: 1, totalPages: 1 },
      })),
    ]);

    const trustbeeJobs = trustbeeRes.jobs.map((job) => ({
      ...job,
      source: "trustbee" as const,
    }));
    const bankJobs = jobBankRes.jobs.map((job) => ({
      ...job,
      source: "job_bank" as const,
    }));

    return {
      jobs: [...trustbeeJobs, ...bankJobs],
      meta: {
        totalJobs: trustbeeRes.meta.totalJobs + jobBankRes.meta.totalJobs,
        currentPage: trustbeeRes.meta.currentPage,
        totalPages: trustbeeRes.meta.totalPages,
      },
    };
  },

  async getJob(
    id: number | string,
    source?: "trustbee" | "job_bank",
  ): Promise<Job> {
    const isNumericId = !isNaN(Number(id)) && String(id).trim() !== "";
    const endpoint =
      source === "job_bank" || (!isNumericId && source !== "trustbee")
        ? `/jobs/job_bank/${id}`
        : `/jobs/${id}`;

    const response = await apiCall<Job | { data: Job } | { job: Job }>(
      endpoint,
    );

    if ("data" in response) return (response as { data: Job }).data;
    if ("job" in response) return (response as { job: Job }).job;
    return response as Job;
  },

  async createJob(data: {
    title: string;
    description: string;
    expiresAt: string;
    webpage_url?: string;
    city?: string;
    country?: string;
    category?: string;
  }): Promise<Job> {
    return apiCall<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateJob(id: number, data: Record<string, unknown>): Promise<Job> {
    const res = await apiCall<{ status: string; data: Job }>(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteJob(id: number): Promise<void> {
    await apiCall(`/jobs/${id}`, { method: "DELETE" });
  },

  async updateJobStatus(
    id: number,
    status: "ACTIVE" | "ARCHIVED",
  ): Promise<Job> {
    const res = await apiCall<{ status: string; data: Job }>(
      `/jobs/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
    return res.data;
  },

  // ── Applications ─────────────────────────────
  async applyToJob(jobId: number | string): Promise<Application> {
    const res = await apiCall<{ status: string; data: Application }>(
      `/applications/job/${jobId}`,
      { method: "POST" },
    );
    return res.data;
  },

  async getJobApplications(jobId: number): Promise<Application[]> {
    const res = await apiCall<{ status: string; data: Application[] }>(
      `/applications/job/${jobId}`,
    );
    return res.data;
  },

  async updateApplicationStatus(
    applicationId: number,
    status: string,
  ): Promise<Application> {
    const res = await apiCall<{ status: string; data: Application }>(
      `/applications/${applicationId}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
    return res.data;
  },

  // ── Saved ────────────────────────────────────
  async getSavedJobs(): Promise<SavedJobEntry[]> {
    const res = await apiCall<{ status: string; data: SavedJobEntry[] }>(
      "/saved/jobs",
    );
    return res.data;
  },

  async saveJob(jobId: number | string): Promise<void> {
    await apiCall(`/saved/jobs/${jobId}`, { method: "POST" });
  },

  async unsaveJob(jobId: number | string): Promise<void> {
    await apiCall(`/saved/jobs/${jobId}`, { method: "DELETE" });
  },

  async getSavedCompanies(): Promise<SavedCompanyEntry[]> {
    const res = await apiCall<{ status: string; data: SavedCompanyEntry[] }>(
      "/saved/companies",
    );
    return res.data;
  },

  async saveCompany(companyId: number): Promise<void> {
    await apiCall(`/saved/companies/${companyId}`, { method: "POST" });
  },

  async unsaveCompany(companyId: number): Promise<void> {
    await apiCall(`/saved/companies/${companyId}`, { method: "DELETE" });
  },

  // ── Support ──────────────────────────────────
  async submitSupport(data: {
    firstname: string;
    lastname: string;
    email: string;
    message: string;
    sendAsEmail?: boolean;
  }): Promise<{ status: string; ticket?: Record<string, unknown> }> {
    return apiCall("/support", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── AI / Matchmaking ─────────────────────────
  async matchmake(
    jobAddId: number | string,
    jobseekerId: number,
  ): Promise<unknown> {
    const res = await apiCall<{ status: string; data: unknown }>("/matchmake", {
      method: "POST",
      body: JSON.stringify({ jobAddId: Number(jobAddId), jobseekerId }),
    });
    return res.data;
  },

  async aiHealthCheck(): Promise<{
    status: string;
    timestamp: string;
    ai: unknown;
  }> {
    return apiCall("/api_health");
  },

  async generateCvPdf(
    jobseekerId: number,
    body: Record<string, unknown>,
  ): Promise<{ pdfBase64: string; pdfSizeBytes: number; generatedAt: string }> {
    const res = await apiCall<{
      status: string;
      data: { pdfBase64: string; pdfSizeBytes: number; generatedAt: string };
    }>(`/generate-cv-pdf/${jobseekerId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.data;
  },
};
