/**
 * TrustBee API Service
 *
 * Central API client for all backend communication.
 * Replace BASE_URL with your actual backend URL.
 *
 * All methods use fetch() and return typed responses.
 * localStorage is used ONLY as a fallback until the backend is connected.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Set to true once your backend is running
const USE_BACKEND = false;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type UserRole = "job_seeker" | "employer";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  role: UserRole;
  status?: string;
  experience?: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  companyName?: string;
  orgNumber?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  country: string;
  city: string;
  type: string;
  education: string;
  salaryMin: string;
  salaryMax: string;
  posted: string;
  employerId: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: boolean;
}

export interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface DashboardStats {
  profileViews: number;
  bookmarkedJobs: number;
  applicationsSent: number;
  savedCompanies: number;
}

export interface ActivityItem {
  text: string;
  time: string;
}

export interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
}

export interface SavedCompany {
  id: string;
  name: string;
  industry: string;
  jobs: number;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  status: string;
  date: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Request Interfaces
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

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

export interface RegisterResponse {
  user: User;
  token: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  status?: string;
  experience?: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  companyName?: string;
  orgNumber?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  country: string;
  city: string;
  type: string;
  education: string;
  salaryMin: string;
  salaryMax: string;
  employerId: string;
}

export interface CreateJobResponse {
  job: Job;
}

export interface UpdateJobRequest {
  title?: string;
  company?: string;
  description?: string;
  requirements?: string;
  location?: string;
  country?: string;
  city?: string;
  type?: string;
  education?: string;
  salaryMin?: string;
  salaryMax?: string;
}

export interface UpdateJobResponse {
  job: Job;
}

export interface GetJobsRequest {
  search?: string;
  type?: string;
  country?: string;
  education?: string;
  page?: number;
  limit?: number;
}

export interface GetJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export interface SendMessageResponse {
  message: Message;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface GetDashboardResponse {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

export interface SaveJobRequest {
  jobId: string;
}

export interface SaveCompanyRequest {
  companyId: string;
}

export interface ApplyJobRequest {
  jobId: string;
  coverLetter?: string;
  cvFileUrl?: string;
}

export interface ApplyJobResponse {
  applicationId: string;
  status: string;
}

export interface UploadFileRequest {
  file: File;
  type: "cv" | "avatar" | "document";
}

export interface UploadFileResponse {
  url: string;
  fileName: string;
}

export interface AIAssistantRequest {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIAssistantResponse {
  reply: string;
}

export interface GetSavedItemsResponse {
  savedJobs: SavedJob[];
  savedCompanies: SavedCompany[];
  appliedJobs: AppliedJob[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP Helper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getAuthToken(): string | null {
  return localStorage.getItem("trustbee_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("trustbee_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("trustbee_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Remove Content-Type for FormData (file upload)
  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const api = {
  // ─── Auth ───────────────────────────────────────

  /** POST /auth/login */
  login: (data: LoginRequest): Promise<LoginResponse> =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  /** POST /auth/register */
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  /** POST /auth/logout */
  logout: (): Promise<void> =>
    request("/auth/logout", { method: "POST" }),

  /** GET /auth/me — get current user from token */
  getMe: (): Promise<{ user: User }> =>
    request("/auth/me"),

  /** POST /auth/reset-password */
  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> =>
    request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),

  /** POST /auth/reset-password/confirm */
  resetPasswordConfirm: (data: ResetPasswordConfirmRequest): Promise<{ message: string }> =>
    request("/auth/reset-password/confirm", { method: "POST", body: JSON.stringify(data) }),

  // ─── Profile ───────────────────────────────────

  /** PATCH /profile */
  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> =>
    request("/profile", { method: "PATCH", body: JSON.stringify(data) }),

  /** POST /profile/upload — upload CV or avatar */
  uploadFile: (data: UploadFileRequest): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("type", data.type);
    return request("/profile/upload", { method: "POST", body: formData });
  },

  // ─── Jobs ──────────────────────────────────────

  /** GET /jobs */
  getJobs: (params?: GetJobsRequest): Promise<GetJobsResponse> => {
    const query = params
      ? "?" + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    return request(`/jobs${query}`);
  },

  /** GET /jobs/:id */
  getJob: (id: string): Promise<{ job: Job }> =>
    request(`/jobs/${id}`),

  /** POST /jobs */
  createJob: (data: CreateJobRequest): Promise<CreateJobResponse> =>
    request("/jobs", { method: "POST", body: JSON.stringify(data) }),

  /** PATCH /jobs/:id */
  updateJob: (id: string, data: UpdateJobRequest): Promise<UpdateJobResponse> =>
    request(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  /** DELETE /jobs/:id */
  deleteJob: (id: string): Promise<void> =>
    request(`/jobs/${id}`, { method: "DELETE" }),

  /** GET /jobs/employer/:employerId */
  getEmployerJobs: (employerId: string): Promise<{ jobs: Job[] }> =>
    request(`/jobs/employer/${employerId}`),

  // ─── Applications ──────────────────────────────

  /** POST /jobs/:id/apply */
  applyToJob: (id: string, data: ApplyJobRequest): Promise<ApplyJobResponse> =>
    request(`/jobs/${id}/apply`, { method: "POST", body: JSON.stringify(data) }),

  // ─── Saved Items ───────────────────────────────

  /** GET /saved */
  getSavedItems: (): Promise<GetSavedItemsResponse> =>
    request("/saved"),

  /** POST /saved/jobs */
  saveJob: (data: SaveJobRequest): Promise<void> =>
    request("/saved/jobs", { method: "POST", body: JSON.stringify(data) }),

  /** DELETE /saved/jobs/:id */
  unsaveJob: (id: string): Promise<void> =>
    request(`/saved/jobs/${id}`, { method: "DELETE" }),

  /** POST /saved/companies */
  saveCompany: (data: SaveCompanyRequest): Promise<void> =>
    request("/saved/companies", { method: "POST", body: JSON.stringify(data) }),

  /** DELETE /saved/companies/:id */
  unsaveCompany: (id: string): Promise<void> =>
    request(`/saved/companies/${id}`, { method: "DELETE" }),

  // ─── Messages ──────────────────────────────────

  /** GET /conversations */
  getConversations: (): Promise<GetConversationsResponse> =>
    request("/conversations"),

  /** GET /conversations/:id/messages */
  getMessages: (conversationId: string): Promise<GetMessagesResponse> =>
    request(`/conversations/${conversationId}/messages`),

  /** POST /conversations/:id/messages */
  sendMessage: (conversationId: string, data: { text: string }): Promise<SendMessageResponse> =>
    request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ─── Dashboard ─────────────────────────────────

  /** GET /dashboard */
  getDashboard: (): Promise<GetDashboardResponse> =>
    request("/dashboard"),

  // ─── AI Assistant ──────────────────────────────

  /** POST /ai/chat */
  aiChat: (data: AIAssistantRequest): Promise<AIAssistantResponse> =>
    request("/ai/chat", { method: "POST", body: JSON.stringify(data) }),
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fallback helpers (localStorage, used when USE_BACKEND = false)
// These exactly mirror the old logic. Remove once your backend is live.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const USERS_KEY = "trustbee_users";
const USER_KEY = "trustbee_user";
const JOBS_KEY = "trustbee_jobs";

const defaultJobs: Job[] = [
  { id: "1", title: "Senior Frontend Developer", company: "Spotify", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "65000", salaryMax: "85000", posted: "2d ago", education: "BSc", description: "Build amazing web experiences with React and TypeScript.", requirements: "5+ years React\nTypeScript proficiency\nDesign system experience", employerId: "" },
  { id: "2", title: "UX Designer", company: "Klarna", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "50000", salaryMax: "70000", posted: "3d ago", education: "Any", description: "Design intuitive user experiences for fintech products.", requirements: "Figma expertise\nUser research skills", employerId: "" },
  { id: "3", title: "Backend Engineer", company: "Volvo", location: "Gothenburg, Sweden", country: "Sweden", city: "Gothenburg", type: "Full-time", salaryMin: "60000", salaryMax: "80000", posted: "1w ago", education: "MSc", description: "Build scalable backend systems for autonomous vehicles.", requirements: "Java/Go experience\nDistributed systems", employerId: "" },
  { id: "4", title: "Product Manager", company: "H&M Group", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "70000", salaryMax: "90000", posted: "4d ago", education: "MBA", description: "Lead product strategy for e-commerce platform.", requirements: "3+ years PM experience\nRetail knowledge", employerId: "" },
  { id: "5", title: "Data Analyst", company: "Ericsson", location: "Lund, Sweden", country: "Sweden", city: "Lund", type: "Contract", salaryMin: "45000", salaryMax: "60000", posted: "5d ago", education: "BSc", description: "Analyze network performance data and build dashboards.", requirements: "SQL & Python\nBI tools", employerId: "" },
  { id: "6", title: "DevOps Engineer", company: "King", location: "Malmö, Sweden", country: "Sweden", city: "Malmö", type: "Full-time", salaryMin: "55000", salaryMax: "75000", posted: "1d ago", education: "Any", description: "Manage CI/CD pipelines and cloud infrastructure.", requirements: "AWS/GCP\nKubernetes\nTerraform", employerId: "" },
];

export const fallback = {
  login(email: string, _password: string): User {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const found = users.find((u) => u.email === email);
    if (!found) throw new Error("Invalid email or password");
    localStorage.setItem(USER_KEY, JSON.stringify(found));
    return found;
  },

  register(data: RegisterRequest): User {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    if (users.find((u) => u.email === data.email)) throw new Error("Email already registered");
    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      country: data.country,
      city: data.city,
      role: data.role,
      companyName: data.companyName,
      orgNumber: data.orgNumber,
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  logout() {
    localStorage.removeItem(USER_KEY);
  },

  updateProfile(user: User, data: Partial<User>): User {
    const updated = { ...user, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updated;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return updated;
  },

  loadJobs(): Job[] {
    const stored = localStorage.getItem(JOBS_KEY);
    return stored ? JSON.parse(stored) : defaultJobs;
  },

  saveJobs(jobs: Job[]) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },
};

// Export the toggle for contexts to check
export { USE_BACKEND };
