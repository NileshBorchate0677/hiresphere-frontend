import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultDashboard } from "../utils/security";
import PageLoader from "../components/common/PageLoader";

/**
 * Route guard for Guest/Auth pages (Login, Register, Forgot Password).
 * If the user is already authenticated, prevents duplicate session access
 * and automatically redirects them to their authorized role dashboard.
 */
const PublicOnlyRoute = () => {
    const { isAuthenticated, userRole, userLoading } = useAuth();

    if (userLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        const destination = getDefaultDashboard(userRole);
        return <Navigate to={destination} replace />;
    }

    return <Outlet />;
};

export default PublicOnlyRoute;
