import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {

    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");

    if (token) {

        if (userRole === "RECRUITER") {
            return (
                <Navigate
                    to="/recruiter/dashboard"
                    replace
                />
            );
        }

        if (userRole === "JOB_SEEKER") {
            return (
                <Navigate
                    to="/jobseeker/dashboard"
                    replace
                />
            );
        }

        if (userRole === "ADMIN") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }
    }

    return <Outlet />;
};

export default GuestRoute;