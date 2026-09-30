import { Link } from "react-router-dom";
import {
    FiBriefcase,
    FiFileText,
    FiBookmark,
    FiUser,
    FiShield,
    FiCheckCircle,
    FiBell,
    FiSettings,
    FiGrid
} from "react-icons/fi";

const JobSeekerFooter = () => {
    return (
        <footer className="border-t border-slate-200/90 bg-white/95 backdrop-blur-md font-sans mt-auto pt-8 pb-20 sm:pb-8 shadow-xs">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* TOP ROW: BRAND & 3 COLUMN CANDIDATE SUITE DIRECTORY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100">
                    {/* Brand Info */}
                    <div className="space-y-3 md:col-span-1">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                                H
                            </div>
                            <div>
                                <span className="font-black text-slate-900 tracking-tight text-base leading-none">
                                    Hire<span className="text-indigo-600">Sphere</span>
                                </span>
                                <span className="block text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider mt-0.5">
                                    Candidate Suite
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Next-generation talent ecosystem connecting software engineers with top verified tech enterprises across India.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/70 px-3 py-1 rounded-full w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>ATS Search Pipeline Active</span>
                        </div>
                    </div>

                    {/* Column 1: Job Search & Applications */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                            Job Opportunities
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-slate-600">
                            <li>
                                <Link
                                    to="/jobseeker/jobs"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiBriefcase size={13} className="text-slate-400" />
                                    <span>Browse Tech Jobs</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/applications"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiFileText size={13} className="text-slate-400" />
                                    <span>Application Tracker</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/saved-jobs"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiBookmark size={13} className="text-slate-400" />
                                    <span>Saved & Bookmarked</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/dashboard"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiGrid size={13} className="text-slate-400" />
                                    <span>Candidate Dashboard</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Candidate Profile & AI */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                            Candidate Profile
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-slate-600">
                            <li>
                                <Link
                                    to="/jobseeker/profile"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiUser size={13} className="text-slate-400" />
                                    <span>View & Edit Profile</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/profile"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiFileText size={13} className="text-slate-400" />
                                    <span>Resume PDF & Headline</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/profile"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiCheckCircle size={13} className="text-slate-400" />
                                    <span>IT Key Skills Matrix</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Account & Security */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                            Account & Security
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-slate-600">
                            <li>
                                <Link
                                    to="/jobseeker/notifications"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiBell size={13} className="text-slate-400" />
                                    <span>Notifications & Alerts</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/settings"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiSettings size={13} className="text-slate-400" />
                                    <span>Account & Password</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/jobseeker/settings"
                                    className="hover:text-indigo-600 transition flex items-center gap-1.5"
                                >
                                    <FiShield size={13} className="text-slate-400" />
                                    <span>Active Login Sessions</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM ROW: COPYRIGHT & TRUST STATUS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-medium">
                    <p>© {new Date().getFullYear()} HireSphere Technologies. All candidate data encrypted & secured.</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-slate-600 font-semibold">
                            <FiShield size={12} className="text-emerald-500" />
                            <span>100% Verified Tech Companies</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-semibold">
                            Enterprise ATS Standard
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default JobSeekerFooter;
