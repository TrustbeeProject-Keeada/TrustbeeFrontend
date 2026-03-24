# TrustBee API Documentation

> **Base URL**: Set via `VITE_API_BASE_URL` env var (default: `http://localhost:3001/api`)
>
> **Auth**: All authenticated endpoints require `Authorization: Bearer <token>` header.
>
> **Toggle**: Set `USE_BACKEND = true` in `src/lib/api.ts` to switch from localStorage fallback to live backend.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profile](#2-profile)
3. [Jobs](#3-jobs)
4. [Applications](#4-applications)
5. [Saved Items](#5-saved-items)
6. [Messages](#6-messages)
7. [Dashboard](#7-dashboard)
8. [AI Assistant](#8-ai-assistant)
9. [File Upload](#9-file-upload)

---

## 1. Authentication

### POST `/auth/login`

Login with email and password.

**Request Body** (`LoginRequest`):
```typescript
{
  email: string;     // "user@example.com"
  password: string;  // "********"
}
```

**Response** (`LoginResponse`):
```typescript
{
  user: User;    // Full user object
  token: string; // JWT token
}
```

---

### POST `/auth/register`

Create a new account.

**Request Body** (`RegisterRequest`):
```typescript
{
  firstName: string;       // "Jane"
  lastName: string;        // "Müller"
  email: string;           // "jane@example.com"
  phone: string;           // "+46 70 123 4567"
  country: string;         // "Sweden"
  city: string;            // "Stockholm"
  role: "job_seeker" | "employer";
  password: string;        // "min8chars"
  companyName?: string;    // Only for employers
  orgNumber?: string;      // Only for employers
}
```

**Response** (`RegisterResponse`):
```typescript
{
  user: User;
  token: string;
}
```

---

### POST `/auth/logout`

Invalidate the current session. Requires auth.

**Request Body**: _None_

**Response**: `204 No Content`

---

### GET `/auth/me`

Get the currently authenticated user.

**Response**:
```typescript
{
  user: User;
}
```

---

### POST `/auth/reset-password`

Request a password reset email.

**Request Body** (`ResetPasswordRequest`):
```typescript
{
  email: string;
}
```

**Response**:
```typescript
{
  message: string; // "Reset link sent"
}
```

---

### POST `/auth/reset-password/confirm`

Set a new password using the reset token.

**Request Body** (`ResetPasswordConfirmRequest`):
```typescript
{
  token: string;
  newPassword: string;
}
```

**Response**:
```typescript
{
  message: string; // "Password updated"
}
```

---

## 2. Profile

### PATCH `/profile`

Update the authenticated user's profile. Requires auth.

**Request Body** (`UpdateProfileRequest`):
```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  city?: string;
  status?: string;        // "looking" | "working" | "open"
  experience?: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  companyName?: string;
  orgNumber?: string;
}
```

**Response** (`UpdateProfileResponse`):
```typescript
{
  user: User;
}
```

---

## 3. Jobs

### GET `/jobs`

List all jobs with optional filters.

**Query Parameters** (`GetJobsRequest`):
| Param      | Type   | Description                |
|------------|--------|----------------------------|
| search     | string | Search in title & company  |
| type       | string | "Full-time", "Part-time", etc. |
| country    | string | Filter by country          |
| education  | string | "Any", "BSc", "MSc", "MBA" |
| page       | number | Page number (default: 1)   |
| limit      | number | Items per page (default: 20) |

**Response** (`GetJobsResponse`):
```typescript
{
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}
```

---

### GET `/jobs/:id`

Get a single job by ID.

**Response**:
```typescript
{
  job: Job;
}
```

---

### POST `/jobs`

Create a new job listing. Requires auth (employer).

**Request Body** (`CreateJobRequest`):
```typescript
{
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;       // "Stockholm, Sweden"
  country: string;
  city: string;
  type: string;           // "Full-time" | "Part-time" | "Contract" | "Remote"
  education: string;      // "Any" | "BSc" | "MSc" | "MBA"
  salaryMin: string;
  salaryMax: string;
  employerId: string;
}
```

**Response** (`CreateJobResponse`):
```typescript
{
  job: Job; // Includes generated `id` and `posted` timestamp
}
```

---

### PATCH `/jobs/:id`

Update an existing job. Requires auth (owner).

**Request Body** (`UpdateJobRequest`):
```typescript
{
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
```

**Response** (`UpdateJobResponse`):
```typescript
{
  job: Job;
}
```

---

### DELETE `/jobs/:id`

Delete a job listing. Requires auth (owner).

**Response**: `204 No Content`

---

### GET `/jobs/employer/:employerId`

Get all jobs posted by a specific employer.

**Response**:
```typescript
{
  jobs: Job[];
}
```

---

## 4. Applications

### POST `/jobs/:id/apply`

Apply to a job. Requires auth (job seeker).

**Request Body** (`ApplyJobRequest`):
```typescript
{
  jobId: string;
  coverLetter?: string;
  cvFileUrl?: string;     // URL from file upload endpoint
}
```

**Response** (`ApplyJobResponse`):
```typescript
{
  applicationId: string;
  status: string;         // "submitted"
}
```

---

## 5. Saved Items

### GET `/saved`

Get all saved jobs, companies, and applications. Requires auth.

**Response** (`GetSavedItemsResponse`):
```typescript
{
  savedJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  }>;
  savedCompanies: Array<{
    id: string;
    name: string;
    industry: string;
    jobs: number;
  }>;
  appliedJobs: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    date: string;
  }>;
}
```

---

### POST `/saved/jobs`

Bookmark a job. Requires auth.

**Request Body** (`SaveJobRequest`):
```typescript
{ jobId: string; }
```

---

### DELETE `/saved/jobs/:id`

Remove a bookmarked job. Requires auth.

---

### POST `/saved/companies`

Save a company. Requires auth.

**Request Body** (`SaveCompanyRequest`):
```typescript
{ companyId: string; }
```

---

### DELETE `/saved/companies/:id`

Remove a saved company. Requires auth.

---

## 6. Messages

### GET `/conversations`

List all conversations. Requires auth.

**Response** (`GetConversationsResponse`):
```typescript
{
  conversations: Array<{
    id: string;
    name: string;
    lastMsg: string;
    time: string;
    unread: boolean;
  }>;
}
```

---

### GET `/conversations/:id/messages`

Get messages in a conversation. Requires auth.

**Response** (`GetMessagesResponse`):
```typescript
{
  messages: Array<{
    from: "me" | "them";
    text: string;
    time: string;
  }>;
}
```

---

### POST `/conversations/:id/messages`

Send a message. Requires auth.

**Request Body**:
```typescript
{ text: string; }
```

**Response** (`SendMessageResponse`):
```typescript
{
  message: {
    from: "me" | "them";
    text: string;
    time: string;
  };
}
```

---

## 7. Dashboard

### GET `/dashboard`

Get dashboard stats and recent activity. Requires auth.

**Response** (`GetDashboardResponse`):
```typescript
{
  stats: {
    profileViews: number;
    bookmarkedJobs: number;
    applicationsSent: number;
    savedCompanies: number;
  };
  recentActivity: Array<{
    text: string;
    time: string;
  }>;
}
```

---

## 8. AI Assistant

### POST `/ai/chat`

Send a message to the AI career assistant. Requires auth.

**Request Body** (`AIAssistantRequest`):
```typescript
{
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**Response** (`AIAssistantResponse`):
```typescript
{
  reply: string;
}
```

---

## 9. File Upload

### POST `/profile/upload`

Upload a file (CV, avatar, or document). Requires auth. Uses `multipart/form-data`.

**Request Body** (`UploadFileRequest`):
| Field | Type   | Description                       |
|-------|--------|-----------------------------------|
| file  | File   | The file binary                   |
| type  | string | `"cv"` \| `"avatar"` \| `"document"` |

**Response** (`UploadFileResponse`):
```typescript
{
  url: string;       // Public URL of the uploaded file
  fileName: string;  // Original file name
}
```

---

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  role: "job_seeker" | "employer";
  status?: string;
  experience?: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  companyName?: string;
  orgNumber?: string;
}
```

### Job
```typescript
interface Job {
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
```

---

## Error Responses

All errors return:
```typescript
{
  message: string; // Human-readable error message
}
```

| Status | Meaning               |
|--------|-----------------------|
| 400    | Bad request / validation error |
| 401    | Unauthorized (missing/invalid token) |
| 403    | Forbidden (wrong role) |
| 404    | Resource not found     |
| 409    | Conflict (e.g., email already registered) |
| 500    | Internal server error  |

---

## Integration Guide

1. Set `VITE_API_BASE_URL` in your `.env` file to point to your backend
2. Set `USE_BACKEND = true` in `src/lib/api.ts`
3. All `fetch()` calls go through the central `request()` helper in `src/lib/api.ts`
4. JWT token is stored in `localStorage` as `trustbee_token` and auto-attached to all requests
5. All request/response types are exported from `src/lib/api.ts` for use in your backend
