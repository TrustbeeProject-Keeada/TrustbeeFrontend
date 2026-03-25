/**
 * TrustBee — Pure localStorage data layer (no backend needed).
 * Deploy anywhere: Vercel, Netlify, GitHub Pages, etc.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  cvText?: string; // extracted CV text for matchmaking
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

export type UpdateProfileRequest = Partial<Omit<User, "id" | "email">>;

// ━━━ Storage keys ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const USERS_KEY = "trustbee_users";
const USER_KEY = "trustbee_user";
const JOBS_KEY = "trustbee_jobs";

// ━━━ Default seed data ━━━━━━━━━━━━━━━━━━━━━━━━━━

const defaultJobs: Job[] = [
  { id: "1", title: "Senior Frontend Developer", company: "Spotify", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "65000", salaryMax: "85000", posted: "2d ago", education: "BSc", description: "Build amazing web experiences with React and TypeScript. You'll work on the Spotify Web Player, collaborating with designers and backend engineers.", requirements: "5+ years React\nTypeScript proficiency\nDesign system experience\nCSS/Tailwind\nGit & CI/CD", employerId: "" },
  { id: "2", title: "UX Designer", company: "Klarna", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "50000", salaryMax: "70000", posted: "3d ago", education: "Any", description: "Design intuitive user experiences for fintech products used by millions worldwide.", requirements: "Figma expertise\nUser research skills\nPrototyping\nDesign thinking\nCollaboration", employerId: "" },
  { id: "3", title: "Backend Engineer", company: "Volvo", location: "Gothenburg, Sweden", country: "Sweden", city: "Gothenburg", type: "Full-time", salaryMin: "60000", salaryMax: "80000", posted: "1w ago", education: "MSc", description: "Build scalable backend systems for autonomous vehicles. Work with microservices and event-driven architecture.", requirements: "Java or Go experience\nDistributed systems\nKubernetes\nPostgreSQL\nREST & gRPC APIs", employerId: "" },
  { id: "4", title: "Product Manager", company: "H&M Group", location: "Stockholm, Sweden", country: "Sweden", city: "Stockholm", type: "Full-time", salaryMin: "70000", salaryMax: "90000", posted: "4d ago", education: "MBA", description: "Lead product strategy for the e-commerce platform serving millions of customers.", requirements: "3+ years PM experience\nRetail knowledge\nAgile methodology\nData-driven decision making\nStakeholder management", employerId: "" },
  { id: "5", title: "Data Analyst", company: "Ericsson", location: "Lund, Sweden", country: "Sweden", city: "Lund", type: "Contract", salaryMin: "45000", salaryMax: "60000", posted: "5d ago", education: "BSc", description: "Analyze network performance data and build dashboards for telecom infrastructure.", requirements: "SQL & Python\nBI tools (Tableau/Power BI)\nStatistical analysis\nData visualization\nCommunication skills", employerId: "" },
  { id: "6", title: "DevOps Engineer", company: "King", location: "Malmö, Sweden", country: "Sweden", city: "Malmö", type: "Full-time", salaryMin: "55000", salaryMax: "75000", posted: "1d ago", education: "Any", description: "Manage CI/CD pipelines and cloud infrastructure for mobile gaming at scale.", requirements: "AWS or GCP\nKubernetes\nTerraform\nDocker\nLinux administration\nMonitoring (Prometheus/Grafana)", employerId: "" },
];

// ━━━ Data helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const db = {
  // Auth
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

  updateProfile(user: User, data: UpdateProfileRequest): User {
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

  // Jobs
  loadJobs(): Job[] {
    const stored = localStorage.getItem(JOBS_KEY);
    return stored ? JSON.parse(stored) : defaultJobs;
  },

  saveJobs(jobs: Job[]) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },
};
