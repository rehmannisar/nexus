# Nexus — Investor & Entrepreneur Collaboration Platform

Nexus is a full-stack web platform that connects investors and entrepreneurs, enabling them to build profiles, discover one another, schedule meetings, hold video calls, and share documents securely.

🔗 **Live App:** https://nexus-three-blue.vercel.app
🔗 **Backend API:** https://nexus-production-f49e.up.railway.app

---

## Overview

Nexus solves a simple problem: investors and entrepreneurs need a dedicated space to find each other, connect, and collaborate — without juggling emails, spreadsheets, and third-party scheduling tools. The platform provides role-based dashboards, integrated meeting scheduling with conflict-free booking, real-time video calls, and a secure document workspace with e-signature support.

This repository contains the complete implementation covering **Authentication, Meeting Scheduling, Video Calling, and Document Management** — delivered as a single, fully functional milestone.

---

## Features

**Authentication & Profiles**

- Secure JWT-based authentication with encrypted password storage
- Role-based accounts — Investor and Entrepreneur — each routed to a tailored dashboard
- Extended profile data: bio, investment history and preferences for investors; startup history for entrepreneurs
- Discovery view to browse users filtered by role

**Meeting Scheduling**

- Schedule, accept, reject, and cancel meetings between users
- Automatic conflict detection to prevent double-booking across both parties
- Each accepted meeting generates a dedicated video call room

**Video Calling**

- Real-time WebRTC signaling built with Socket.IO for peer-to-peer video calls
- Room-based join/leave handling, audio and video toggle sync, and call termination

**Document Processing Chamber**

- Secure document upload and storage with metadata tracking (title, version, status)
- In-browser document preview
- E-signature attachment linked to uploaded documents
- Document sharing between users

---

## Tech Stack

| Layer                   | Technology                                                     |
| ----------------------- | -------------------------------------------------------------- |
| Frontend                | React, TypeScript, Tailwind CSS, Vite                          |
| Backend                 | Node.js, Express.js                                            |
| Database                | MongoDB with Mongoose                                          |
| Real-Time Communication | Socket.IO (WebRTC signaling)                                   |
| Authentication          | JWT, bcrypt                                                    |
| File Handling           | Multer                                                         |
| Deployment              | Vercel (frontend), Railway (backend), MongoDB Atlas (database) |

---

## Project Structure

```
nexus/
├── src/                    # Frontend source (React + TypeScript)
├── public/                 # Static assets
├── nexus-backend/          # Backend source (Express + MongoDB)
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, file upload, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── sockets/            # WebRTC signaling logic
│   └── server.js           # Entry point
└── README.md
```

---

## Getting Started

**Backend**

```bash
cd nexus-backend
npm install
cp .env.example .env
npm start
```

**Frontend**

```bash
npm install
npm run dev
```

---

## API Reference

| Endpoint                   | Method     | Description                       |
| -------------------------- | ---------- | --------------------------------- |
| `/api/auth/register`       | POST       | Register a new user               |
| `/api/auth/login`          | POST       | Authenticate a user               |
| `/api/users/:id`           | GET        | View a user profile               |
| `/api/users/profile`       | PUT        | Update own profile                |
| `/api/meetings`            | POST / GET | Schedule or list meetings         |
| `/api/meetings/:id/accept` | PUT        | Accept a meeting request          |
| `/api/meetings/:id/reject` | PUT        | Reject a meeting request          |
| `/api/documents/upload`    | POST       | Upload a document                 |
| `/api/documents/:id/sign`  | POST       | Attach an e-signature             |
| `/api/documents/:id/share` | PUT        | Share a document with other users |

A detailed breakdown of request/response formats is available in [`nexus-backend/README.md`](./nexus-backend/README.md).
