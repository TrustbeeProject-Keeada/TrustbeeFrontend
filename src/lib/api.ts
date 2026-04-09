/**
 * TrustBee — API layer connected to real backend.
 * All methods are async and return parsed responses.
 * localStorage is used only for token + user cache.
 */

// ━━━ API Base URL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type UserRole = "JOB_SEEKER" | "COMPANY_RECRUITER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  token: string;
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
  organizationNumber?: number;
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
  source?: "trustbee" | "job_bank"; // Track which API the job came from
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

export interface Message {
  id: number;
  content: string;
  senderJobSeekerId?: number;
  senderRecruiterId?: number;
  receiverJobSeekerId?: number;
  receiverRecruiterId?: number;
  createdAt: string;
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

// Legacy compat types
export interface RegisterJobSeekerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cv?: string;
  personalStatement?: string;
}

export interface RegisterCompanyRequest {
  email: string;
  password: string;
  companyName: string;
  organizationNumber: number;
  phoneNumber: string;
  description?: string;
  logoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Keep for backward compat with AuthContext
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: UserRole;
  password: string;
  companyName?: string;
  orgNumber?: string;
}

export type UpdateProfileRequest = Record<string, unknown>;

// ━━━ Storage keys ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TOKEN_KEY = "trustbee_token";
const USER_KEY = "trustbee_user";

// ━━━ API helper ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body.message || body.status || body.error || msg;
    } catch {}
    throw new ApiError(msg, res.status);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ━━━ API methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const api = {
  // ── Auth ──────────────────────────────────────
  async loginJobSeeker(email: string, password: string): Promise<User> {
    const data = await apiCall<{ status: string; jobseeker: User }>(
      "/auth/loginjobseeker",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    const user = data.jobseeker;
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async loginCompanyRecruiter(email: string, password: string): Promise<User> {
    const data = await apiCall<{ status: string; companyRecruiter: User }>(
      "/auth/logincompanyrecruiter",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    const user = data.companyRecruiter;
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async registerJobSeeker(body: RegisterJobSeekerRequest): Promise<User> {
    const data = await apiCall<{ status: string; jobseeker: User }>(
      "/auth/registerjobseeker",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return data.jobseeker;
  },

  async registerCompanyRecruiter(body: RegisterCompanyRequest): Promise<User> {
    const data = await apiCall<{ status: string; companyRecruiter: User }>(
      "/auth/registercompanyrecruiter",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return data.companyRecruiter;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
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
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    const updated = res.jobseeker;
    // Update cached user
    const stored = this.getStoredUser();
    if (stored && stored.id === id) {
      const merged = { ...stored, ...updated };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
    }
    return updated;
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
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    const updated = res.data;
    const stored = this.getStoredUser();
    if (stored && stored.id === id) {
      const merged = { ...stored, ...updated };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
    }
    return updated;
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

    // Fetch from both TrustBee jobs and job bank
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

    // Extract totalJobs value (handle both number and { value: number } formats)
    const trustbeeTotalJobs =
      typeof trustbeeRes.meta.totalJobs === "object"
        ? (trustbeeRes.meta.totalJobs as Record<string, number>).value
        : (trustbeeRes.meta.totalJobs as number);

    // Tag jobs with their source
    const trustbeeJobs = trustbeeRes.jobs.map((job) => ({
      ...job,
      source: "trustbee" as const,
    }));
    const bankJobs = jobBankRes.jobs.map((job) => ({
      ...job,
      source: "job_bank" as const,
    }));

    // Combine jobs from both sources
    const allJobs = [...trustbeeJobs, ...bankJobs];

    return {
      jobs: allJobs,
      meta: {
        totalJobs: trustbeeTotalJobs + jobBankRes.meta.totalJobs,
        currentPage: trustbeeRes.meta.currentPage,
        totalPages: trustbeeRes.meta.totalPages,
      },
    };
  },

  async getJob(
    id: number | string,
    source?: "trustbee" | "job_bank",
  ): Promise<Job> {
    // Use explicit source if provided, otherwise detect based on ID type
    const endpoint =
      source === "job_bank" || (typeof id === "string" && source !== "trustbee")
        ? `/jobs/job_bank/${id}`
        : `/jobs/${id}`;

    const response = await apiCall<Job | { data: Job } | { job: Job }>(
      endpoint,
    );

    // Handle different response formats
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
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    return res.data;
  },

  async getJobBank(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    total: number;
    hits: JobBankHit[];
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return apiCall(`/jobs/job_bank${qs ? `?${qs}` : ""}`);
  },

  // ── Applications ─────────────────────────────
  async applyToJob(jobId: number | string): Promise<Application> {
    const res = await apiCall<{ status: string; data: Application }>(
      `/applications/job/${jobId}`,
      {
        method: "POST",
      },
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
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    return res.data;
  },

  // ── Messages ─────────────────────────────────
  async sendMessage(
    content: string,
    receiverId: number,
    receiverRole: "JOB_SEEKER" | "COMPANY_RECRUITER",
  ): Promise<Message> {
    const res = await apiCall<{ status: string; data: Message }>("/messages", {
      method: "POST",
      body: JSON.stringify({ content, receiverId, receiverRole }),
    });
    return res.data;
  },

  async getReceivedMessages(): Promise<Message[]> {
    const res = await apiCall<{
      status: string;
      results: number;
      data: { messages: Message[] };
    }>("/messages/received");
    return res.data.messages;
  },

  async getConversation(otherId: number, role: string): Promise<Message[]> {
    const res = await apiCall<{
      status: string;
      results: number;
      data: { messages: Message[] };
    }>(`/messages/${otherId}?role=${role}`);
    return res.data.messages;
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
  async matchmake(jobAddId: number, jobseekerId: number): Promise<unknown[]> {
    const res = await apiCall<{ status: string; data: unknown[] }>(
      "/matchmake",
      {
        method: "POST",
        body: JSON.stringify({ jobAddId, jobseekerId }),
      },
    );
    return res.data;
  },

  async aiHealthCheck(): Promise<{
    status: string;
    timestamp: string;
    ai: unknown;
  }> {
    return apiCall("/api_health");
  },
};

// ━━━ Backward compat — keep `db` export for CvBuilder ━━━
export const db = {
  uploadGeneratedCv(
    userId: number,
    base64Pdf: string,
    _fileName: string,
  ): void {
    // For CV, we update the jobseeker's cv field
    api.updateJobSeeker(userId, { cv: base64Pdf }).catch(() => {});
  },
};
