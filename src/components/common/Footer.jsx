import { Link } from "react-router-dom";
import { FiBriefcase, FiMail, FiMapPin, FiHeart } from "react-icons/fi";

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white font-sans text-slate-600">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-sm shadow-indigo-600/20">
                                H
                            </div>
                            <span className="text-lg font-black text-slate-900 tracking-tight">
                                Hire<span className="text-indigo-600">Sphere</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Connecting high-caliber tech professionals with top hiring engineering teams.
                        </p>
                    </div>

                    {/* For Job Seekers */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                            Job Seekers
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/jobs/search" className="hover:text-indigo-600 transition">
                                    Browse All Openings
                                </Link>
                            </li>
                            <li>
                                <Link to="/jobs/search?workplace=REMOTE" className="hover:text-indigo-600 transition">
                                    Remote Engineering Jobs
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-indigo-600 transition">
                                    Candidate Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Employers */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                            Employers
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/register" className="hover:text-indigo-600 transition">
                                    Post a Job Opening
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-indigo-600 transition">
                                    Recruiter Workspace Sign In
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-indigo-600 transition">
                                    HireSphere Talent Suite
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Platform & About */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                            Company
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/about" className="hover:text-indigo-600 transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-indigo-600 transition">
                                    Help & Support
                                </Link>
                            </li>
                            <li>
                                <span className="text-slate-400">Privacy & Terms</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} HireSphere Technologies Inc. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Built with modern React & Spring Boot
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
