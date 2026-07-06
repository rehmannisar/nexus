# Nexus Backend – Investor & Entrepreneur Collaboration Platform

This is my backend submission for the Nexus internship task. As per the updated instructions, I'm only submitting **Week 1 and Week 2** work (Setup, Auth, Meeting Scheduling, Video Calling signaling, and Document Chamber). Week 3 (Payments, Security hardening, Final Deployment) is not included in this submission.

## What's included

| Milestone | Status | Notes |
|---|---|---|
| M1: Environment Setup | ✅ Done | Express + MongoDB backend, connected to frontend |
| M2: Auth & Profiles | ✅ Done | JWT auth, role-based (investor/entrepreneur), extended profile fields |
| M3: Meeting Scheduling | ✅ Done | Schedule/accept/reject/cancel, conflict detection |
| M4: Video Calling (Basic) | ✅ Done | WebRTC signaling via Socket.IO — join room, offer/answer/ICE relay, toggle audio/video, end call |
| M5: Document Chamber | ✅ Done | Upload docs, metadata, versioning, e-signature attach, sharing |
| M6-M8 (Week 3) | ⏭️ Skipped | Payments, security hardening, final deployment — out of scope per updated submission plan |

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for auth, bcryptjs for password hashing
- Multer for file uploads (documents + e-signature images, stored locally in `/uploads`)
- Socket.IO for WebRTC signaling (video calls)

## Folder Structure

```
nexus-backend/
├── config/db.js              # MongoDB connection
├── models/                   # User, Meeting, Document schemas
├── middleware/                # auth (JWT + roles), upload (multer), errorHandler
├── controllers/               # business logic for each module
├── routes/                    # API route definitions
├── sockets/videoSignaling.js # WebRTC signaling logic
├── uploads/                   # uploaded documents + signature images
├── server.js                  # entry point
└── .env.example                # copy this to .env and fill in your values
```

## Setup Instructions

1. Clone/unzip this into your repo, alongside (or merged with) your frontend Nexus repo.
2. Install dependencies:
   ```bash
   cd nexus-backend
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — from MongoDB Atlas (create a free cluster, add a DB user, whitelist your IP or `0.0.0.0/0` for now)
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your Vercel frontend URL (`https://nexus-iota-five.vercel.app`)
4. Run locally:
   ```bash
   npm run dev
   ```
   Server starts on `http://localhost:5000`. Visit `/` to confirm it's running.

## API Reference

### Auth — `/api/auth`
| Method | Route | Access | Body |
|---|---|---|---|
| POST | `/register` | Public | `{ name, email, password, role, bio }` — role: `investor` or `entrepreneur` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/me` | Private | — (returns logged-in user) |

Response includes a `token` — send it as `Authorization: Bearer <token>` on all private routes below.

### Users / Profiles — `/api/users`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/?role=investor` | Private | Browse investors or entrepreneurs (for dashboards) |
| GET | `/:id` | Private | View a specific profile |
| PUT | `/profile` | Private | Update own profile (bio, investmentHistory, startupHistory, etc.) |

### Meetings — `/api/meetings`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/` | Private | `{ participantId, title, description, startTime, endTime }` — rejects if conflict |
| GET | `/` | Private | List my meetings (as organizer or participant) |
| PUT | `/:id/accept` | Private (participant only) | Generates a `roomId` for video call |
| PUT | `/:id/reject` | Private (participant only) | |
| DELETE | `/:id` | Private (organizer only) | Cancels meeting |

### Documents — `/api/documents`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/upload` | Private | multipart/form-data, field name `file`, plus `title` |
| GET | `/` | Private | My documents + docs shared with me |
| GET | `/:id` | Private | Metadata for preview |
| POST | `/:id/sign` | Private | multipart/form-data, field name `signature` (image) |
| PUT | `/:id/share` | Private (uploader only) | `{ userIds: [...] }` |

### Video Calling — Socket.IO events
Connect to the same server URL with `socket.io-client`. Events:
`join-room`, `send-offer` → `receive-offer`, `send-answer` → `receive-answer`, `send-ice-candidate` → `receive-ice-candidate`, `toggle-audio` → `peer-toggle-audio`, `toggle-video` → `peer-toggle-video`, `end-call` → `call-ended`, `user-joined`, `user-left`.

Use the `roomId` returned when a meeting is accepted.

## Connecting to the Frontend (Nexus Repo)

