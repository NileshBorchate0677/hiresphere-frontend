// ================================
// USER ROLES
// ================================

export const USER_ROLES = {
    JOB_SEEKER: "JOB_SEEKER",
    RECRUITER: "RECRUITER",
    ADMIN: "ADMIN",
};


// ================================
// JOB TYPES
// ================================

export const JOB_TYPES = {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    INTERNSHIP: "INTERNSHIP",
    CONTRACT: "CONTRACT",
};


// ================================
// JOB STATUS
// ================================

export const JOB_STATUS = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    DRAFT: "DRAFT",
};


// ================================
// APPLICATION STATUS
// ================================

export const APPLICATION_STATUS = {
    APPLIED: "APPLIED",
    REVIEWING: "REVIEWING",
    SHORTLISTED: "SHORTLISTED",
    REJECTED: "REJECTED",
    HIRED: "HIRED",
};


// ================================
// API
// ================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


// ================================
// LOCAL STORAGE KEYS
// ================================

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    USER_ROLE: "userRole",
};


// ================================
// PAGINATION
// ================================

export const DEFAULT_PAGE_SIZE = 10;


// ================================
// EXPERIENCE OPTIONS
// ================================

export const EXPERIENCE_OPTIONS = [
    "Fresher",
    "0-1 Years",
    "1-2 Years",
    "2-3 Years",
    "3-5 Years",
    "5+ Years",
];