import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    FiBriefcase,
    FiGrid,
    FiFileText,
    FiBookmark,
    FiUser,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronDown,
    FiArrowRight,
    FiBell
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "../common/NotificationsDropdown";
import {
    getJobSeekerProfile,
    getJobSeekerEducation,
    getJobSeekerExperiences
} from "../../services/jobSeekerService";
import { calculateProfileCompleteness } from "../../utils/aiHelper";

const JobSeekerNavbar = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const dropdownRef = useRef(null);

    const userName = user?.name || user?.fullName || "Candidate";
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

    useEffect(() => {
        let isMounted = true;
        Promise.allSettled([
            getJobSeekerProfile(),
            getJobSeekerEducation(),
            getJobSeekerExperiences()
        ]).then(([profRes, eduRes, expRes]) => {
            if (!isMounted) return;
            const data = profRes.status === "fulfilled" ? profRes.value : null;
            const edus = eduRes.status === "fulfilled" && Array.isArray(eduRes.value) ? eduRes.value : [];
            const exps = expRes.status === "fulfilled" && Array.isArray(expRes.value) ? expRes.value : [];
            if (data) {
                setProfile({
                    ...data,
                    educationCount: edus.length,
                    employmentCount: exps.length
                });
            }
        }).catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    const completeness = calculateProfileCompleteness(profile || { fullName: userName });

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 font-sans shadow-xs">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* BRAND LOGO */}
                <div className="flex items-center gap-6 lg:gap-8">
                    <Link to="/jobseeker/jobs" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            H
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Hire<span className="text-indigo-600">Sphere</span>
                            </span>
                            <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
                                Candidate Portal
                            </span>
                        </div>
                    </Link>

                    {/* STANDARD DESKTOP CANDIDATE NAVIGATION (NAUKRI.COM ARCHITECTURE) */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        <NavLink
                            to="/jobseeker/jobs"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiBriefcase size={14} />
                            <span>Jobs</span>
                        </NavLink>

                        <NavLink
                            to="/jobseeker/applications"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiFileText size={14} />
                            <span>My Applications</span>
                        </NavLink>

                        <NavLink
                            to="/jobseeker/saved-jobs"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiBookmark size={14} />
                            <span>Saved Jobs</span>
                        </NavLink>

                        <NavLink
                            to="/jobseeker/dashboard"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiGrid size={14} />
                            <span>Dashboard</span>
                        </NavLink>
                    </nav>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-3">
                    {/* NOTIFICATIONS */}
                    <NotificationsDropdown />

                    {/* UNIFIED NAUKRI.COM USER PROFILE BUTTON (AVATAR WITH SCORE RING) */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition focus:outline-none cursor-pointer border border-transparent hover:border-slate-200"
                        >
                            {/* Circular Completeness Ring around User Avatar */}
                            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-200"
                                        strokeWidth="3.2"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={completeness.percentage >= 80 ? "text-emerald-500" : "text-indigo-600"}
                                        strokeDasharray={`${completeness.percentage}, 100`}
                                        strokeWidth="3.2"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="hidden lg:flex flex-col text-left">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-800 leading-tight">
                                        {userName.split(" ")[0]}
                                    </span>
                                    <span className="rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[9px] font-black px-1.5 py-0.2">
                                        {completeness.percentage}%
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold leading-none truncate max-w-[110px] mt-0.5">
                                    {profile?.currentDesignation || "Job Seeker"}
                                </span>
                            </div>
                            <FiChevronDown size={14} className="text-slate-400 ml-0.5" />
                        </button>

                        {/* NAUKRI.COM STYLE RICH DROPDOWN */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white p-3 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2.5">
                                {/* Profile Identity Card */}
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                                            {userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                                            {profile?.currentDesignation && (
                                                <p className="text-[10px] text-indigo-600 font-bold truncate mt-0.5">
                                                    {profile.currentDesignation} {profile.currentCompany ? `@ ${profile.currentCompany}` : ""}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profile Progress Bar */}
                                    <div className="pt-2 border-t border-slate-200/60">
                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                                            <span>Profile Completeness</span>
                                            <span className={completeness.percentage >= 80 ? "text-emerald-600" : "text-indigo-600"}>
                                                {completeness.percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    completeness.percentage >= 80 ? "bg-emerald-500" : "bg-indigo-600"
                                                }`}
                                                style={{ width: `${completeness.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PRIMARY CTA: VIEW & UPDATE PROFILE */}
                                <Link
                                    to="/jobseeker/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 rounded-2xl transition group"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiUser size={15} className="text-indigo-600" />
                                        <span>View & Update Profile</span>
                                    </div>
                                    <FiArrowRight size={14} className="text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                                </Link>

                                {/* QUICK LINKS */}
                                <div className="space-y-0.5 py-1">
                                    <Link
                                        to="/jobseeker/applications"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition"
                                    >
                                        <FiFileText size={14} className="text-slate-400" />
                                        <span>My Applications</span>
                                    </Link>
                                    <Link
                                        to="/jobseeker/saved-jobs"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition"
                                    >
                                        <FiBookmark size={14} className="text-slate-400" />
                                        <span>Saved Jobs</span>
                                    </Link>
                                    <Link
                                        to="/jobseeker/notifications"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition"
                                    >
                                        <FiBell size={14} className="text-slate-400" />
                                        <span>Notifications</span>
                                    </Link>
                                    <Link
                                        to="/jobseeker/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition"
                                    >
                                        <FiSettings size={14} className="text-slate-400" />
                                        <span>Account Settings</span>
                                    </Link>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                                    >
                                        <FiLogOut size={14} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* MOBILE DRAWER */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 animate-in fade-in duration-150">
                    <Link
                        to="/jobseeker/jobs"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiBriefcase size={14} />
                        <span>Jobs</span>
                    </Link>
                    <Link
                        to="/jobseeker/applications"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiFileText size={14} />
                        <span>My Applications</span>
                    </Link>
                    <Link
                        to="/jobseeker/saved-jobs"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiBookmark size={14} />
                        <span>Saved Jobs</span>
                    </Link>
                    <Link
                        to="/jobseeker/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiGrid size={14} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/jobseeker/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50/60 transition"
                    >
                        <div className="flex items-center gap-2">
                            <FiUser size={14} />
                            <span>My Profile</span>
                        </div>
                        <span className="text-[10px] font-black bg-white border border-indigo-200 px-2 py-0.5 rounded-full text-indigo-700">
                            {completeness.percentage}%
                        </span>
                    </Link>
                    <Link
                        to="/jobseeker/settings"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <FiSettings size={14} />
                        <span>Account Settings</span>
                    </Link>
                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                setMobileOpen(false);
                                logout();
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                            <FiLogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default JobSeekerNavbar;
