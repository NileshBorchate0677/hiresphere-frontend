import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiBookmark,
    FiArrowLeft,
    FiSend,
    FiAlertCircle,
    FiShare2,
    FiFileText,
    FiCheck,
    FiTrendingUp,
    FiZap,
    FiUploadCloud,
    FiDownload,
    FiStar,
    FiPlus
} from "react-icons/fi";
import { getJobById, getAllJobs } from "../../services/jobService";
import { getMyApplications, applyForJob } from "../../services/applicationService";
import { isJobSaved, saveJob, removeSavedJob } from "../../services/savedJobService";
import { getJobSeekerProfile, uploadResume, updateJobSeekerProfile } from "../../services/jobSeekerService";
import { getJobFreshness, formatSalaryLPA, parseSafeDate } from "../../utils/helpers";
import { calculateJobMatch, generateAICoverLetter } from "../../utils/aiHelper";
import { API_BASE_URL } from "../../utils/constants";


const JobSeekerJobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [existingApplication, setExistingApplication] = useState(null);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Application submission
    const [coverLetter, setCoverLetter] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");
    const [copied, setCopied] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setSubmitError("Please upload a PDF file only.");
            return;
        }
        setUploadingResume(true);
        setSubmitError("");
        try {
            const res = await uploadResume(file);
            const fresh = await getJobSeekerProfile().catch(() => null);
            setProfile(fresh || {
                ...profile,
                resumeUrl: res.resumeUrl || res.resumePath,
                resumePath: res.resumeUrl || res.resumePath,
                resumeFileName: file.name
            });
        } catch (err) {
            setSubmitError("Failed to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleGenerateAiPitch = () => {
        setAiGenerating(true);
        setTimeout(() => {
            const pitch = generateAICoverLetter(job, profile);
            setCoverLetter(pitch);
            setAiGenerating(false);
        }, 350);
    };

    const getFullResumeUrl = () => {
        const path = profile?.resumeUrl || profile?.resumePath;
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
    };

    // NAUKRI AI MATCH SCORE & SKILL GAP ANALYSIS
    const matchResult = useMemo(() => {
        return calculateJobMatch(job, profile);
    }, [job, profile]);

    const [addingSkill, setAddingSkill] = useState(false);
    const [skillAddedMsg, setSkillAddedMsg] = useState("");

    const handleAddSkillToProfile = async (newSkill) => {
        if (!profile) return;
        setAddingSkill(true);
        try {
            const currentSkills = profile.skills
                ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            if (!currentSkills.some((s) => s.toLowerCase() === newSkill.toLowerCase())) {
                const updatedSkills = [...currentSkills, newSkill].join(", ");
                await updateJobSeekerProfile({
                    ...profile,
                    skills: updatedSkills
                });
                setProfile((prev) => ({ ...prev, skills: updatedSkills }));
                setSkillAddedMsg(`✨ Added "${newSkill}" to your profile! Match score updated.`);
                setTimeout(() => setSkillAddedMsg(""), 4000);
            }
        } catch (err) {
            console.error("Failed to add skill:", err);
        } finally {
            setAddingSkill(false);
        }
    };

    useEffect(() => {

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [jobData, appsData, savedState, profileData, allJobsData] = await Promise.all([
                    getJobById(jobId),
                    getMyApplications().catch(() => []),
                    isJobSaved(jobId).catch(() => false),
                    getJobSeekerProfile().catch(() => null),
                    getAllJobs().catch(() => [])
                ]);

                setJob(jobData);
                setSaved(savedState);
                setProfile(profileData);

                // Check if candidate already applied
                const appsList = Array.isArray(appsData) ? appsData : [];
                const matchedApp = appsList.find(
                    (a) => a.job?.id == jobId || a.jobId == jobId
                );
                setExistingApplication(matchedApp || null);

                // Related jobs
                const allList = Array.isArray(allJobsData) ? allJobsData : allJobsData?.data || [];
                const related = allList
                    .filter((j) => (j.id != jobId && j.jobId != jobId))
                    .slice(0, 3);
                setRelatedJobs(related);
            } catch (err) {
                console.error("Job Seeker job details error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchDetails();
        }
    }, [jobId]);

    const handleToggleBookmark = async () => {
        try {
            if (saved) {
                await removeSavedJob(jobId);
                setSaved(false);
            } else {
                await saveJob(jobId);
                setSaved(true);
            }
        } catch (err) {
            console.error("Toggle bookmark error:", err);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError("");
        setSubmitSuccess("");

        try {
            const res = await applyForJob(jobId, { coverLetter: coverLetter.trim() });
            setSubmitSuccess("Application submitted successfully! The hiring team has been notified.");
            setExistingApplication(res || { jobId, status: "APPLIED", appliedAt: new Date().toISOString() });
        } catch (err) {
            console.error("Apply error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to submit application. Make sure your candidate profile is filled out.";
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs font-semibold text-slate-400">
                Loading role specifications and application status...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                    <FiBriefcase size={22} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Job Opening Not Available</h2>
                <p className="text-xs text-slate-500">
                    This vacancy may have been filled or closed by the employer.
                </p>
                <Link
                    to="/jobseeker/jobs"
                    className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs"
                >
                    Back to Job Search
                </Link>
            </div>
        );
    }

    const companyName = job.companyName || "Hiring Organization";
    const freshnessInfo = getJobFreshness(job.createdAt);
    const hasResume = Boolean(profile?.resumeUrl || profile?.resumePath);
    const appStatus = existingApplication ? String(existingApplication.status || "APPLIED").toUpperCase() : null;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
            {/* BACK BUTTON */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                >
                    <FiArrowLeft size={14} />
                    Back to Listings
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleToggleBookmark}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                            saved
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                        <FiBookmark size={13} className={saved ? "fill-indigo-700" : ""} />
                        <span>{saved ? "Saved" : "Save Job"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition"
                    >
                        <FiShare2 size={13} />
                        {copied ? "Copied Link!" : "Share"}
                    </button>
                </div>
            </div>

            {/* APPLICATION STATUS BANNER IF ALREADY APPLIED */}
            {existingApplication && (
                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-slate-50 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                                <FiCheck size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    You have already applied for this opening!
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Submitted candidacy on{" "}
                                    {existingApplication.appliedAt
                                        ? new Date(existingApplication.appliedAt).toLocaleDateString()
                                        : "Recently"}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`self-start sm:self-auto rounded-full border px-3 py-1 text-xs font-black uppercase ${
                                appStatus === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : appStatus === "SHORTLISTED"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : appStatus === "REJECTED"
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                        >
                            Status: {appStatus}
                        </span>
                    </div>

                    {/* ATS PIPELINE STEPPER */}
                    <div className="pt-2 border-t border-indigo-100/60 grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                        <div className="p-2 rounded-xl bg-white border border-indigo-200 text-indigo-700">
                            1. Applied ✓
                        </div>
                        <div
                            className={`p-2 rounded-xl border ${
                                appStatus === "SHORTLISTED" || appStatus === "ACCEPTED"
                                    ? "bg-white border-indigo-200 text-indigo-700"
                                    : "bg-slate-100/60 border-slate-200 text-slate-400"
                            }`}
                        >
                            2. Under Review
                        </div>
                        <div
                            className={`p-2 rounded-xl border ${
                                appStatus === "SHORTLISTED" || appStatus === "ACCEPTED"
                                    ? "bg-white border-purple-200 text-purple-700"
                                    : "bg-slate-100/60 border-slate-200 text-slate-400"
                            }`}
                        >
                            3. Shortlisted
                        </div>
                        <div
                            className={`p-2 rounded-xl border ${
                                appStatus === "ACCEPTED"
                                    ? "bg-white border-emerald-200 text-emerald-700"
                                    : "bg-slate-100/60 border-slate-200 text-slate-400"
                            }`}
                        >
                            4. Final Offer
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: JOB DETAILS (2 COLS) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0">
                                {companyName.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                        {job.title}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${freshnessInfo.badgeClass}`}
                                    >
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
                                        {job.experienceRequired != null
                                            ? `${job.experienceRequired}+ Yrs Exp`
                                            : "Fresher Welcome"}
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

                    {/* NAUKRI AI CANDIDATE FIT & MATCH ANALYSIS */}
                    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
                                    <FiZap size={18} />
                                </span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black text-slate-900">
                                            Naukri AI Match & Fit Analysis
                                        </h3>
                                        <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                            Role Insights
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Real-time comparison between your profile and job hiring benchmarks
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xl font-black text-indigo-700 leading-none">
                                        {matchResult.score}%
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                        {matchResult.level}
                                    </span>
                                </div>
                                <div className="h-10 w-10 relative flex items-center justify-center">
                                    <svg className="h-10 w-10 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-200"
                                            strokeWidth="3.5"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-indigo-600 transition-all duration-700"
                                            strokeDasharray={`${matchResult.score}, 100`}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* SKILL GAP & MATCHED PILLS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {/* Matched Skills */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                                    <span className="flex items-center gap-1.5">
                                        <FiCheckCircle size={14} className="text-emerald-600" />
                                        Matching Skills ({matchResult.matchedSkills?.length || 0})
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-700">Good Match</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {matchResult.matchedSkills && matchResult.matchedSkills.length > 0 ? (
                                        matchResult.matchedSkills.map((sk, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700 capitalize shadow-2xs"
                                            >
                                                <FiCheck size={11} />
                                                {sk}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[11px] text-slate-500 italic">
                                            No direct skill overlap found in profile.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Missing / Gap Skills with 1-Click Add */}
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                                    <span className="flex items-center gap-1.5">
                                        <FiAlertCircle size={14} className="text-amber-600" />
                                        Skills Gap ({matchResult.missingSkills?.length || 0})
                                    </span>
                                    <span className="text-[10px] font-semibold text-amber-700">1-Click Add</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {matchResult.missingSkills && matchResult.missingSkills.length > 0 ? (
                                        matchResult.missingSkills.map((sk, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                disabled={addingSkill}
                                                onClick={() => handleAddSkillToProfile(sk)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 capitalize transition shadow-2xs group"
                                                title={`Click to add ${sk} to your profile skills`}
                                            >
                                                <FiPlus size={11} className="text-amber-600 group-hover:scale-125 transition" />
                                                {sk}
                                            </button>
                                        ))
                                    ) : (
                                        <span className="text-[11px] text-emerald-700 font-medium">
                                            🎉 100% of required skills match your profile!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* NOTIFICATION FEEDBACK WHEN SKILL ADDED */}
                        {skillAddedMsg && (
                            <div className="rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold animate-fadeIn flex items-center justify-between">
                                <span>{skillAddedMsg}</span>
                            </div>
                        )}

                        {/* EXPERIENCE & EDUCATION BENCHMARK */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100/60 text-[11px] text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800">Experience Fit:</span>
                                <span>
                                    You have{" "}
                                    <strong className="text-slate-900 font-bold">{profile?.experience || 0} Yrs</strong>{" "}
                                    vs{" "}
                                    <strong className="text-slate-900 font-bold">
                                        {job.experienceRequired != null ? `${job.experienceRequired}+ Yrs` : "Any"}
                                    </strong>{" "}
                                    required.
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                                <Link to="/jobseeker/profile" className="hover:underline flex items-center gap-1">
                                    Update Resume & Skills in Profile →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Requirements / Skills Card */}
                    {job.requiredSkills && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-3">
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                Required Technical Skills & Qualifications
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
                            Role Description & Scope
                        </h2>
                        <div className="text-xs text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                            {job.description || "No specific detailed description provided for this opening."}
                        </div>
                    </div>
                </div>

                {/* RIGHT: APPLICATION SIDEBAR & RELATED JOBS */}
                <div className="space-y-6">
                    {/* DIRECT APPLY CARD (IF NOT YET APPLIED) */}
                    {!existingApplication && (
                        <div className="rounded-3xl border border-indigo-200/80 bg-white p-7 shadow-lg space-y-5">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                                    Instant ATS Application
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-0.5">
                                    Apply for this Position
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Submit your profile and resume directly to {companyName}'s hiring pipeline.
                                </p>
                            </div>

                            {/* Transparent Resume Status Card (Naukri style) */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-black text-slate-800 flex items-center gap-1.5">
                                        <FiFileText size={15} className={hasResume ? "text-emerald-600" : "text-amber-600"} />
                                        Attached Candidate Resume:
                                    </span>
                                    {hasResume && (
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            ✓ Verified PDF
                                        </span>
                                    )}
                                </div>

                                {hasResume ? (
                                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-bold text-[10px] flex items-center justify-center border border-red-200 shrink-0">
                                                PDF
                                            </span>
                                            <span className="text-xs font-bold text-slate-800 truncate" title={profile?.resumeFileName || "Candidate_Resume.pdf"}>
                                                {profile?.resumeFileName || "Candidate_Resume.pdf"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {getFullResumeUrl() && (
                                                <a
                                                    href={getFullResumeUrl()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition"
                                                >
                                                    <FiDownload size={11} />
                                                    View
                                                </a>
                                            )}
                                            <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer transition">
                                                <FiUploadCloud size={11} />
                                                <span>{uploadingResume ? "..." : "Change"}</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleResumeUpload}
                                                    disabled={uploadingResume}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-center space-y-1.5">
                                        <p className="text-[11px] font-bold text-amber-900">
                                            No resume uploaded yet
                                        </p>
                                        <label className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer transition">
                                            <FiUploadCloud size={13} />
                                            <span>{uploadingResume ? "Uploading..." : "Upload Resume PDF"}</span>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleResumeUpload}
                                                disabled={uploadingResume}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            {submitSuccess ? (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-2">
                                    <FiCheckCircle size={28} className="text-emerald-600 mx-auto" />
                                    <p className="text-xs font-bold text-emerald-900">{submitSuccess}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-4">
                                    {submitError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                                            <FiAlertCircle size={15} />
                                            <span>{submitError}</span>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-slate-700">
                                                Cover Note (Optional)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateAiPitch}
                                                disabled={aiGenerating}
                                                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 transition"
                                            >
                                                <FiZap size={11} className="text-amber-500" />
                                                <span>{aiGenerating ? "Drafting..." : "✨ AI Write Pitch"}</span>
                                            </button>
                                        </div>

                                        <textarea
                                            rows={4}
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            placeholder="Introduce yourself and briefly state why your engineering skill set aligns with this role, or click ✨ AI Write Pitch above..."
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition resize-none leading-relaxed"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || uploadingResume}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                                    >
                                        <FiSend size={13} />
                                        {submitting ? "Submitting Application..." : "Submit Candidacy"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* RELATED JOBS */}
                    {relatedJobs.length > 0 && (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Similar Engineering Roles
                            </h3>
                            <div className="space-y-3">
                                {relatedJobs.map((rJob) => {
                                    const rId = rJob.jobId || rJob.id;
                                    const rFreshness = getJobFreshness(rJob.createdAt);
                                    return (
                                        <Link
                                            key={rId}
                                            to={`/jobseeker/jobs/${rId}`}
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

export default JobSeekerJobDetails;
