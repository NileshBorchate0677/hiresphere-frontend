import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    FiSearch,
    FiBriefcase,
    FiUsers,
    FiUser,
    FiSettings,
    FiLogOut,
    FiPlus,
    FiMenu,
    FiX,
    FiChevronDown,
    FiBookmark,
    FiFileText,
    FiExternalLink
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";

const Navbar = () => {
    const { isAuthenticated, user, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);
    const jobsRef = useRef(null);

    const isRecruiter = isAuthenticated && userRole === "RECRUITER";
    const isJobSeeker = isAuthenticated && userRole === "JOB_SEEKER";

    const userName = user?.fullName || user?.name || (isRecruiter ? "Employer" : "Candidate");
    const userEmail = user?.email || "";

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
            if (jobsRef.current && !jobsRef.current.contains(e.target)) {
                setJobsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setUserDropdownOpen(false);
        setJobsDropdownOpen(false);
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 font-sans">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* BRAND LOGO */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            H
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Hire<span className="text-indigo-600">Sphere</span>
                            </span>
                            {isRecruiter && (
                                <span className="text-[9px] font-bold text-indigo-500 tracking-wider uppercase mt-0.5">
                                    Recruiter Workspace
                                </span>
                            )}
                            {isJobSeeker && (
                                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                                    Career Portal
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* DESKTOP NAV LINKS - STRICTLY ZERO DUPLICATION */}
                    <nav className="hidden md:flex items-center gap-1.5 ml-4">
                        {/* 1. GUEST NAV */}
                        {!isAuthenticated && (
                            <>
                                <NavLink
                                    to="/jobs/search"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    Explore Jobs
                                </NavLink>
                                <NavLink
                                    to="/about"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    About Platform
                                </NavLink>
                            </>
                        )}

                        {/* 2. JOB SEEKER NAV */}
                        {isJobSeeker && (
                            <>
                                <NavLink
                                    to="/jobs/search"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    Explore Jobs
                                </NavLink>
                                <NavLink
                                    to="/jobseeker/dashboard"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    My Dashboard
                                </NavLink>
                            </>
                        )}

                        {/* 3. RECRUITER NAV */}
                        {isRecruiter && (
                            <>
                                <NavLink
                                    to="/recruiter/dashboard"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    Overview
                                </NavLink>
                                <NavLink
                                    to="/recruiter/jobs"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    Job Openings
                                </NavLink>
                                <NavLink
                                    to="/recruiter/applications"
                                    className={({ isActive }) =>
                                        `px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    Candidates (ATS)
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>

                {/* RIGHT ACTION BAR */}
                <div className="flex items-center gap-3">
                    {/* GUEST ACTIONS */}
                    {!isAuthenticated && (
                        <div className="hidden sm:flex items-center gap-2.5">
                            <Link
                                to="/register"
                                className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 transition"
                            >
                                Employers / Post Job
                            </Link>

                            <Link
                                to="/login"
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition"
                            >
                                Log In
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* RECRUITER QUICK CTA */}
                    {isRecruiter && (
                        <Link
                            to="/recruiter/jobs/create"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                        >
                            <FiPlus size={15} />
                            Post a Job
                        </Link>
                    )}

                    {/* LIVE NOTIFICATIONS BELL */}
                    {isAuthenticated && <NotificationsDropdown />}

                    {/* USER PROFILE DROPDOWN */}
                    {isAuthenticated && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden lg:block text-xs font-bold text-slate-800">
                                    {userName.split(" ")[0]}
                                </span>
                                <FiChevronDown size={14} className="text-slate-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-2.5 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                                        <span className="inline-block mt-1 rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 uppercase">
                                            {isRecruiter ? "Employer Account" : "Job Seeker"}
                                        </span>
                                    </div>

                                    {/* JOB SEEKER PRIVATE OPTIONS */}
                                    {isJobSeeker && (
                                        <div className="py-1">
                                            <Link
                                                to="/jobseeker/profile"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiUser size={14} />
                                                Profile & Resume
                                            </Link>
                                            <Link
                                                to="/jobseeker/applications"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiFileText size={14} />
                                                My Applications
                                            </Link>
                                            <Link
                                                to="/jobseeker/saved-jobs"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiBookmark size={14} />
                                                Saved Jobs
                                            </Link>
                                            <Link
                                                to="/jobseeker/settings"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiSettings size={14} />
                                                Account Settings
                                            </Link>
                                        </div>
                                    )}

                                    {/* RECRUITER PRIVATE OPTIONS */}
                                    {isRecruiter && (
                                        <div className="py-1">
                                            <Link
                                                to="/recruiter/profile"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiBriefcase size={14} />
                                                Organization Profile
                                            </Link>
                                            <Link
                                                to="/recruiter/settings"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiSettings size={14} />
                                                Workspace Settings
                                            </Link>
                                            <Link
                                                to="/"
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <FiExternalLink size={14} />
                                                Public Job Board
                                            </Link>
                                        </div>
                                    )}

                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50 transition"
                                        >
                                            <FiLogOut size={14} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MOBILE MENU TOGGLE */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                    >
                        {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* MOBILE NAV DRAWER */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                to="/jobs/search"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Explore Jobs
                            </Link>
                            <Link
                                to="/about"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                About Platform
                            </Link>
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="flex-1 text-center py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex-1 text-center py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white"
                                >
                                    Register
                                </Link>
                            </div>
                        </>
                    ) : isJobSeeker ? (
                        <>
                            <Link
                                to="/jobs/search"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Explore Jobs
                            </Link>
                            <Link
                                to="/jobseeker/dashboard"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                My Dashboard
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/recruiter/dashboard"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Overview
                            </Link>
                            <Link
                                to="/recruiter/jobs"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Job Openings
                            </Link>
                            <Link
                                to="/recruiter/applications"
                                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Candidates (ATS)
                            </Link>
                            <Link
                                to="/recruiter/jobs/create"
                                className="block px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white text-center mt-2"
                            >
                                + Post a Job
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
