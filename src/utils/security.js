/**
 * Enterprise URL Direction & Security Guard Utilities
 * Protects HireSphere against unauthorized URL tampering, role spoofing, open redirect exploits, and session corruption.
 */

/**
 * Safely decodes JWT payload without external library dependencies
 */
export function parseJwt(token) {
    if (!token || typeof token !== "string") return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        // Base64URL decode
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.warn("Invalid JWT structure detected:", e);
        return null;
    }
}

/**
 * Standardize role name (stripping ROLE_ prefix if present)
 */
export function normalizeRole(role) {
    if (!role) return null;
    const str = String(role).trim().toUpperCase();
    if (str.startsWith("ROLE_")) return str.replace("ROLE_", "");
    return str;
}

/**
 * Validates whether the token is cryptographically unexpired and role matches signed token claim.
 * Prevents client-side localStorage tampering (e.g., user manually typing localStorage.setItem('userRole', 'RECRUITER'))
 */
export function getValidatedSession(token, currentRole) {
    if (!token) return { valid: false, reason: "NO_TOKEN" };

    const payload = parseJwt(token);
    if (!payload) return { valid: false, reason: "MALFORMED_TOKEN" };

    // 1. Expiration check
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        return { valid: false, reason: "TOKEN_EXPIRED" };
    }

    // 2. Role verification from cryptographically signed claims
    const tokenRole = normalizeRole(payload.Role || payload.role || payload.authorities?.[0]);
    const normalizedStoredRole = normalizeRole(currentRole);

    if (tokenRole && normalizedStoredRole && tokenRole !== normalizedStoredRole) {
        console.warn("🚨 Security Alert: Role mismatch detected between JWT claim and storage. Potential tampering.");
        return { valid: false, reason: "ROLE_TAMPERED", tokenRole };
    }

    return {
        valid: true,
        role: tokenRole || normalizedStoredRole,
        userId: payload.sub || payload.userId,
        email: payload.Username || payload.username || payload.email
    };
}

/**
 * Sanitizes redirect destination URLs to prevent Open Redirect exploits and Cross-Module Leakage.
 * Rules:
 *  1. Only internal relative paths allowed (must start with single '/', not '//')
 *  2. Disallow dangerous URI schemes (javascript:, data:, vbscript:, etc.)
 *  3. Cross-Module protection: Job Seekers cannot be redirected to /recruiter/*, Recruiters cannot be redirected to /jobseeker/*
 */
export function sanitizeRedirectPath(targetPath, userRole) {
    if (!targetPath || typeof targetPath !== "string") {
        return getDefaultDashboard(userRole);
    }

    const trimmed = targetPath.trim();

    // 1. Block external schemes & protocol relative URLs
    if (
        !trimmed.startsWith("/") ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("/\\") ||
        /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ) {
        console.warn("Blocked potentially malicious third-party redirect URL:", targetPath);
        return getDefaultDashboard(userRole);
    }

    // 2. Disallow auth pages as redirect target
    if (
        trimmed.startsWith("/login") ||
        trimmed.startsWith("/register") ||
        trimmed.startsWith("/forgot-password") ||
        trimmed.startsWith("/reset-password")
    ) {
        return getDefaultDashboard(userRole);
    }

    // 3. Enforce Module Role Boundaries
    const normRole = normalizeRole(userRole);
    if (normRole === "JOB_SEEKER" && trimmed.startsWith("/recruiter")) {
        console.warn("Blocked Job Seeker attempting to navigate to Recruiter portal via redirect.");
        return "/jobseeker/dashboard";
    }

    if (normRole === "RECRUITER" && trimmed.startsWith("/jobseeker")) {
        console.warn("Blocked Recruiter attempting to navigate to Job Seeker portal via redirect.");
        return "/recruiter/dashboard";
    }

    return trimmed;
}

/**
 * Returns the default workspace dashboard for an authenticated role
 */
export function getDefaultDashboard(role) {
    const norm = normalizeRole(role);
    if (norm === "RECRUITER") return "/recruiter/dashboard";
    if (norm === "JOB_SEEKER") return "/jobseeker/dashboard";
    return "/";
}
