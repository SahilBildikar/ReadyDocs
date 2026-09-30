# ReadyDocs - Intelligent Document Processing Platform

> **Tagline**: *"One visit is enough."*

ReadyDocs is an AI-powered Intelligent Document Processing platform that helps people understand document requirements, prepare document checklists, upload and understand documents, classify documents, extract basic non-sensitive information, validate missing items, and auto-fill official demo forms safely.

---

## Architecture Overview

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router Dom
- **Backend**: Node.js, Express.js, Zod validation, JWT authentication, Bcrypt password hashing, Multer file upload handling
- **AI Engine**: Google Gemini API via official `@google/genai` SDK with Structured JSON outputs
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies and user scoping
- **Security & Privacy**: Zero storage of Aadhaar, PAN, bank account numbers, passwords, OTPs, or card details.

---

## Project Structure

```text
ReadyDocs/
├── .gitignore
├── README.md
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, triggers & RLS policies
├── server/                         # Express Backend API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       └── server.js               # Entry point with health checks
└── client/                         # React Frontend SPA
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── index.css
        ├── main.jsx
        └── App.jsx
```

---

## Getting Started

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The server will run on `http://localhost:5000`. Test the health check at `http://localhost:5000/api/health`.

### 2. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```
The client will run on `http://localhost:5173`.
