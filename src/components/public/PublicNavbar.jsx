import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiBriefcase, FiCompass, FiInfo, FiMail, FiLogIn, FiUserPlus } from "react-icons/fi";

const PublicNavbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 font-sans shadow-xs">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* BRAND LOGO */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            H
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Hire<span className="text-indigo-600">Sphere</span>
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                                Career Ecosystem
                            </span>
                        </div>
                    </Link>

                    {/* DESKTOP PUBLIC NAVIGATION */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink
                            to="/jobs"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiCompass size={14} />
                            Explore Jobs
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiInfo size={14} />
                            About Us
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                }`
                            }
                        >
                            <FiMail size={14} />
                            Contact
                        </NavLink>
                    </nav>
                </div>

                {/* RIGHT ACTION BUTTONS */}
                <div className="hidden sm:flex items-center gap-3">
                    <Link
                        to="/register"
                        className="text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 transition flex items-center gap-1.5"
                    >
                        <FiBriefcase size={14} className="text-purple-600" />
                        For Employers
                    </Link>

                    <Link
                        to="/login"
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-xs"
                    >
                        <FiLogIn size={13} />
                        Log In
                    </Link>

                    <Link
                        to="/register"
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center gap-1.5"
                    >
                        <FiUserPlus size={13} />
                        Register
                    </Link>
                </div>

                {/* MOBILE TOGGLE */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
            </div>

            {/* MOBILE DRAWER */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in fade-in duration-150">
                    <Link
                        to="/jobs"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Explore Jobs
                    </Link>
                    <Link
                        to="/about"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        About Us
                    </Link>
                    <Link
                        to="/contact"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Contact & Support
                    </Link>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <Link
                            to="/login"
                            onClick={() => setMobileOpen(false)}
                            className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setMobileOpen(false)}
                            className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs transition"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicNavbar;
