import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiBriefcase,
    FiUsers,
    FiPlus,
    FiEye,
    FiCheckCircle,
    FiArrowRight,
    FiMapPin,
    FiActivity,
    FiClock
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { getMyJobs } from "../../services/jobService";
import { getRecruiterProfile } from "../../services/recruiterService";
import useAuth from "../../hooks/useAuth";

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [jobsData, profileData] = await Promise.all([
                    getMyJobs().catch(() => []),
                    getRecruiterProfile().catch(() => null),
                ]);
                setJobs(Array.isArray(jobsData) ? jobsData : []);
                setProfile(profileData);
            } catch (err) {
                console.error("Recruiter dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(
        (j) => String(j.status || "").toUpperCase() === "OPEN" || String(j.status || "").toUpperCase() === "ACTIVE"
    );
    const closedJobs = jobs.filter((j) => String(j.status || "").toUpperCase() === "CLOSED");

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            {/* HERO BANNER */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
                <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
                            {profile?.companyName || "Organization Workspace"}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome, {user?.fullName || user?.name || "Hiring Partner"}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                            Manage active talent openings, search pre-screened candidates on Resdex, and track incoming engineering applications.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/recruiter/jobs/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
                        >
                            <FiPlus size={16} />
                            Post New Opening
                        </Link>
                        <Link
                            to="/recruiter/candidates"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all backdrop-blur-md"
                        >
                            <HiSparkles size={16} className="text-purple-400" />
                            Talent Search (Resdex)
                        </Link>
                        <Link
                            to="/recruiter/applications"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all backdrop-blur-md"
                        >
                            <FiUsers size={16} />
                            Review Applicants
                        </Link>
                    </div>
                </div>
            </div>

                {/* 4 KPI METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Postings</span>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                <FiBriefcase size={18} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-black text-slate-900">{totalJobs}</span>
                            <span className="ml-2 text-xs font-semibold text-slate-400">job listings</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Openings</span>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                <FiActivity size={18} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-black text-emerald-600">{activeJobs.length}</span>
                            <span className="ml-2 text-xs font-semibold text-slate-400">accepting resumes</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed Roles</span>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                                <FiClock size={18} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-black text-slate-700">{closedJobs.length}</span>
                            <span className="ml-2 text-xs font-semibold text-slate-400">positions filled</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Profile</span>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                <FiCheckCircle size={18} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-base font-bold text-slate-800 truncate block">
                                {profile?.companyName ? "Verified Organization" : "Setup Required"}
                            </span>
                            <Link to="/recruiter/profile" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1 inline-block">
                                {profile?.companyName ? "Manage Profile →" : "Set Up Now →"}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* RECENT POSTINGS */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Your Recent Job Openings</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Live engineering vacancies published by your team</p>
                        </div>
                        <Link
                            to="/recruiter/jobs"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            View All Postings ({totalJobs})
                            <FiArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-xs font-semibold text-slate-400">
                            Loading your job openings...
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                <FiBriefcase size={22} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">No Job Openings Yet</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Publish your first tech opening to begin attracting qualified developers and software engineers.
                            </p>
                            <Link
                                to="/recruiter/jobs/create"
                                className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs mt-2"
                            >
                                Post Your First Job
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {jobs.slice(0, 5).map((job) => {
                                const jobId = job.jobId || job.id;
                                const isOpen = String(job.status || "").toUpperCase() === "OPEN";

                                return (
                                    <div
                                        key={jobId}
                                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 -mx-6 px-6 rounded-2xl transition"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    <Link
                                                        to={`/recruiter/jobs/${jobId}`}
                                                        className="hover:text-purple-600 transition"
                                                    >
                                                        {job.title}
                                                    </Link>
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        isOpen
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                                    }`}
                                                >
                                                    {job.status || "OPEN"}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <FiMapPin size={12} className="text-slate-400" />
                                                    {job.location || "Remote"}
                                                </span>
                                                <span>•</span>
                                                <span>{job.jobType ? job.jobType.replace("_", " ") : "Full Time"}</span>
                                                <span>•</span>
                                                <span>{job.experienceRequired != null ? `${job.experienceRequired}+ Yrs Exp` : "Any Exp"}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                to="/recruiter/applications"
                                                state={{ job }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition"
                                            >
                                                <FiUsers size={13} />
                                                Candidates
                                            </Link>
                                            <Link
                                                to={`/recruiter/jobs/${jobId}`}
                                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition"
                                                title="Manage opening and view pipeline"
                                            >
                                                <FiEye size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
    );
};

export default RecruiterDashboard;
