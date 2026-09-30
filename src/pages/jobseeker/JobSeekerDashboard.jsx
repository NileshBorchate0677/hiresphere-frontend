import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiFileText,
    FiBookmark,
    FiCheckCircle,
    FiSearch,
    FiArrowRight,
    FiClock,
    FiAlertCircle,
    FiUser,
    FiMapPin,
    FiBriefcase,
    FiTrendingUp,
    FiStar,
    FiAward,
    FiChevronRight,
    FiCheck
} from "react-icons/fi";
import { getMyApplications } from "../../services/applicationService";
import { getMySavedJobs } from "../../services/savedJobService";
import {
    getJobSeekerProfile,
    getJobSeekerEducation,
    getJobSeekerExperiences
} from "../../services/jobSeekerService";
import { searchJobsPaged } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";
import { formatSalaryLPA, getJobFreshness } from "../../utils/helpers";
import { calculateProfileCompleteness } from "../../utils/aiHelper";

const JobSeekerDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [appsData, savedData, profileData, jobsData, eduData, expData] = await Promise.all([
                    getMyApplications().catch(() => []),
                    getMySavedJobs().catch(() => []),
                    getJobSeekerProfile().catch(() => null),
                    searchJobsPaged({ page: 0, size: 4, sortBy: "createdAt", sortDir: "desc" }).catch(() => ({ content: [] })),
                    getJobSeekerEducation().catch(() => []),
                    getJobSeekerExperiences().catch(() => [])
                ]);

                setApplications(Array.isArray(appsData) ? appsData : []);
                setSavedJobs(Array.isArray(savedData) ? savedData : []);
                const edus = Array.isArray(eduData) ? eduData : [];
                const exps = Array.isArray(expData) ? expData : [];
                if (profileData) {
                    setProfile({
                        ...profileData,
                        educationCount: edus.length,
                        employmentCount: exps.length
                    });
                } else {
                    setProfile(null);
                }

                // Smart Recommended Jobs (top 4 open jobs fetched with SQL limit)
                const jobsList = Array.isArray(jobsData?.content) ? jobsData.content : (Array.isArray(jobsData) ? jobsData : []);
                setRecommendedJobs(jobsList.slice(0, 4));
            } catch (err) {
                console.error("Job seeker dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };


        fetchDashboardData();
    }, []);

    // Metric Calculations
    const totalApplied = applications.length;
    const shortlistedCount = applications.filter(
        (a) => String(a.status || "").toUpperCase() === "SHORTLISTED"
    ).length;
    const acceptedCount = applications.filter(
        (a) => String(a.status || "").toUpperCase() === "ACCEPTED"
    ).length;
    const savedCount = savedJobs.length;

    // Unified Profile Completeness calculation
    const profileCompleteness = useMemo(() => {
        return calculateProfileCompleteness(profile || { fullName: user?.fullName || user?.name });
    }, [user, profile]);

    const hasResume = Boolean(profile?.resumeUrl || profile?.resumePath);

    return (
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-in fade-in duration-300">
            {/* 1. WELCOME HERO BANNER */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 sm:p-9 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
                <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-400/30 inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Candidate Career Hub
                            </span>
                            {profile?.headline && (
                                <span className="hidden sm:inline-block text-xs text-indigo-200/80 font-medium truncate max-w-xs">
                                    • {profile.headline}
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome back, {user?.fullName || user?.name || "Candidate"}!
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                            Stay on top of your live job applications, discover relevant engineering roles, and keep your career profile recruiter-ready.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            to="/jobseeker/jobs"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                        >
                            <FiSearch size={14} />
                            Explore 100+ Jobs
                        </Link>
                        <Link
                            to="/jobseeker/profile"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all backdrop-blur-md"
                        >
                            <FiUser size={14} />
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. PROFILE COMPLETION METER */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-sm font-bold text-slate-900">Profile Completeness</h3>
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                {profileCompleteness.score}% Complete
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            A complete profile gets up to <span className="font-semibold text-slate-700">3x more interview invites</span> from top tech recruiters.
                        </p>
                    </div>

                    <Link
                        to="/jobseeker/profile"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 shrink-0"
                    >
                        Complete Profile
                        <FiChevronRight size={14} />
                    </Link>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${profileCompleteness.score}%` }}
                    />
                </div>

                {/* Missing items pills */}
                {profileCompleteness.missing && profileCompleteness.missing.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400">Boost your score:</span>
                        {profileCompleteness.missing.slice(0, 3).map((item) => {
                            const label = typeof item === "string" ? item : item.label;
                            const boost = typeof item === "object" && item.boost ? ` (${item.boost})` : "";
                            return (
                                <Link
                                    key={label}
                                    to="/jobseeker/profile"
                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2.5 py-1 text-[11px] font-semibold text-amber-800 transition"
                                >
                                    + Add {label}{boost}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 3. 4 KEY METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Applied */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Applications Sent
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <FiFileText size={18} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-black text-slate-900">{totalApplied}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-400">submitted</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Active candidacies in review</p>
                </div>

                {/* Shortlisted */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-purple-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Shortlisted
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <FiStar size={18} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-black text-purple-600">{shortlistedCount}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-400">interviews</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Advancing through rounds</p>
                </div>

                {/* Offers / Accepted */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Offers / Accepted
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <FiAward size={18} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-black text-emerald-600">{acceptedCount}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-400">hired</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Positive selection outcomes</p>
                </div>

                {/* Bookmarked / Saved */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-blue-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Saved Roles
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <FiBookmark size={18} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-black text-slate-900">{savedCount}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-400">saved</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Saved for later application</p>
                </div>
            </div>

            {/* 4. MAIN SPLIT: RECENT APPLICATIONS & RECOMMENDED JOBS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Recent Applications Tracker */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">Application Pipeline</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time status updates from hiring teams</p>
                        </div>
                        <Link
                            to="/jobseeker/applications"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            View All ({totalApplied})
                            <FiArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-xs font-semibold text-slate-400">
                            Loading your applications...
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="py-14 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                <FiFileText size={22} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800">No Applications Submitted</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Explore live engineering positions and submit your application to track progress here.
                            </p>
                            <Link
                                to="/jobseeker/jobs"
                                className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs mt-2"
                            >
                                Browse 100+ Openings
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {applications.slice(0, 5).map((app) => {
                                const appId = app.applicationId || app.id;
                                const status = String(app.status || "APPLIED").toUpperCase();
                                const jobTitle = app.jobTitle || app.job?.title || "Software Engineer";
                                const companyName = app.companyName || app.job?.companyName || "Tech Enterprise";

                                return (
                                    <div
                                        key={appId}
                                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 -mx-6 px-6 rounded-2xl transition"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="text-sm font-bold text-slate-900">{jobTitle}</h3>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        status === "ACCEPTED"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : status === "SHORTLISTED"
                                                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                            : status === "REJECTED"
                                                            ? "bg-red-50 text-red-700 border border-red-200"
                                                            : status === "WITHDRAWN"
                                                            ? "bg-slate-100 text-slate-500 border border-slate-200"
                                                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">{companyName}</p>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            {app.appliedAt && (
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    <FiClock size={12} />
                                                    {new Date(app.appliedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            <Link
                                                to="/jobseeker/applications"
                                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 font-bold text-slate-700 transition text-[11px]"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right 1 Col: Top Recommended Roles */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FiTrendingUp size={14} />
                            </div>
                            <h2 className="text-sm font-bold text-slate-900">Recommended Roles</h2>
                        </div>
                        <Link
                            to="/jobseeker/jobs"
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                        >
                            More
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recommendedJobs.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">
                                Loading recommendations...
                            </p>
                        ) : (
                            recommendedJobs.map((job) => {
                                const jobId = job.id || job.jobId;
                                const title = job.title || "Software Engineer";
                                const company = job.companyName || "Tech Corp";
                                const salaryText = formatSalaryLPA(job.minSalary, job.maxSalary);
                                const freshness = getJobFreshness(job.createdAt);

                                return (
                                    <div
                                        key={jobId}
                                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition space-y-2 group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[180px]">
                                                    {title}
                                                </h4>
                                                <p className="text-[11px] font-medium text-slate-500 truncate">
                                                    {company}
                                                </p>
                                            </div>
                                            {freshness?.isRecent && (
                                                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 text-[9px] font-bold shrink-0">
                                                    {freshness.label}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                            <span className="font-semibold text-slate-700">{salaryText}</span>
                                            <Link
                                                to={`/jobseeker/jobs/${jobId}`}
                                                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                Apply <FiArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <Link
                        to="/jobseeker/jobs"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition shadow-xs"
                    >
                        Browse All Open Roles
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JobSeekerDashboard;
