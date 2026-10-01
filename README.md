# ReadyDocs

> **“One visit is enough.”**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-teal?style=for-the-badge&logo=vercel)](https://readydocs-code-titans24.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

- **Live Application:** [https://readydocs-code-titans24.vercel.app/](https://readydocs-code-titans24.vercel.app/)
- **Demo Video:** [ADD DEMO VIDEO LINK HERE]

---

## 📌 Problem Statement

Every day, millions of citizens visit banks, government offices, universities, and insurance branches only to be turned away because they are missing a specific document, an acceptable proof of address, or an attested photocopy. 

These missing documents lead to:
- **Wasted trips and repeated visits**, consuming valuable work hours and travel expenses.
- **Confusion over complex eligibility criteria**, differing between resident statuses, quotas, and account types.
- **Frustration for senior citizens and non-English speakers**, who encounter rigid paperwork without guidance in their native language.

**ReadyDocs solves this problem at the root.** By tailoring requirements to each user's exact profile before they leave home, ReadyDocs ensures that **one visit is enough**.

---

## 🚀 How It Works

```text
1. Choose Service ──► 2. Answer Questions ──► 3. Personalized Checklist
       │                       │                            │
   Select from            Quick wizard tailored        Authoritative list of
   Bank, Admission,       to your age, quota,          mandatory & optional
   or Insurance           domicile & category          required documents
       │                       │                            │
       ▼                       ▼                            ▼
4. Guidance & Upload ──► 5. Export & Share ─────► 6. Arrive Prepared
       │                       │                            │
   "How do I get this?"   Download printable PDF,      Visit once with 100%
   step-by-step guides    share via WhatsApp, or       document readiness
   & AI classification    copy summary to clipboard
```

1. **Choose Service:** Select the target service (e.g., SBI Savings Account, SPPU University Admission, or Insurance Claim).
2. **Answer Questions:** Answer a brief, step-by-step interactive wizard tailored to your scenario (e.g., resident status, age, category quota).
3. **Get Personalized Checklist:** Receive an authoritative, dynamic checklist generated specifically for your situation.
4. **View Guidance & Upload Documents:** Open step-by-step "How do I get this?" guides for missing papers, or test document eligibility with AI classification.
5. **Export & Share:** Export clean printable A4 PDFs, share formatted summaries to WhatsApp, or copy checklists to your clipboard.
6. **Arrive Prepared:** Walk into the branch or counter with complete confidence.

---

## ✨ Key Features

- **Personalized Document Checklists:** Dynamic generation based on residency, age, category, domicile, and claim types—never generic one-size-fits-all lists.
- **Multilingual Support (English, Hindi, Marathi):** Comprehensive localization across the entire questionnaire, options, guidance modals, status badges, and system toasts with instant language switching.
- **Senior Citizen Mode:** Accessibility-first mode featuring larger typography (1.25rem+), comfortable 44px–48px touch targets, high contrast, and responsive layout wrapping.
- **Dark Mode Support:** Full high-contrast dark theme designed to reduce eye strain, respecting system preferences and manual toggling.
- **Document Help Guides:** Step-by-step instructions detailing where to obtain each document, official portals, valid alternatives, and turnaround times.
- **Document Upload & AI Classification:** Intelligent classification powered by Gemini to verify document categories and cross-check against checklist requirements.
- **Checklist Management & Tracking:** Save multiple checklists per profile, search, filter by status (`Ready`, `Needs Attention`, `Incomplete`), and delete checklists with confirmation dialogs.
- **Flexible Export & Sharing:** One-click printable PDF download, instant formatted WhatsApp sharing, and plain-text clipboard copying.
- **Supabase Authentication:** Secure email/password authentication, session persistence, automatic profile creation, and user-scoped data access.
- **Privacy-First (Zero-Knowledge Architecture):** Zero storage of sensitive government identifiers (Aadhaar, PAN), bank account numbers, passwords, OTPs, or payment card details.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, html2canvas, jsPDF |
| **Backend** | Node.js, Express.js, Zod (schema validation), JWT authentication, Bcrypt.js, Multer (file handling) |
| **AI Engine** | Google Gemini API via official `@google/genai` SDK with Structured JSON Outputs |
| **Database & Auth** | Supabase PostgreSQL with Row Level Security (RLS) policies and user scoping |
| **Hosting** | Vercel (Frontend SPA & Serverless Architecture) |

---

## 🏗️ Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│         React 18 + Vite + Tailwind CSS + Lucide Icons + jsPDF          │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  Checklist Generator  │  │ Senior Mode / UI │  │ i18n (EN/HI/MR)  │  │
│  └──────────┬────────────┘  └────────┬────────┘  └────────┬─────────┘  │
└─────────────┼────────────────────────┼────────────────────┼────────────┘
              │                        │                    │
              ▼                        ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & BACKEND SERVICES                          │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │    Express.js REST API    │      │    Supabase Auth & DB       │   │
│   │  • Checklist Rules Engine │      │  • User Authentication      │   │
│   │  • Zod Request Validation │◄────►│  • PostgreSQL + RLS         │   │
│   │  • Multer File Handler    │      │  • Profiles & Checklists    │   │
│   └─────────────┬─────────────┘      └─────────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               AI ENGINE                                │
│                   Google Gemini API (@google/genai)                    │
│   • Document Classification & Verification                             │
│   • Structured JSON Output Parsing & Schema Validation                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
ReadyDocs/
├── docs/
│   └── PRODUCTION_SMTP_SETUP.md    # Production custom SMTP setup guide
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, triggers & RLS policies
├── server/                         # Express Backend API
│   ├── package.json
│   ├── .env.example                # Server environment template
│   ├── src/
│   │   ├── config/                 # Supabase & Gemini client configs
│   │   ├── controllers/            # Route controllers (auth, checklist, docs)
│   │   ├── data/                   # Trusted service document checklists & guides
│   │   ├── middleware/             # JWT auth & error handling middleware
│   │   ├── routes/                 # Express API routes
│   │   └── server.js               # Express application entrypoint
│   └── scripts/                    # Verification & diagnostic utilities
└── client/                         # React Frontend SPA
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── .env.example                # Client environment template
    └── src/
        ├── components/             # Reusable UI components (Navbar, Modals, Guides)
        ├── context/                # Auth, Theme, Language, Profile React Contexts
        ├── i18n/                   # Translations dictionary (en, hi, mr)
        ├── pages/                  # Route views (Home, Dashboard, Generator, Detail)
        ├── utils/                  # Export, share, and formatting utilities
        ├── index.css               # Global styles & Senior Citizen Mode rules
        └── App.jsx                 # Router & provider root
```

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- A **Supabase** account ([supabase.com](https://supabase.com))
- A **Google AI Studio** Gemini API Key ([aistudio.google.com](https://aistudio.google.com/))

---

### 1. Clone the Repository
```bash
git clone https://github.com/SahilBildikar/ReadyDocs.git
cd ReadyDocs
```

---

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Configure your `server/.env` with your credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_super_secret_jwt_random_key_here_change_in_production
JWT_EXPIRES_IN=7d
```

Start the server:
```bash
npm run dev
# Or start directly:
node src/server.js
```
The server will start on `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

---

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
cp .env.example .env
```

Configure your `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

Start the frontend development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 4. Database Setup (Supabase)
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and run the script.
4. This creates the `profiles`, `checklists`, and `documents` tables, enables Row Level Security (RLS), and sets up automatic profile provisioning triggers on new user signup.

---

## 🔐 Security & Privacy

ReadyDocs is built around strict data minimization and user privacy principles:

- **Zero-Knowledge Identifier Policy:** ReadyDocs does **not** store or persist Aadhaar numbers, PAN numbers, bank account numbers, passwords, OTPs, or payment card details.
- **Row Level Security (RLS):** All database tables enforce PostgreSQL Row Level Security policies. Users can strictly only read, update, or delete records matching their authenticated `user_id`.
- **Credential Protection:** The Supabase Service Role Key is strictly isolated to server-side operations and is never bundled in frontend code.
- **Client-Side Sanitization:** All export and sharing utilities sanitize data locally before generating PDFs or WhatsApp share links.

---

## 📧 Production SMTP Setup

ReadyDocs uses Supabase Auth for user account registration and password management. Supabase's default built-in SMTP service has rate limits (~2–3 emails/hour on free tier projects). 

For production deployments, configuring a custom SMTP provider (such as **Resend**) ensures reliable instant user confirmation emails without rate limiting.

👉 **Complete Step-by-Step Setup Guide:** See [docs/PRODUCTION_SMTP_SETUP.md](docs/PRODUCTION_SMTP_SETUP.md) for custom domain verification (DKIM/SPF), Supabase dashboard configuration, and security checklists.

---

## 👥 Team

| Name | Role | GitHub / Contact |
|---|---|---|
| *[Team Member 1]* | Full Stack Development & Architecture | [@username](https://github.com/) |
| *[Team Member 2]* | AI Integration & Backend Engineering | [@username](https://github.com/) |
| *[Team Member 3]* | Frontend Engineering & Accessibility UI | [@username](https://github.com/) |
| *[Team Member 4]* | Localization & Product Design | [@username](https://github.com/) |

---

## 🗺️ Future Roadmap

- [ ] **Additional Services:** Expansion to Passport applications, Driving License renewals, Senior Pension schemes, and Voter ID updates.
- [ ] **Voice Guidance:** Multilingual audio walkthroughs to assist low-literacy applicants and visually impaired users.
- [ ] **Offline PWA:** Progressive Web App capabilities for offline checklist access in areas with intermittent connectivity.
- [ ] **Additional Indian Languages:** Localization support for Tamil, Telugu, Bengali, Kannada, and Gujarati.
- [ ] **Official Source API Verification:** Real-time synchronization with DigiLocker and government portal requirement feeds.
- [ ] **Citizen Feedback Loop:** Community contributions and branch feedback to alert users to localized regional requirements.

---

<div align="center">
  <sub>Built with ❤️ for Indian Citizens. One visit is enough.</sub>
</div>