1. In the frontend, set an API base URL (e.g. in `.env` as `VITE_API_URL=http://localhost:5000/api` for local dev, or your Render URL once deployed).
2. Use `axios` (or fetch) for all API calls, attaching the JWT:
   ```js
   const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem("token");
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });
   ```
3. Store the `token` from login/register response in `localStorage`, redirect to the right dashboard based on `role`.
4. For meeting scheduling, use a calendar library like `react-big-calendar` or `FullCalendar` — call `GET /api/meetings` to populate it, `POST /api/meetings` on slot selection.
5. For video calls, install `socket.io-client`, connect once a meeting is `accepted`, and use the browser's `RTCPeerConnection` API alongside the signaling events above to set up the peer connection.
6. For documents, use `react-pdf` (`@react-pdf-viewer/core` or similar) pointing at the `fileUrl` returned by the API (prefix with your backend URL since files are served from `/uploads/...`).

## Deployment (Week 1 + 2 scope)

- **Frontend:** already on Vercel (`https://nexus-iota-five.vercel.app`)
- **Backend:** deploy to Render
  1. Push this backend to GitHub
  2. On Render: New → Web Service → connect repo
  3. Build command: `npm install`, Start command: `npm start`
  4. Add the same environment variables from `.env` in Render's dashboard
  5. Once live, update `VITE_API_URL` in the Vercel frontend to point to the Render URL, then redeploy frontend

## What's NOT in this submission (Week 3 — skipped per updated instructions)

- Payment Section (Stripe/PayPal sandbox)
- Security hardening (XSS/SQL injection sanitization, 2FA mockup, advanced role authorization)
- Final combined deployment + Swagger/Postman docs + demo presentation

Basic JWT auth + bcrypt hashing (from M2) is already in place, which covers baseline security for this submission.

## What I did (Week 1 + Week 2 combined)

Started off by going through the existing Nexus frontend repo to see what was already built and what needed backend support. It had login/signup pages and investor/entrepreneur dashboard shells, but nothing was connected to a real backend — mostly static/mock data. So the plan was to set up a proper Node.js + Express + MongoDB backend and wire it in module by module.

**Auth & Profiles (M1-M2):** Built full JWT-based authentication — register/login routes, tokens generated on signup/login, passwords hashed with bcrypt so nothing's stored in plain text. Every user signs up as either `investor` or `entrepreneur`, and that role gets attached to the JWT so the frontend can route them to the right dashboard. Added a `protect` middleware to guard private routes and an `authorize` middleware for role-restricted ones. Profiles carry extended fields depending on role — investors get investment history and preferences, entrepreneurs get startup history. Also added APIs to view a profile, update your own, and list/browse users by role for the discovery dashboards.

**Meeting Scheduling (M3):** Built a `Meeting` model and APIs so investors/entrepreneurs can schedule calls with each other — schedule, accept, reject, cancel. The trickiest part was conflict detection: before letting a new meeting get created I check both the organizer's and participant's existing pending/accepted meetings for overlapping time ranges, and I re-check again at accept time in case something else got booked in the meantime. When a meeting gets accepted, it auto-generates a unique `roomId` used for the video call.

**Video Calling (M4):** Set up a WebRTC signaling server with Socket.IO. Worth noting — this backend doesn't carry the actual video/audio, that's peer-to-peer between the browsers via WebRTC. My server's job is just helping two users find each other and exchange the connection info they need: `join-room`, offer/answer exchange, ICE candidate exchange, audio/video toggle sync, and `end-call`. On the frontend, this hooks into the existing "Join Call" button using the meeting's `roomId`.

**Document Chamber (M5):** Built document upload/management with Multer — upload (PDF/DOC/image), fetch my docs or ones shared with me, get metadata for preview (frontend uses this with `react-pdf`), attach an e-signature (which bumps status to `signed` and increments version), and share a doc with other users. Storage is local for now (`/uploads/documents`), structured so swapping to AWS S3 later is just a change in `middleware/upload.js`.

Frontend was connected module by module as each backend piece was ready — login/signup forms hitting the auth API and storing the JWT, calendar UI pulling/pushing to the meetings API, the video call button wired to the Socket.IO signaling server, and the document upload section wired to the upload/preview/sign APIs.

**Scope note:** submitting Week 1 + Week 2 together as one project. Week 3 (Payment Section, Security Enhancements, Final Integration & Deployment) is out of scope for this submission.
