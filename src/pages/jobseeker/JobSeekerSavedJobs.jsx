import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    FiBookmark,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiTrash2,
    FiArrowRight,
    FiAlertCircle,
    FiCompass,
    FiSearch,
    FiSend,
    FiCheckCircle,
    FiX,
    FiFileText
} from "react-icons/fi";
import { getMySavedJobs, removeSavedJob } from "../../services/savedJobService";
import { applyForJob } from "../../services/applicationService";
import { getJobSeekerProfile } from "../../services/jobSeekerService";
import { formatSalaryLPA, getJobFreshness } from "../../utils/helpers";
import ApplyJobModal from "../../components/jobseeker/ApplyJobModal";

const JobSeekerSavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [workplaceFilter, setWorkplaceFilter] = useState("ALL");
    const [removingId, setRemovingId] = useState(null);

    // 1-Click Apply Modal State
    const [applyingJob, setApplyingJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [profile, setProfile] = useState(null);
    const [submittingApply, setSubmittingApply] = useState(false);
    const [applySuccessMsg, setApplySuccessMsg] = useState("");
    const [applyErrorMsg, setApplyErrorMsg] = useState("");

    const fetchSaved = async () => {
        setLoading(true);
        setError("");
        try {
            const [savedData, profileData] = await Promise.all([
                getMySavedJobs().catch(() => []),
                getJobSeekerProfile().catch(() => null)
            ]);
            setSavedJobs(Array.isArray(savedData) ? savedData : []);
            setProfile(profileData);
        } catch (err) {
            console.error("Fetch saved jobs error:", err);
            setError("Unable to load your saved jobs list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSaved();
    }, []);

    const handleRemove = async (jobId) => {
        if (!window.confirm("Remove this opportunity from your saved bookmarks?")) return;

        setRemovingId(jobId);
        try {
            await removeSavedJob(jobId);
            setSavedJobs((prev) => prev.filter((j) => (j.jobId || j.id || j.job?.id) !== jobId));
        } catch (err) {
            console.error("Remove saved job error:", err);
            alert("Failed to remove job from saved list.");
        } finally {
            setRemovingId(null);
        }
    };

    // Filter logic
    const filteredJobs = useMemo(() => {
        const q = search.trim().toLowerCase();
        return savedJobs.filter((item) => {
            const job = item.job || item;
            const title = String(job.title || "").toLowerCase();
            const company = String(job.companyName || "").toLowerCase();
            const wp = String(job.workplaceType || "").toUpperCase();

            const matchesSearch = !q || title.includes(q) || company.includes(q);
            const matchesWorkplace = workplaceFilter === "ALL" || wp === workplaceFilter;
            return matchesSearch && matchesWorkplace;
        });
    }, [savedJobs, search, workplaceFilter]);

    // Handle Quick Apply
    const handleQuickApply = async (e) => {
        e.preventDefault();
        if (!applyingJob) return;

        const jobId = applyingJob.id || applyingJob.jobId;
        setSubmittingApply(true);
        setApplyErrorMsg("");
        setApplySuccessMsg("");

        try {
            await applyForJob(jobId, {
                coverLetter: coverLetter.trim(),
                resumeUrl: profile?.resumeUrl || profile?.resumePath || ""
            });

            setApplySuccessMsg("Application successfully submitted to the hiring team!");
            setTimeout(() => {
                setApplyingJob(null);
                setCoverLetter("");
                setApplySuccessMsg("");
            }, 2000);
        } catch (err) {
            console.error("Quick apply error:", err);
            setApplyErrorMsg(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to submit application. You may have already applied for this role."
            );
        } finally {
            setSubmittingApply(false);
        }
    };

    const hasResume = Boolean(profile?.resumeUrl || profile?.resumePath);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Saved Opportunities
                        </h1>
                        <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            {savedJobs.length} Bookmarked
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Review bookmarked engineering roles and submit applications whenever you're ready
                    </p>
                </div>

                <Link
                    to="/jobseeker/jobs"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:scale-[1.02]"
                >
                    <FiCompass size={14} />
                    Explore More Roles
                </Link>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* 2. Search & Workplace Filter Bar */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search saved jobs by title or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                    {["ALL", "REMOTE", "HYBRID", "ON_SITE"].map((wp) => (
                        <button
                            key={wp}
                            type="button"
                            onClick={() => setWorkplaceFilter(wp)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                workplaceFilter === wp
                                    ? "bg-white text-indigo-700 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {wp === "ALL" ? "All Locations" : wp.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Saved Jobs Stream */}
            {loading ? (
                <div className="py-20 text-center text-xs font-semibold text-slate-400">
                    Loading your saved opportunities...
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <FiBookmark size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                        {search || workplaceFilter !== "ALL" ? "No Matching Saved Jobs" : "No Saved Jobs Yet"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {search || workplaceFilter !== "ALL"
                            ? "No saved jobs match your active search and workplace filters."
                            : "Click the bookmark icon on any job in the search directory to save it here for quick review."}
                    </p>
                    <Link
                        to="/jobseeker/jobs"
                        className="inline-block mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
                    >
                        Browse Open Roles
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredJobs.map((item) => {
                        const jobObj = item.job || item;
                        const jobId = jobObj.id || item.jobId || item.id;
                        const title = jobObj.title || "Engineering Role";
                        const company = jobObj.companyName || "Tech Enterprise";
                        const location = jobObj.location || "Remote";
                        const salaryText = formatSalaryLPA(jobObj.minSalary, jobObj.maxSalary);
                        const freshness = getJobFreshness(jobObj.createdAt);

                        return (
                            <div
                                key={jobId}
                                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Company Avatar */}
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                                        {company.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <Link
                                                to={`/jobseeker/jobs/${jobId}`}
                                                className="text-base font-bold text-slate-900 hover:text-indigo-600 transition"
                                            >
                                                {title}
                                            </Link>

                                            {jobObj.workplaceType && (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                    {jobObj.workplaceType.replace("_", " ")}
                                                </span>
                                            )}

                                            {freshness?.isRecent && (
                                                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold">
                                                    {freshness.label}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs font-semibold text-slate-500">{company}</p>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <FiMapPin size={13} className="text-slate-400" />
                                                {location}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                                                <FiDollarSign size={13} className="text-emerald-500" />
                                                {salaryText}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiBriefcase size={13} className="text-slate-400" />
                                                {jobObj.jobType ? jobObj.jobType.replace("_", " ") : "Full Time"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setApplyingJob(jobObj);
                                            setCoverLetter("");
                                            setApplyErrorMsg("");
                                            setApplySuccessMsg("");
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs hover:scale-[1.02]"
                                    >
                                        <FiSend size={13} />
                                        1-Click Apply
                                    </button>

                                    <Link
                                        to={`/jobseeker/jobs/${jobId}`}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-bold transition"
                                    >
                                        Details
                                        <FiArrowRight size={13} />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(jobId)}
                                        disabled={removingId === jobId}
                                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                                        title="Remove from saved bookmarks"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 4. Apply Modal with Resume Transparency & AI Cover Letter */}
            <ApplyJobModal
                job={applyingJob}
                profile={profile}
                isOpen={Boolean(applyingJob)}
                onClose={() => setApplyingJob(null)}
                onProfileUpdated={(updatedProfile) => {
                    setProfile(updatedProfile);
                }}
            />
        </div>
    );
};

export default JobSeekerSavedJobs;
