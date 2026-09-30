import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";
import {
    FiUsers,
    FiSearch,
    FiCheck,
    FiX,
    FiStar,
    FiFileText,
    FiMail,
    FiPhone,
    FiMapPin,
    FiAward,
    FiClock,
    FiExternalLink,
    FiFilter,
    FiAlertCircle,
    FiCheckCircle,
    FiChevronRight,
    FiBriefcase
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import RecruiterCandidateDossierModal from "../../components/recruiter/RecruiterCandidateDossierModal";
import { getMyJobs } from "../../services/jobService";
import {
    getApplicantsForJob,
    shortlistApplication,
    acceptApplication,
    rejectApplication
} from "../../services/applicationService";
import { analyzeCandidateMatchAI } from "../../services/aiService";

const RecruiterApplications = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialJobId = searchParams.get("jobId");

    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(initialJobId || "");
    const [applicants, setApplicants] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, APPLIED, SHORTLISTED, ACCEPTED, REJECTED
    const [toastMessage, setToastMessage] = useState(null);

    // AI Match Modal state
    const [selectedAiMatch, setSelectedAiMatch] = useState(null);
    const [calculatingAiId, setCalculatingAiId] = useState(null);

    // Full Candidate Detail Modal state
    const [candidateDetailModal, setCandidateDetailModal] = useState(null);

    const showToast = (text, type = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // 1. Fetch Recruiter's Jobs
    useEffect(() => {
        const fetchJobs = async () => {
            setLoadingJobs(true);
            try {
                const data = await getMyJobs();
                const jobList = Array.isArray(data) ? data : [];
                setJobs(jobList);

                if (jobList.length > 0) {
                    if (initialJobId && jobList.some((j) => String(j.id) === String(initialJobId))) {
                        setSelectedJobId(String(initialJobId));
                    } else {
                        setSelectedJobId(String(jobList[0].id));
                    }
                }
            } catch (err) {
                console.error("Failed to load jobs:", err);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchJobs();
    }, [initialJobId]);

    // 2. Fetch Applicants when selectedJobId changes
    const fetchApplicants = async (jobId) => {
        if (!jobId) {
            setApplicants([]);
            return;
        }
        setLoadingApplicants(true);
        try {
            const data = await getApplicantsForJob(jobId);
            setApplicants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load applicants for job:", err);
            setApplicants([]);
        } finally {
            setLoadingApplicants(false);
        }
    };

    useEffect(() => {
        if (selectedJobId) {
            fetchApplicants(selectedJobId);
            setSearchParams({ jobId: selectedJobId });
        }
    }, [selectedJobId]);

    // Active selected job object
    const currentJob = jobs.find((j) => String(j.id) === String(selectedJobId));

    // Status Actions
    const handleShortlist = async (appId) => {
        setActionLoadingId(appId);
        try {
            await shortlistApplication(appId);
            showToast("Candidate shortlisted successfully.");
            setApplicants((prev) =>
                prev.map((a) => (a.applicationId === appId ? { ...a, status: "SHORTLISTED" } : a))
            );
            if (candidateDetailModal && candidateDetailModal.applicationId === appId) {
                setCandidateDetailModal((prev) => ({ ...prev, status: "SHORTLISTED" }));
            }
        } catch (err) {
            console.error("Shortlist error:", err);
            showToast("Failed to shortlist candidate.", "error");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAccept = async (appId) => {
        setActionLoadingId(appId);
        try {
            await acceptApplication(appId);
            showToast("Application accepted!");
            setApplicants((prev) =>
                prev.map((a) => (a.applicationId === appId ? { ...a, status: "ACCEPTED" } : a))
            );
            if (candidateDetailModal && candidateDetailModal.applicationId === appId) {
                setCandidateDetailModal((prev) => ({ ...prev, status: "ACCEPTED" }));
            }
        } catch (err) {
            console.error("Accept error:", err);
            showToast("Failed to accept application.", "error");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (appId) => {
        setActionLoadingId(appId);
        try {
            await rejectApplication(appId);
            showToast("Application marked as rejected.");
            setApplicants((prev) =>
                prev.map((a) => (a.applicationId === appId ? { ...a, status: "REJECTED" } : a))
            );
            if (candidateDetailModal && candidateDetailModal.applicationId === appId) {
                setCandidateDetailModal((prev) => ({ ...prev, status: "REJECTED" }));
            }
        } catch (err) {
            console.error("Reject error:", err);
            showToast("Failed to reject application.", "error");
        } finally {
            setActionLoadingId(null);
        }
    };

    // AI Match Analysis
    const handleRunAiMatch = async (applicant) => {
        setCalculatingAiId(applicant.applicationId);
        try {
            const aiResult = await analyzeCandidateMatchAI({
                candidate: {
                    fullName: applicant.applicantName,
                    skills: applicant.skills,
                    experience: applicant.experience,
                    qualification: applicant.highestQualification,
                },
                job: currentJob,
            });

            setSelectedAiMatch({
                applicantName: applicant.applicantName,
                ...aiResult,
            });
        } catch (err) {
            console.error("AI Match error:", err);
        } finally {
            setCalculatingAiId(null);
        }
    };

    // Filter applicants
    const filteredApplicants = applicants.filter((app) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            app.applicantName?.toLowerCase().includes(query) ||
            app.email?.toLowerCase().includes(query) ||
            app.skills?.toLowerCase().includes(query) ||
            app.highestQualification?.toLowerCase().includes(query);

        const matchesStatus =
            statusFilter === "ALL" ? true : app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const counts = {
        ALL: applicants.length,
        APPLIED: applicants.filter((a) => a.status === "APPLIED").length,
        SHORTLISTED: applicants.filter((a) => a.status === "SHORTLISTED").length,
        ACCEPTED: applicants.filter((a) => a.status === "ACCEPTED").length,
        REJECTED: applicants.filter((a) => a.status === "REJECTED").length,
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "SHORTLISTED":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "ACCEPTED":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "REJECTED":
                return "bg-rose-100 text-rose-700 border-rose-200";
            default:
                return "bg-sky-100 text-sky-700 border-sky-200";
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* TOAST ALERT */}
                {toastMessage && (
                    <div
                        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-5 ${
                            toastMessage.type === "error" ? "bg-rose-600" : "bg-emerald-600"
                        }`}
                    >
                        {toastMessage.type === "error" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
                        <span>{toastMessage.text}</span>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Candidate Pipeline (ATS)
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Screen applicants, review resumes, generate AI match scores, and track hiring stages.
                        </p>
                    </div>

                    {/* Job Selector Dropdown */}
                    <div className="w-full sm:w-72">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Active Job Role
                        </label>
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            disabled={loadingJobs || jobs.length === 0}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                        >
                            {jobs.map((j) => (
                                <option key={j.id} value={j.id}>
                                    {j.title} ({j.location})
                                </option>
                            ))}
                            {jobs.length === 0 && (
                                <option value="">No Active Job Openings</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* CURRENT JOB INFO BAR */}
                {currentJob && (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                                <FiBriefcase size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                    {currentJob.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {currentJob.location} • {currentJob.experienceRequired}+ Yrs Exp • {currentJob.jobType?.replace("_", " ")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to={`/recruiter/jobs/${currentJob.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-purple-600 transition shadow-xs"
                            >
                                <FiBriefcase size={13} />
                                Job Specifications
                            </Link>
                        </div>
                    </div>
                )}

                {/* SEARCH & STATUS TABS */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search candidates by name, skills, degree, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200 overflow-x-auto">
                        {[
                            { key: "ALL", label: "All" },
                            { key: "APPLIED", label: "Applied" },
                            { key: "SHORTLISTED", label: "Shortlisted" },
                            { key: "ACCEPTED", label: "Accepted" },
                            { key: "REJECTED", label: "Rejected" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                                    statusFilter === tab.key
                                        ? "bg-white text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                                        statusFilter === tab.key
                                            ? "bg-indigo-100 text-indigo-800"
                                            : "bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    {counts[tab.key] || 0}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* APPLICANTS STREAM */}
                {loadingApplicants ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                        ))}
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="p-12 rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <FiUsers size={26} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No Applicants in this Stage</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            {searchTerm || statusFilter !== "ALL"
                                ? "No candidates match your current filter settings. Try modifying search terms."
                                : "No candidates have applied for this job yet. Share your job link to attract candidates."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplicants.map((app) => {
                            const isActionLoading = actionLoadingId === app.applicationId;
                            const isAiCalculating = calculatingAiId === app.applicationId;

                            return (
                                <div
                                    key={app.applicationId}
                                    className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition duration-150 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                                >
                                    {/* Left Candidate Info */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                                                    app.status
                                                )}`}
                                            >
                                                {app.status || "APPLIED"}
                                            </span>

                                            {app.highestQualification && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                                                    {app.highestQualification}
                                                </span>
                                            )}

                                            <span className="text-[11px] text-slate-400 font-medium">
                                                Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Recently"}
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 leading-tight">
                                                {app.applicantName}
                                            </h2>
                                            {app.headline && (
                                                <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                                                    {app.headline}
                                                </p>
                                            )}
                                        </div>

                                        {/* Contact & Meta info */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                                            {app.email && (
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <FiMail size={13} className="text-slate-400" />
                                                    {app.email}
                                                </span>
                                            )}
                                            {app.phoneNumber && (
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <FiPhone size={13} className="text-slate-400" />
                                                    {app.phoneNumber}
                                                </span>
                                            )}
                                            {app.location && (
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <FiMapPin size={13} className="text-slate-400" />
                                                    {app.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 font-bold text-slate-900">
                                                <FiClock size={13} className="text-slate-400" />
                                                {app.experience !== undefined ? `${app.experience} Yrs Exp` : "Fresher"}
                                            </span>
                                        </div>

                                        {/* Skills tags */}
                                        {app.skills && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {app.skills.split(",").slice(0, 6).map((sk, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                                                    >
                                                        {sk.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Cover letter snippet */}
                                        {app.coverLetter && (
                                            <p className="text-xs text-slate-500 italic line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                "{app.coverLetter}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Right Actions & AI Match */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                        {/* AI Match Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleRunAiMatch(app)}
                                            disabled={isAiCalculating}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100/60 transition shadow-xs"
                                        >
                                            <HiSparkles size={14} className={isAiCalculating ? "animate-spin" : "text-purple-600"} />
                                            {isAiCalculating ? "Analyzing..." : "✨ AI Match Fit"}
                                        </button>

                                        {/* Candidate Details Modal Trigger */}
                                        <button
                                            type="button"
                                            onClick={() => setCandidateDetailModal(app)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                                        >
                                            <FiFileText size={14} />
                                            View Dossier
                                        </button>

                                        {/* Resume PDF Download */}
                                        {app.resumeUrl && (
                                            <a
                                                href={app.resumeUrl.startsWith("http") ? app.resumeUrl : `${API_BASE_URL}/recruiter/resume/download/${app.resumeUrl.replace(/^\/?(jobseeker|recruiter)\/resume\/download\//, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                                            >
                                                <FiExternalLink size={13} />
                                                Resume PDF
                                            </a>
                                        )}

                                        {/* Pipeline Stage Action Buttons */}
                                        <div className="flex items-center gap-1.5 pt-1 w-full sm:w-auto">
                                            {app.status !== "SHORTLISTED" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShortlist(app.applicationId)}
                                                    disabled={isActionLoading}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                                                    title="Shortlist for interview"
                                                >
                                                    Shortlist
                                                </button>
                                            )}

                                            {app.status !== "ACCEPTED" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAccept(app.applicationId)}
                                                    disabled={isActionLoading}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                                                    title="Accept candidate"
                                                >
                                                    Accept
                                                </button>
                                            )}

                                            {app.status !== "REJECTED" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(app.applicationId)}
                                                    disabled={isActionLoading}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                                                    title="Reject candidate"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* AI MATCH ASSESSMENT MODAL */}
                {selectedAiMatch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <HiSparkles size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-900">
                                            AI Fit Assessment
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            {selectedAiMatch.applicantName} for {currentJob?.title}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedAiMatch(null)}
                                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>

                            {/* Match Score Badge */}
                            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                                        Calculated Match Score
                                    </p>
                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                        {selectedAiMatch.recommendation}
                                    </p>
                                </div>
                                <div className="text-3xl font-black text-purple-700">
                                    {selectedAiMatch.score}%
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                    ✓ Key Strengths
                                </p>
                                <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                                    {selectedAiMatch.strengths}
                                </p>
                            </div>

                            {/* Potential Skill Gaps */}
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                    ⚠ Areas for Inquiry
                                </p>
                                <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                                    {selectedAiMatch.skillGaps}
                                </p>
                            </div>

                            {/* Insights */}
                            {selectedAiMatch.insights && (
                                <p className="text-[11px] text-slate-500 italic">
                                    Benchmark note: {selectedAiMatch.insights}
                                </p>
                            )}

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAiMatch(null)}
                                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FULL CANDIDATE DOSSIER MODAL */}
                {candidateDetailModal && (
                    <RecruiterCandidateDossierModal
                        candidate={candidateDetailModal}
                        onClose={() => setCandidateDetailModal(null)}
                    />
                )}
        </div>
    );
};

export default RecruiterApplications;
