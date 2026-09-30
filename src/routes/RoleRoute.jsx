import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getValidatedSession, normalizeRole } from "../utils/security";
import PageLoader from "../components/common/PageLoader";

/**
 * Enterprise Role-Based Route Guard.
 * Enforces strict module isolation between Candidate and Recruiter workspaces.
 * Validates cryptographically signed JWT claims to defeat local storage tampering.
 */
const RoleRoute = ({ allowedRoles = [] }) => {
    const location = useLocation();
    const { isAuthenticated, userRole, userLoading, logout } = useAuth();

    // 1. Wait until user auth state is loaded from storage/API
    if (userLoading) {
        return <PageLoader />;
    }

    const token = localStorage.getItem("accessToken");

    // 2. Unauthenticated check
    if (!isAuthenticated || !token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // 3. Cryptographic integrity check against client tampering
    const session = getValidatedSession(token, userRole);
    if (!session.valid) {
        console.warn("Session integrity validation failed:", session.reason);
        // Force cleanup and send to login
        logout();
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location, securityAlert: "Session expired or invalid" }}
            />
        );
    }

    const currentRole = normalizeRole(session.role || userRole);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    // 4. Role Authorization Check
    if (!normalizedAllowed.includes(currentRole)) {
        console.warn(
            `Access restricted: User with role '${currentRole}' attempted to access route requiring '${normalizedAllowed.join(", ")}'`
        );
        return (
            <Navigate
                to="/access-denied"
                replace
                state={{
                    attemptedPath: location.pathname,
                    requiredRole: allowedRoles[0],
                    currentRole: currentRole
                }}
            />
        );
    }

    return <Outlet />;
};

export default RoleRoute;