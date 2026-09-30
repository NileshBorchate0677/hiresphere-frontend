import { Outlet } from "react-router-dom";
import JobSeekerNavbar from "../components/jobseeker/JobSeekerNavbar";
import JobSeekerFooter from "../components/jobseeker/JobSeekerFooter";

const JobSeekerLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
            <JobSeekerNavbar />
            <main className="flex-1">
                {children || <Outlet />}
            </main>
            <JobSeekerFooter />
        </div>
    );
};

export default JobSeekerLayout;
