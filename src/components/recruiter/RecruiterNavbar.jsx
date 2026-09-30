import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    FiBarChart2,
    FiBriefcase,
    FiUsers,
    FiSearch,
    FiPlus,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronDown
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../common/NotificationsDropdown";

const RecruiterNavbar = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userName = user?.name || user?.fullName || "Employer";
    const userEmail = user?.email || "";

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 font-sans shadow-xs">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* BRAND LOGO */}
                <div className="flex items-center gap-8">
                    <Link to="/recruiter/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                            H
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Hire<span className="text-purple-600">Sphere</span>
                            </span>
                            <span className="text-[9px] font-bold text-purple-600 tracking-wider uppercase mt-0.5">
                                Recruiter Workspace
                            </span>
                        </div>
                    </Link>

                    {/* RECRUITER NAVIGATION */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink
                            to="/recruiter/dashboard"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-purple-50 text-purple-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiBarChart2 size={14} />
                            Overview
                        </NavLink>

                        <NavLink
                            to="/recruiter/jobs"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-purple-50 text-purple-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiBriefcase size={14} />
                            Job Postings
                        </NavLink>

                        <NavLink
                            to="/recruiter/applications"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-purple-50 text-purple-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiUsers size={14} />
                            ATS Candidates
                        </NavLink>

                        <NavLink
                            to="/recruiter/candidates"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-purple-50 text-purple-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiSearch size={14} />
                            <span>Talent Search</span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-[9px] font-black text-purple-700">Resdex</span>
                        </NavLink>
                    </nav>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-3">
                    {/* PRIMARY RECRUITER CTA */}
                    <Link
                        to="/recruiter/jobs/create"
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02]"
                    >
                        <FiPlus size={15} />
                        Post a Job
                    </Link>

                    {/* NOTIFICATIONS */}
                    <NotificationsDropdown />

                    {/* RECRUITER DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden lg:block text-xs font-bold text-slate-800">
                                {userName.split(" ")[0]}
                            </span>
                            <FiChevronDown size={14} className="text-slate-400" />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-2.5 border-b border-slate-100">
                                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                                    <span className="inline-block mt-1 rounded bg-purple-50 px-2 py-0.5 text-[9px] font-bold text-purple-700 uppercase">
                                        Employer Account
                                    </span>
                                </div>

                                <div className="py-1">
                                    <Link
                                        to="/recruiter/profile"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                                    >
                                        <FiBriefcase size={14} />
                                        Company Profile
                                    </Link>
                                    <Link
                                        to="/recruiter/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                                    >
                                        <FiSettings size={14} />
                                        Workspace Settings
                                    </Link>
                                </div>

                                <div className="pt-1 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50 transition"
                                    >
                                        <FiLogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                    >
                        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* MOBILE DRAWER */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in fade-in duration-150">
                    <Link
                        to="/recruiter/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Overview
                    </Link>
                    <Link
                        to="/recruiter/jobs"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Job Openings
                    </Link>
                    <Link
                        to="/recruiter/applications"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        ATS Candidates
                    </Link>
                    <Link
                        to="/recruiter/candidates"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <span>Talent Search (Resdex)</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-[9px] font-black text-purple-700">NEW</span>
                    </Link>
                    <Link
                        to="/recruiter/jobs/create"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white text-center transition"
                    >
                        + Post a Job
                    </Link>
                    <Link
                        to="/recruiter/profile"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 transition"
                    >
                        Company Profile
                    </Link>
                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default RecruiterNavbar;
