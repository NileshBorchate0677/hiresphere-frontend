# 💼 HireSphere - Modern Job Portal Frontend

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

> **HireSphere Frontend** is a modern, responsive, and reactive Single Page Application (SPA) designed to provide a seamless hiring experience for both **Job Seekers** and **Recruiters**. Built with React 19, Vite, and Tailwind CSS v4.

---

## ✨ Features & User Experience

### 🔐 1. Authentication & Role-Based Access Control
- **Dynamic Role-Based Routing:** Protected routes for JOB_SEEKER, RECRUITER, and ADMIN.
- **Session Management:** Secure JWT storage, automatic token refreshing, and silent logout upon session expiry.
- **Self-Service Account Tools:** Change password, reset password with OTP tokens, profile updates.

### 🎯 2. Candidate (Job Seeker) Experience
- **Interactive Job Search:** Multi-faceted filtering by title, company, location, workplace type (Remote / Hybrid / On-Site), and salary ranges.
- **One-Click Job Application:** Apply modal with optional cover letter and instant resume attachment.
- **Naukri-Style Comprehensive Profile:**
  - Headline, bio, salary expectations, notice period, location preferences.
  - Work experience timeline with designation and responsibilities.
  - Education history with degrees, colleges, and GPA records.
  - Project showcase with live demo links and GitHub repositories.
- **Instant Resume Upload:** PDF upload engine with automatic file validation and viewer.
- **Application Tracker:** Live status tracking (APPLIED ➔ SHORTLISTED ➔ ACCEPTED / REJECTED).
- **Saved Jobs:** Bookmark interesting job openings for later review.

### 🏢 3. Recruiter Workspace & Pipeline
- **Recruiter Dashboard:** At-a-glance metrics of active job posts, applicant counts, and hiring pipelines.
- **Job Creation & Management:** Create, edit, and close job postings with detailed requirements and salary bounds.
- **Applicant Pipeline Review:** Review candidate applications, filter by stage, and update statuses.
- **Candidate 360° Dossier:** Deep-dive modal viewing candidate experience, projects, skills, and direct contact details.
- **Resume Viewer & Download:** High-speed streaming PDF resume download.

---

## 🛠️ Technology Stack

| Layer | Tools & Libraries |
| :--- | :--- |
| **Framework** | React 19 (Hooks, Context API) |
| **Build Tool** | Vite 8 (Ultra-fast HMR and bundle optimization) |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (with automated request/response interceptors) |
| **Icons** | React Icons (Lucide / Feather / FontAwesome icons) |
| **Deployment** | Vercel (Configured with ercel.json SPA rewrite rules) |

---

## 📁 Directory Structure

`ash
hiresphere-frontend/
 ├── public/             # Static public assets and favicon
 ├── src/
 │    ├── assets/        # Media and image resources
 │    ├── components/    # Reusable UI widgets, Modals, Navbar, Footer
 │    ├── context/       # AuthContext and global application state
 │    ├── hooks/         # Custom React hooks
 │    ├── layouts/       # MainLayout and Dashboard shell layouts
 │    ├── pages/         # View components (Auth, Jobs, Dashboard, Profiles)
 │    ├── routes/        # AppRoutes and RoleRoute guards
 │    ├── services/      # Axios API service integrations
 │    ├── utils/         # Helper functions and formatting utilities
 │    ├── App.jsx        # Root application component
 │    ├── index.css      # Tailwind CSS directives and custom styling
 │    └── main.jsx       # Entry point
 ├── package.json
 ├── vite.config.js
 └── vercel.json         # SPA client-side routing fallback configuration
`

---

## ⚙️ Environment Variables

Create a .env or .env.local file in the root directory:

`env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8080
`

When deployed to **Vercel**, set VITE_API_BASE_URL to your production backend URL (e.g. https://hiresphere-backend.onrender.com).

---

## 💻 Local Setup & Development

### 1. Install Dependencies
`ash
npm install
`

### 2. Run Development Server
`ash
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
`ash
npm run build
`

---

## 👨‍💻 Author

**Nilesh Borchate**  
- GitHub: [@NileshBorchate0677](https://github.com/NileshBorchate0677)  
- Project: HireSphere Platform
