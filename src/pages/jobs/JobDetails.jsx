import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiUsers,
    FiCheck,
    FiBookmark,
    FiShare2,
    FiArrowLeft,
    FiAlertCircle,
    FiCheckCircle,
    FiX,
    FiEdit2
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { getJobById } from "../../services/jobService";
import { applyForJob, getMyApplications } from "../../services/applicationService";
import { saveJob, removeSavedJob, isJobSaved } from "../../services/savedJobService";
import { useAuth } from "../../context/AuthContext";

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, userRole } = useAuth();

    const isRecruiter = isAuthenticated && userRole === "RECRUITER";
    const isJobSeeker = isAuthenticated && userRole === "JOB_SEEKER";

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Application state
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState("");

    // AI Cover letter generation
    const [aiGenerating, setAiGenerating] = useState(false);

    useEffect(() => {
        const fetchJobData = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getJobById(jobId);
                setJob(data);

                // If user is job seeker, check saved status & already applied status
                if (isAuthenticated && isJobSeeker) {
                    try {
                        const [savedStatus, myApps] = await Promise.all([
                            isJobSaved(jobId).catch(() => false),
                            getMyApplications().catch(() => [])
                        ]);

                        setSaved(Boolean(savedStatus));

                        const appsList = Array.isArray(myApps) ? myApps : [];
                        const hasApplied = appsList.some(
                            (a) => String(a.jobId) === String(jobId) || String(a.job?.id) === String(jobId)
                        );
                        setAlreadyApplied(hasApplied);
                    } catch {
                        // ignore secondary error
                    }
                }
            } catch (err) {
                console.error("Job details load error:", err);
                setError("Unable to find this job opening. It may have been closed or removed.");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobData();
        }
    }, [jobId, isAuthenticated, isJobSeeker]);

    // Handle Bookmark toggle
    const handleToggleBookmark = async () => {
        if (!isAuthenticated || !isJobSeeker) {
            navigate("/login");
            return;
        }

        try {
            if (saved) {
                await removeSavedJob(jobId);
                setSaved(false);
            } else {
                await saveJob(jobId);
                setSaved(true);
            }
        } catch (err) {
            console.error("Save job error:", err);
        }
    };

    // AI Cover Letter Assistant
    const handleAIAssistCoverLetter = () => {
        setAiGenerating(true);
        setTimeout(() => {
            const candidateName = user?.fullName || user?.name || "Candidate";
            const roleTitle = job?.title || "this position";
            const companyName = job?.companyName || "your company";
            const skills = job?.requiredSkills || "modern software engineering";

            const draft = `Dear Hiring Manager at ${companyName},

I am writing to express my strong enthusiasm for the ${roleTitle} opening. With hands-on technical expertise in ${skills}, I have delivered scalable, reliable, and high-performance solutions in fast-paced software environments.

My background aligns well with the qualifications outlined in your vacancy. I take pride in writing clean, well-tested code and collaborating cross-functionally to achieve engineering objectives.

Thank you for reviewing my application. I look forward to the possibility of discussing how my skills and experience can contribute to the success of ${companyName}.

Best regards,
${candidateName}`;

            setCoverLetter(draft);
            setAiGenerating(false);
        }, 600);
    };

    // Submit Application
    const handleApply = async () => {
        setApplying(true);
        setApplyError("");

        try {
            await applyForJob(jobId, coverLetter);
            setApplySuccess(true);
            setAlreadyApplied(true);
            setTimeout(() => {
                setApplyModalOpen(false);
                setApplySuccess(false);
            }, 1800);
        } catch (err) {
            console.error("Application submission error:", err);
            setApplyError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to submit application. Please verify your profile is up to date."
            );
        } finally {
            setApplying(false);
        }
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return "Undisclosed";
        const minLPA = min ? (min / 100000).toFixed(1) : null;
        const maxLPA = max ? (max / 100000).toFixed(1) : null;
        if (minLPA && maxLPA) return `₹${minLPA} - ₹${maxLPA} LPA`;
        if (minLPA) return `From ₹${minLPA} LPA`;
        return `Up to ₹${maxLPA} LPA`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Link
                    to="/jobs/search"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
                >
                    <FiArrowLeft size={14} />
                    Back to All Openings
                </Link>

                {loading ? (
                    <div className="py-24 text-center text-xs font-semibold text-slate-400">
                        Loading job specifications...
                    </div>
                ) : error || !job ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                        <FiAlertCircle size={28} className="mx-auto text-amber-500" />
                        <h2 className="text-base font-bold text-slate-800">Job Opening Not Found</h2>
                        <p className="text-xs text-slate-500">{error || "This vacancy is no longer available."}</p>
                        <Link
                            to="/jobs/search"
                            className="inline-block mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
                        >
                            Browse Other Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* EMPLOYER VIEW BANNER IF RECRUITER */}
                        {isRecruiter && (
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                                    <FiCheckCircle className="text-indigo-600" />
                                    <span>Employer Preview: You are viewing this job as an employer.</span>
                                </div>
                                <Link
                                    to={`/recruiter/jobs/edit/${jobId}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 font-bold text-white shadow-xs"
                                >
                                    <FiEdit2 size={13} />
                                    Edit This Job
                                </Link>
                            </div>
                        )}

                        {/* JOB HEADER CARD */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                                    {(job.companyName || "H").charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                            {job.title}
                                        </h1>
                                        {job.workplaceType && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                                                {job.workplaceType.replace("_", " ")}
                                            </span>
                                        )}
                                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                                            {job.status || "OPEN"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        {job.companyName || "HireSphere Hiring Partner"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                                        <span className="flex items-center gap-1.5">
                                            <FiMapPin size={13} className="text-slate-400" />
                                            {job.location || "Remote"}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <FiBriefcase size={13} className="text-slate-400" />
                                            {job.jobType ? job.jobType.replace("_", " ") : "Full Time"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* APPLY & BOOKMARK BUTTON GROUP */}
                            <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                {!isRecruiter && (
                                    <button
                                        type="button"
                                        onClick={handleToggleBookmark}
                                        className={`p-3 rounded-2xl border transition ${
                                            saved
                                                ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-xs"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                        title={saved ? "Saved" : "Save Job"}
                                    >
                                        <FiBookmark size={18} className={saved ? "fill-indigo-600" : ""} />
                                    </button>
                                )}

                                {!isAuthenticated ? (
                                    <Link
                                        to="/login"
                                        className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                                    >
                                        Sign in to Apply
                                    </Link>
                                ) : isJobSeeker ? (
                                    alreadyApplied ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-2xl bg-slate-100 px-6 py-3 text-xs font-bold text-slate-400 cursor-not-allowed flex items-center gap-2 border border-slate-200"
                                        >
                                            <FiCheck size={16} />
                                            Already Applied
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setApplyModalOpen(true)}
                                            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                                        >
                                            Apply for this Role
                                        </button>
                                    )
                                ) : null}
                            </div>
                        </div>

                        {/* KEY SPECS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                                    Annual CTC (Salary)
                                </span>
                                <p className="text-base font-black text-slate-900 mt-1">
                                    {formatSalary(job.minSalary, job.maxSalary)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                                    Experience Required
                                </span>
                                <p className="text-base font-black text-slate-900 mt-1">
                                    {job.experienceRequired != null ? `${job.experienceRequired}+ Years` : "Fresher"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                                    Open Vacancies
                                </span>
                                <p className="text-base font-black text-slate-900 mt-1">
                                    {job.vacancies || 1} {job.vacancies === 1 ? "Opening" : "Openings"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                                    Application Deadline
                                </span>
                                <p className="text-base font-black text-indigo-600 mt-1">
                                    {job.applicationDeadline
                                        ? String(job.applicationDeadline).split("T")[0]
                                        : "Ongoing"}
                                </p>
                            </div>
                        </div>

                        {/* SKILLS REQUIRED */}
                        {job.requiredSkills && (
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Key Technologies & Required Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.requiredSkills.split(",").map((s, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-xl bg-indigo-50/60 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700"
                                        >
                                            {s.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DETAILED DESCRIPTION */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-4">
                            <h2 className="text-lg font-bold text-slate-900">About the Role & Responsibilities</h2>
                            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                                {job.description}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* APPLY MODAL WITH AI COVER LETTER ASSISTANT */}
            {applyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Apply for {job?.title}</h3>
                                <p className="text-xs text-slate-500">{job?.companyName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApplyModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {applySuccess ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                    <FiCheck size={24} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Application Submitted!</h4>
                                <p className="text-xs text-slate-500">
                                    Your profile and resume have been sent directly to the employer.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                {applyError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold flex items-center gap-2">
                                        <FiAlertCircle size={15} />
                                        <span>{applyError}</span>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="font-bold text-slate-700">Cover Note (Optional)</label>
                                        <button
                                            type="button"
                                            onClick={handleAIAssistCoverLetter}
                                            disabled={aiGenerating}
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                                        >
                                            <HiSparkles />
                                            {aiGenerating ? "Drafting..." : "Auto-Draft with AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        rows={6}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Add a personalized message highlighting your key relevant projects and why you're a great fit for this team..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                                    />
                                </div>

                                <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3.5 text-[11px] text-slate-600 space-y-1">
                                    <p className="font-bold text-indigo-900">Resume Attached</p>
                                    <p>Your uploaded profile resume and contact details will be shared with the recruiter.</p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setApplyModalOpen(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                                    >
                                        {applying ? "Sending Application..." : "Submit Application"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default JobDetails;
