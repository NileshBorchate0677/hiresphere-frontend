import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiUsers,
    FiCheckCircle,
    FiArrowLeft,
    FiLogIn,
    FiUserPlus,
    FiClock,
    FiShare2
} from "react-icons/fi";
import { getJobById, getAllJobs } from "../../services/jobService";
import { getJobFreshness, formatSalaryLPA, formatDate } from "../../utils/helpers";

const PublicJobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getJobById(jobId);
                setJob(data);

                // Fetch other jobs for related suggestions
                const all = await getAllJobs();
                const list = Array.isArray(all) ? all : all?.data || [];
                const related = list
                    .filter((j) => (j.id != jobId && j.jobId != jobId))
                    .slice(0, 3);
                setRelatedJobs(related);
            } catch (err) {
                console.error("Job details load error:", err);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchDetails();
        }
    }, [jobId]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs font-semibold text-slate-400">
                Loading job specifications...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <FiBriefcase size={22} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Job Opening Not Found</h2>
                <p className="text-xs text-slate-500">
                    This job may have been closed, deleted, or the link might be expired.
                </p>
                <Link
                    to="/jobs"
                    className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                    Back to All Jobs
                </Link>
            </div>
        );
    }

    const companyName = job.companyName || "Hiring Organization";

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 font-sans">
            {/* BACK BUTTON */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                    <FiArrowLeft size={14} />
                    Back to Listings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: JOB DETAILS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    {(() => {
                        const freshnessInfo = getJobFreshness(job.createdAt);
                        return (
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0">
                                            {companyName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                                    {job.title}
                                                </h1>
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${freshnessInfo.badgeClass}`}>
                                                    {freshnessInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-indigo-600">{companyName}</p>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-500 pt-2">
                                                <span className="flex items-center gap-1">
                                                    <FiMapPin size={13} className="text-slate-400" />
                                                    {job.location || "Remote"}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 font-bold text-slate-700">
                                                    <FiDollarSign size={13} className="text-indigo-600" />
                                                    {formatSalaryLPA(job.minSalary, job.maxSalary)}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <FiBriefcase size={13} className="text-slate-400" />
                                                    {job.experienceRequired != null ? `${job.experienceRequired}+ Yrs Exp` : "Fresher"}
                                                </span>
                                                {job.createdAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 text-slate-400">
                                                            <FiClock size={12} />
                                                            Posted {freshnessInfo.timeAgo}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition"
                                    >
                                        <FiShare2 size={13} />
                                        {copied ? "Copied Link!" : "Share"}
                                    </button>
                                </div>

                                {/* BADGES ROW */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                    {job.jobType && (
                                        <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 text-[11px] font-bold uppercase">
                                            {job.jobType.replace("_", " ")}
                                        </span>
                                    )}
                                    {job.workplaceType && (
                                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-[11px] font-bold uppercase">
                                            {job.workplaceType.replace("_", " ")}
                                        </span>
                                    )}
                                    {job.vacancies && (
                                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 text-[11px] font-bold">
                                            {job.vacancies} Open {job.vacancies === 1 ? "Vacancy" : "Vacancies"}
                                        </span>
                                    )}
                                    {job.applicationDeadline && (
                                        <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1 text-[11px] font-bold flex items-center gap-1">
                                            <FiClock size={12} />
                                            Deadline: {job.applicationDeadline}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Requirements / Skills Card */}
                    {job.requiredSkills && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-3">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                Required Skills & Qualifications
                            </h2>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {job.requiredSkills.split(",").map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="rounded-xl bg-slate-100 border border-slate-200/60 px-3 py-1.5 text-xs font-bold text-slate-700"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full Description Card */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Job Description & Scope
                        </h2>
                        <div className="text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                            {job.description || "No specific detailed description provided for this opening."}
                        </div>
                    </div>
                </div>

                {/* RIGHT: CALL TO ACTION BOX & RELATED JOBS */}
                <div className="space-y-6">
                    {/* GUEST APPLY CARD */}
                    <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-7 shadow-lg space-y-5">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                                Candidate Application
                            </span>
                            <h3 className="text-base font-black text-slate-900">
                                Ready to apply for this role?
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Sign in with your Job Seeker account to attach your cover letter and submit your resume directly to {companyName}.
                            </p>
                        </div>

                        <div className="space-y-2.5 pt-2">
                            <Link
                                to="/login"
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01]"
                            >
                                <FiLogIn size={14} />
                                Sign In to Apply
                            </Link>

                            <Link
                                to="/register"
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition"
                            >
                                <FiUserPlus size={14} />
                                Create Candidate Account
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-indigo-100/60 space-y-2 text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle size={14} className="text-emerald-500 shrink-0" />
                                <span>Direct ATS pipeline integration</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCheckCircle size={14} className="text-emerald-500 shrink-0" />
                                <span>Instant notification on shortlist & interview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCheckCircle size={14} className="text-emerald-500 shrink-0" />
                                <span>100% Free for job seekers</span>
                            </div>
                        </div>
                    </div>

                    {/* RELATED JOBS */}
                    {relatedJobs.length > 0 && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Similar Openings
                            </h3>
                            <div className="space-y-3">
                                {relatedJobs.map((rJob) => {
                                    const rId = rJob.jobId || rJob.id;
                                    const rFreshness = getJobFreshness(rJob.createdAt);
                                    return (
                                        <Link
                                            key={rId}
                                            to={`/jobs/${rId}`}
                                            className="block p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-slate-900 line-clamp-1">{rJob.title}</p>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 ${rFreshness.badgeClass}`}>
                                                    {rFreshness.label}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-slate-500">{rJob.companyName}</p>
                                            <p className="text-[11px] text-indigo-600 font-bold">
                                                {formatSalaryLPA(rJob.minSalary, rJob.maxSalary)}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicJobDetails;
