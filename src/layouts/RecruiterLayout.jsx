import { Outlet } from "react-router-dom";
import RecruiterNavbar from "../components/recruiter/RecruiterNavbar";
import RecruiterFooter from "../components/recruiter/RecruiterFooter";

const RecruiterLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-purple-500 selection:text-white">
            <RecruiterNavbar />
            <main className="flex-1">
                {children || <Outlet />}
            </main>
            <RecruiterFooter />
        </div>
    );
};

export default RecruiterLayout;
