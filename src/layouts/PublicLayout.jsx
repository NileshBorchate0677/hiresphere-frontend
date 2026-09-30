import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/public/PublicNavbar";
import Footer from "../components/common/Footer";

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
            <PublicNavbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
