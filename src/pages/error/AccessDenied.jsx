import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiShield, FiAlertTriangle, FiArrowRight, FiLogOut, FiHome } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getDefaultDashboard } from "../../utils/security";

const AccessDenied = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userRole, logout } = useAuth();

    const attemptedPath = location.state?.attemptedPath || "Protected Workspace";
    const requiredRole = location.state?.requiredRole;
    const isRecruiter = userRole === "RECRUITER";
    const isJobSeeker = userRole === "JOB_SEEKER";

    const myDashboardUrl = getDefaultDashboard(userRole);

    const handleSwitchAccount = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center space-y-6 animate-in fade-in duration-300">
                {/* 403 ICON SHIELD */}
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
                    <FiShield size={32} />
                </div>

                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-rose-800 text-xs font-black uppercase tracking-wider">
                        <FiAlertTriangle size={13} />
                        403 • Unauthorized Module Access
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Access Restricted
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        You do not have the required permissions to access this module.
                        {requiredRole === "RECRUITER" && (
                            <> The <strong>Employer ATS Workspace</strong> requires an active Recruiter account.</>
                        )}
                        {requiredRole === "JOB_SEEKER" && (
                            <> The <strong>Career & Candidate Portal</strong> requires a Job Seeker account.</>
                        )}
                    </p>
                </div>

                {/* CURRENT USER CONTEXT BANNER */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-left space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                        <span>Current Session:</span>
                        <span className="font-bold text-slate-800">{user?.email || "Authenticated User"}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                        <span>Active Role:</span>
                        <span className="font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 uppercase text-[10px]">
                            {userRole || "GUEST"}
                        </span>
                    </div>
                    {attemptedPath && (
                        <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Target Path:</span>
                            <span className="font-mono text-slate-700 truncate max-w-[200px]">{attemptedPath}</span>
                        </div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-2.5 pt-2">
                    <Link
                        to={myDashboardUrl}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 text-xs shadow-md shadow-indigo-600/20 transition hover:scale-[1.01]"
                    >
                        <span>Go to My {isRecruiter ? "Employer ATS" : "Candidate"} Dashboard</span>
                        <FiArrowRight size={14} />
                    </Link>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleSwitchAccount}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 text-xs transition"
                        >
                            <FiLogOut size={13} className="text-slate-400" />
                            <span>Switch Account</span>
                        </button>
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 text-xs transition"
                        >
                            <FiHome size={13} className="text-slate-400" />
                            <span>Public Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
