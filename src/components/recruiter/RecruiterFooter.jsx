import { Link } from "react-router-dom";
import { FiBriefcase, FiUsers, FiCpu, FiShield, FiHelpCircle, FiFileText } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const RecruiterFooter = () => {
    return (
        <footer className="border-t border-slate-200/90 bg-white font-sans text-slate-600 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-600/20">
                                H
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                                    Hire<span className="text-purple-600">Sphere</span>
                                </span>
                                <span className="text-[9px] font-bold text-purple-600 tracking-wider uppercase mt-0.5">
                                    Recruiter Workspace (RMS)
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Enterprise ATS & Talent Intelligence Platform for modern hiring teams, technical recruiters, and talent acquisition leaders.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            AI Engine: Active & Ready
                        </div>
                    </div>

                    {/* Talent & Hiring Navigation */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                            <FiUsers className="text-purple-600" />
                            Talent & ATS Suite
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/recruiter/candidates" className="hover:text-purple-600 transition flex items-center gap-1">
                                    <span>Talent Search (Resdex)</span>
                                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-[9px] font-black text-purple-700">NEW</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/applications" className="hover:text-purple-600 transition">
                                    Applicant Tracking System (ATS)
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/jobs/create" className="hover:text-purple-600 transition">
                                    Post New Tech Opening
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/jobs" className="hover:text-purple-600 transition">
                                    Manage Job Postings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* AI & Automation Suite */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                            <HiSparkles className="text-indigo-600" />
                            Recruitment AI
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/recruiter/jobs/create" className="hover:text-purple-600 transition">
                                    AI Job Description Builder
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/applications" className="hover:text-purple-600 transition">
                                    AI Candidate Fit & Match Scoring
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/candidates" className="hover:text-purple-600 transition">
                                    AI Outreach & Interview Invite
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/settings" className="hover:text-purple-600 transition">
                                    AI Engine & Model Preferences
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Recruiter Resources & Support */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                            <FiBriefcase className="text-purple-600" />
                            Company & Support
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link to="/recruiter/profile" className="hover:text-purple-600 transition">
                                    Employer Branding & Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/settings" className="hover:text-purple-600 transition">
                                    Security & Team Access
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/settings" className="hover:text-purple-600 transition">
                                    Enterprise Settings & Security
                                </Link>
                            </li>
                            <li>
                                <Link to="/recruiter/profile" className="hover:text-purple-600 transition">
                                    Recruiter Priority Support & Team
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} HireSphere Technologies Inc. Recruiter Enterprise Portal.</p>
                    <div className="flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1">
                            <FiShield size={12} className="text-purple-600" /> Enterprise Role-Based Access
                        </span>
                        <span>•</span>
                        <span>SOC2 / GDPR Aligned</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default RecruiterFooter;
