# Nexus Backend

Backend service for the Nexus platform, built with Node.js, Express, and MongoDB. Provides authentication, meeting scheduling, WebRTC video call signaling, and document management APIs.

---

## Modules

| Module                    | Description                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Authentication & Profiles | JWT-based auth, role-based accounts (investor / entrepreneur), extended profile fields |
| Meeting Scheduling        | Schedule, accept, reject, and cancel meetings with automatic conflict detection        |
| Video Calling             | WebRTC signaling server via Socket.IO for peer-to-peer video calls                     |
| Document Chamber          | Document upload, metadata tracking, versioning, and e-signature support                |

---

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication, bcrypt for password hashing
- Multer for file uploads (documents and e-signature images)
- Socket.IO for WebRTC signaling

---

## Folder Structure

```
nexus-backend/
├── config/db.js               # MongoDB connection
├── models/                    # User, Meeting, Document schemas
├── middleware/                 # Auth, file upload, error handling
├── controllers/                # Business logic for each module
├── routes/                     # API route definitions
├── sockets/videoSignaling.js  # WebRTC signaling logic
├── uploads/                    # Uploaded documents and signature images
├── server.js                   # Entry point
└── .env.example                 # Environment variable template
```

---

## Setup

1. Install dependencies:
   ```bash
   cd nexus-backend
   npm install
   ```
2. Copy `.env.example` to `.env` and configure:
   - `MONGO_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string
   - `CLIENT_URL` — the deployed frontend URL (for CORS)
3. Run locally:
   ```bash
   npm run dev
   ```
   The server starts on `http://localhost:5000`.

---

## API Reference

### Authentication — `/api/auth`

| Method | Route       | Access  | Body                                                                            |
| ------ | ----------- | ------- | ------------------------------------------------------------------------------- |
| POST   | `/register` | Public  | `{ name, email, password, role, bio }` — `role` is `investor` or `entrepreneur` |
| POST   | `/login`    | Public  | `{ email, password }`                                                           |
| GET    | `/me`       | Private | Returns the authenticated user                                                  |

The response includes a `token`, sent as `Authorization: Bearer <token>` on all private routes below.

### Users / Profiles — `/api/users`

| Method | Route             | Access  | Description                             |
| ------ | ----------------- | ------- | --------------------------------------- |
| GET    | `/?role=investor` | Private | Browse users filtered by role           |
| GET    | `/:id`            | Private | View a specific profile                 |
| PUT    | `/profile`        | Private | Update the authenticated user's profile |

### Meetings — `/api/meetings`

| Method | Route         | Access                | Description                                                                      |
| ------ | ------------- | --------------------- | -------------------------------------------------------------------------------- |
| POST   | `/`           | Private               | Schedule a meeting — `{ participantId, title, description, startTime, endTime }` |
| GET    | `/`           | Private               | List meetings for the authenticated user                                         |
| PUT    | `/:id/accept` | Private (participant) | Accept a meeting and generate a call room                                        |
| PUT    | `/:id/reject` | Private (participant) | Reject a meeting                                                                 |
| DELETE | `/:id`        | Private (organizer)   | Cancel a meeting                                                                 |

### Documents — `/api/documents`

| Method | Route        | Access          | Description                                                    |
| ------ | ------------ | --------------- | -------------------------------------------------------------- |
| POST   | `/upload`    | Private         | Upload a document (multipart/form-data, field `file`)          |
| GET    | `/`          | Private         | List documents owned by or shared with the user                |
| GET    | `/:id`       | Private         | Retrieve document metadata                                     |
| POST   | `/:id/sign`  | Private         | Attach an e-signature (multipart/form-data, field `signature`) |
| PUT    | `/:id/share` | Private (owner) | Share a document with other users                              |

### Video Calling — Socket.IO Events

Connected clients exchange the following events over the same server URL:

`join-room` · `send-offer` → `receive-offer` · `send-answer` → `receive-answer` · `send-ice-candidate` → `receive-ice-candidate` · `toggle-audio` → `peer-toggle-audio` · `toggle-video` → `peer-toggle-video` · `end-call` → `call-ended` · `user-joined` · `user-left`

The `roomId` used to join a call is generated automatically when a meeting is accepted.

---

## Frontend Integration

1. Set the API base URL in the frontend (e.g. via an `api.js` axios instance).
2. Attach the JWT to every request:
   ```js
   const api = axios.create({ baseURL: API_BASE_URL });
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem("token");
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });
   ```
3. Store the `token` from login/register in `localStorage` and route users based on `role`.
4. For meetings, populate a calendar component from `GET /api/meetings` and create new ones via `POST /api/meetings`.
5. For video calls, connect with `socket.io-client` once a meeting is accepted, and use the browser's `RTCPeerConnection` API alongside the signaling events above.
6. For documents, render previews using the `fileUrl` returned by the API.

---

## Deployment

- **Backend:** deployed on Railway
- **Frontend:** deployed on Vercel
- **Database:** MongoDB Atlas

Environment variables are configured directly in the Railway dashboard, matching the keys in `.env.example`.
