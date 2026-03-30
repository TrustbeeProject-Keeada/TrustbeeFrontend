# TrustBee — Backend Integration Guide

> This guide explains how to replace the demo/localStorage layer with a real backend API.

---

## Current Architecture

All data operations go through `src/lib/api.ts`, which:

1. **Persists data locally** via `localStorage` (immediate, offline-capable)
2. **Fires fetch requests** to a demo URL (`https://demo-api.trustbee.example/v1`) — currently fire-and-forget

The `db` object is the single entry point used by `AuthContext` and `JobContext`.

---

## Step-by-Step: Connect a Real Backend

### 1. Set the API Base URL

In `src/lib/api.ts`, change the `API_BASE` constant:

```ts
// Replace this:
const API_BASE = "https://demo-api.trustbee.example/v1";

// With your real backend:
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
```

Then create a `.env` file:

```env
VITE_API_BASE_URL=https://your-backend.com/api
```

---

### 2. Switch from Fire-and-Forget to Awaited Requests

Currently `apiCall()` is fire-and-forget. To use real responses:

1. Make `apiCall()` return `Promise<Response>`
2. Update each `db` method to `await` the response and use server data instead of localStorage

**Example — `db.login()` before:**
```ts
login(email, password) {
  apiCall("/auth/login", { method: "POST", body: ... }); // fire-and-forget
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const found = users.find(u => u.email === email);
  ...
}
```

**After:**
```ts
async login(email: string, password: string): Promise<User> {
  const res = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const { user, token } = await res.json();
  localStorage.setItem("trustbee_token", token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
```

---

### 3. API Endpoints to Implement

Your backend must implement these endpoints (see `API_DOCUMENTATION.md` for full schemas):

| Category       | Method   | Endpoint                        | Purpose                    |
|----------------|----------|---------------------------------|----------------------------|
| **Auth**       | POST     | `/auth/login`                   | Login, returns JWT + User  |
|                | POST     | `/auth/register`                | Create account             |
|                | POST     | `/auth/logout`                  | Invalidate session         |
|                | GET      | `/auth/me`                      | Get current user           |
|                | POST     | `/auth/reset-password`          | Request password reset     |
|                | POST     | `/auth/reset-password/confirm`  | Confirm reset with token   |
| **Profile**    | PATCH    | `/profile`                      | Update user profile        |
|                | POST     | `/profile/cv`                   | Upload CV text             |
|                | POST     | `/profile/upload`               | Upload file (multipart)    |
| **Jobs**       | GET      | `/jobs`                         | List jobs (with filters)   |
|                | GET      | `/jobs/:id`                     | Get single job             |
|                | POST     | `/jobs`                         | Create job (employer)      |
|                | PATCH    | `/jobs/:id`                     | Update job (owner)         |
|                | DELETE   | `/jobs/:id`                     | Delete job (owner)         |
|                | GET      | `/jobs/employer/:employerId`    | Jobs by employer           |
| **Applications** | POST   | `/jobs/:id/apply`               | Apply to a job             |
| **Saved**      | GET      | `/saved`                        | Get saved items            |
|                | POST     | `/saved/jobs`                   | Bookmark a job             |
|                | DELETE   | `/saved/jobs/:id`               | Remove bookmark            |
| **Messages**   | GET      | `/conversations`                | List conversations         |
|                | GET      | `/conversations/:id/messages`   | Get messages               |
|                | POST     | `/conversations/:id/messages`   | Send message               |
| **Dashboard**  | GET      | `/dashboard`                    | Stats & recent activity    |
| **AI**         | POST     | `/ai/chat`                      | AI assistant chat          |

---

### 4. Authentication Flow

- JWT token is stored in `localStorage` as `trustbee_token`
- The `apiCall()` helper auto-attaches it as `Authorization: Bearer <token>`
- Your backend should validate this token on every authenticated endpoint

---

### 5. Files to Modify

| File | What to Change |
|------|----------------|
| `src/lib/api.ts` | Make `db` methods async, use real API responses |
| `src/contexts/AuthContext.tsx` | Add async/await to `login`, `register`, `updateProfile` |
| `src/contexts/JobContext.tsx` | Add async/await to `createJob`, `updateJob`, `deleteJob` |
| `src/pages/*.tsx` | Handle loading/error states for async operations |

---

### 6. Recommended Backend Stack

| Option | Best For |
|--------|----------|
| **Lovable Cloud** | Zero-config, built-in auth + DB + storage + edge functions |
| **Supabase (self-managed)** | Full Postgres + Auth + Storage + Realtime |
| **Express + PostgreSQL** | Custom Node.js API with full control |
| **FastAPI + PostgreSQL** | Python backend with auto-generated docs |
| **Firebase** | Quick setup with Firestore + Auth |

---

### 7. Quick Checklist

- [ ] Set `VITE_API_BASE_URL` to your backend URL
- [ ] Make `apiCall()` return responses (not fire-and-forget)
- [ ] Update `db` methods to be async and use server data
- [ ] Update contexts to handle async operations
- [ ] Add loading and error states to pages
- [ ] Implement all endpoints from the table above
- [ ] Set up JWT token validation on your backend
- [ ] Test auth flow: register → login → profile update → logout
- [ ] Test job flow: create → list → detail → edit → delete
- [ ] Test CV upload and job matching

---

## Reference

- **Full API schemas**: See `API_DOCUMENTATION.md`
- **Current data layer**: See `src/lib/api.ts`
- **Type definitions**: All TypeScript interfaces are exported from `src/lib/api.ts`
