import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FiBriefcase,
    FiUsers,
    FiMapPin,
    FiDollarSign,
    FiClock,
    FiEdit3,
    FiCheckCircle,
    FiXCircle,
    FiArrowLeft,
    FiAlertCircle,
    FiEye,
    FiX,
    FiFileText,
    FiSearch,
    FiCalendar,
    FiLayers,
    FiPlus,
    FiExternalLink
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { getJobById, closeJob } from "../../services/jobService";
import {
    getApplicationsForJob,
    shortlistCandidate,
    acceptCandidate,
    rejectCandidate
} from "../../services/applicationService";
import RecruiterCandidateDossierModal from "../../components/recruiter/RecruiterCandidateDossierModal";

const RecruiterJobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [viewingDossier, setViewingDossier] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | APPLIED | SHORTLISTED | ACCEPTED | REJECTED
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobData, appsData] = await Promise.all([
                getJobById(jobId),
                getApplicationsForJob(jobId).catch(() => [])
            ]);
            setJob(jobData);
            setApplicants(Array.isArray(appsData) ? appsData : []);
        } catch (err) {
            console.error("Recruiter job details error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId) {
            fetchData();
        }
    }, [jobId]);

    const handleToggleClose = async () => {
        if (!job) return;
        try {
            await closeJob(jobId);
            setJob((prev) => ({
                ...prev,
                status: prev.status === "OPEN" ? "CLOSED" : "CLOSED"
            }));
        } catch (err) {
            console.error("Close job error:", err);
            alert("Failed to update job status.");
        }
    };

    const handleShortlist = async (appId) => {
        setActionLoading(appId);
        try {
            await shortlistCandidate(appId);
            setApplicants((prev) =>
                prev.map((a) => {
                    const id = a.applicationId || a.id;
                    return id === appId ? { ...a, status: "SHORTLISTED" } : a;
                })
            );
        } catch (err) {
            console.error("Shortlist error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (appId) => {
        setActionLoading(appId);
        try {
            await acceptCandidate(appId);
            setApplicants((prev) =>
                prev.map((a) => {
                    const id = a.applicationId || a.id;
                    return id === appId ? { ...a, status: "ACCEPTED" } : a;
                })
            );
        } catch (err) {
            console.error("Accept error:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (appId) => {
        setActionLoading(appId);
        try {
            await rejectCandidate(appId);
            setApplicants((prev) =>
                prev.map((a) => {
                    const id = a.applicationId || a.id;
                    return id === appId ? { ...a, status: "REJECTED" } : a;
                })
            );
        } catch (err) {
            console.error("Reject error:", err);
        } finally {
            setActionLoading(null);
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

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs font-semibold text-slate-400">
                <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Loading job opening specifications & applicant pipeline...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4 font-sans">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <FiBriefcase size={22} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Job Opening Not Found</h2>
                <p className="text-xs text-slate-500">
                    The requested job may have been deleted or moved.
                </p>
                <Link
                    to="/recruiter/jobs"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                >
                    <FiArrowLeft size={14} />
                    Back to All Openings
                </Link>
            </div>
        );
    }

    const isOpen = String(job.status || "OPEN").toUpperCase() === "OPEN";
    const shortlistedCount = applicants.filter((a) => String(a.status).toUpperCase() === "SHORTLISTED").length;
    const acceptedCount = applicants.filter((a) => String(a.status).toUpperCase() === "ACCEPTED").length;
    const rejectedCount = applicants.filter((a) => String(a.status).toUpperCase() === "REJECTED").length;
    const pendingCount = applicants.filter((a) => {
        const s = String(a.status || "APPLIED").toUpperCase();
        return s === "APPLIED" || s === "PENDING" || s === "IN_REVIEW";
    }).length;

    // Filtered applicants
    const filteredApplicants = applicants.filter((app) => {
        const status = String(app.status || "APPLIED").toUpperCase();
        if (statusFilter === "SHORTLISTED" && status !== "SHORTLISTED") return false;
        if (statusFilter === "ACCEPTED" && status !== "ACCEPTED") return false;
        if (statusFilter === "REJECTED" && status !== "REJECTED") return false;
        if (statusFilter === "APPLIED" && status !== "APPLIED" && status !== "PENDING" && status !== "IN_REVIEW") return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const name = String(app.applicantName || app.fullName || "").toLowerCase();
            const email = String(app.applicantEmail || app.email || "").toLowerCase();
            const skills = String(app.skills || app.keySkills || "").toLowerCase();
            return name.includes(q) || email.includes(q) || skills.includes(q);
        }

        return true;
    });

    const skillsList = job.requiredSkills
        ? job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
            {/* BACK BUTTON & TOP ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/recruiter/jobs")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition self-start"
                >
                    <FiArrowLeft size={14} />
                    Back to All Job Postings
                </button>

                <div className="flex items-center gap-2">
                    <Link
                        to={`/recruiter/jobs/edit?jobId=${jobId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-purple-600 transition shadow-2xs"
                    >
                        <FiEdit3 size={14} />
                        Edit Opening
                    </Link>

                    <Link
                        to="/recruiter/jobs/create"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
                    >
                        <FiPlus size={14} />
                        Post Another Role
                    </Link>
                </div>
            </div>

            {/* HEADER SPECIFICATION CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {job.title}
                            </h1>
                            <span
                                className={`rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase border ${
                                    isOpen
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                            >
                                {isOpen ? "Active Opening" : "Closed"}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 pt-1">
                            <span className="flex items-center gap-1.5 font-medium">
                                <FiMapPin size={13} className="text-slate-400" />
                                {job.location || "Remote"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 font-bold text-slate-900">
                                <FiDollarSign size={13} className="text-slate-400" />
                                {formatSalary(job.minSalary, job.maxSalary)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <FiClock size={13} className="text-slate-400" />
                                {job.experienceRequired !== undefined ? `${job.experienceRequired}+ Yrs Exp` : "Fresher"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5 font-medium text-slate-600">
                                <FiBriefcase size={13} className="text-slate-400" />
                                {job.jobType ? job.jobType.replace("_", " ") : "Full Time"}
                            </span>
                            {job.workplaceType && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 font-medium text-purple-700">
                                        <FiLayers size={13} className="text-purple-400" />
                                        {job.workplaceType.replace("_", " ")}
                                    </span>
                                </>
                            )}
                            {job.applicationDeadline && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 font-medium text-amber-700">
                                        <FiCalendar size={13} className="text-amber-500" />
                                        Deadline: {job.applicationDeadline}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {isOpen && (
                            <button
                                type="button"
                                onClick={handleToggleClose}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-800 transition"
                            >
                                <FiXCircle size={14} />
                                Close Job
                            </button>
                        )}
                        <Link
                            to={`/recruiter/applications?jobId=${jobId}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-xs font-bold transition shadow-md shadow-purple-600/20"
                        >
                            <FiUsers size={14} />
                            ATS Board
                        </Link>
                    </div>
                </div>

                {/* FUNNEL METRICS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-slate-100">
                    <div className="rounded-2xl bg-slate-50 p-4 text-center">
                        <p className="text-2xl font-black text-slate-900">{applicants.length}</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Applied</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-4 text-center">
                        <p className="text-2xl font-black text-blue-700">{pendingCount}</p>
                        <p className="text-[11px] font-semibold text-blue-600 mt-0.5">In Review</p>
                    </div>
                    <div className="rounded-2xl bg-purple-50 p-4 text-center">
                        <p className="text-2xl font-black text-purple-700">{shortlistedCount}</p>
                        <p className="text-[11px] font-semibold text-purple-600 mt-0.5">Shortlisted</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                        <p className="text-2xl font-black text-emerald-700">{acceptedCount}</p>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Accepted</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-4 text-center">
                        <p className="text-2xl font-black text-rose-700">{rejectedCount}</p>
                        <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Rejected</p>
                    </div>
                </div>
            </div>

            {/* JOB DESCRIPTION & REQUIREMENTS CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900">Job Description & Role Requirements</h2>
                    <span className="text-xs font-semibold text-slate-500">Vacancies: {job.vacancies || 1}</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    {job.description}
                </div>

                {skillsList.length > 0 && (
                    <div className="space-y-2 pt-2">
                        <p className="text-xs font-bold text-slate-800">Required Skills & Technologies:</p>
                        <div className="flex flex-wrap gap-2">
                            {skillsList.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* APPLICANT PIPELINE SECTION */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-black text-slate-900">
                            Candidate Pipeline for this Role ({filteredApplicants.length})
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Screen applicants, inspect career dossiers, and progress candidates
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/recruiter/candidates"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                        >
                            <HiSparkles size={14} />
                            Search Resdex Talent →
                        </Link>
                    </div>
                </div>

                {/* SEARCH & FILTER TABS */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter applicants by candidate name, email, or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { id: "ALL", label: `All (${applicants.length})` },
                            { id: "APPLIED", label: `In Review (${pendingCount})` },
                            { id: "SHORTLISTED", label: `Shortlisted (${shortlistedCount})` },
                            { id: "ACCEPTED", label: `Accepted (${acceptedCount})` },
                            { id: "REJECTED", label: `Rejected (${rejectedCount})` },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatusFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                    statusFilter === tab.id
                                        ? "bg-purple-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredApplicants.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                            <FiUsers size={22} />
                        </div>
                        <p className="text-sm font-bold text-slate-800">No Candidates Matching Current Filter</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {searchQuery
                                ? `No applicants matched "${searchQuery}". Clear your search query to see all candidates.`
                                : "No candidates found for this stage yet."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredApplicants.map((app) => {
                            const appId = app.applicationId || app.id;
                            const status = String(app.status || "APPLIED").toUpperCase();
                            const applicantName = app.applicantName || app.fullName || "Candidate";
                            const applicantEmail = app.applicantEmail || app.email || "";
                            const candidateProfileId = app.jobSeekerProfileId || app.candidateProfileId;

                            return (
                                <div
                                    key={appId}
                                    className="py-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 -mx-4 px-4 rounded-2xl transition"
                                >
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <p className="text-sm font-bold text-slate-900">
                                                {candidateProfileId ? (
                                                    <Link
                                                        to={`/recruiter/candidates/${candidateProfileId}`}
                                                        className="hover:text-purple-600 transition"
                                                    >
                                                        {applicantName}
                                                    </Link>
                                                ) : (
                                                    applicantName
                                                )}
                                            </p>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase border ${
                                                    status === "ACCEPTED"
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : status === "SHORTLISTED"
                                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                                        : status === "REJECTED"
                                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                                }`}
                                            >
                                                {status}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500">
                                            {applicantEmail} {app.appliedAt && `• Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {/* View Full Dossier */}
                                        <button
                                            type="button"
                                            onClick={() => setViewingDossier(app)}
                                            className="rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 border border-purple-200"
                                        >
                                            <FiEye size={13} />
                                            View Dossier
                                        </button>

                                        {app.coverLetter && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedApplicant(app)}
                                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                                            >
                                                Cover Note
                                            </button>
                                        )}

                                        {status !== "SHORTLISTED" && status !== "ACCEPTED" && (
                                            <button
                                                type="button"
                                                onClick={() => handleShortlist(appId)}
                                                disabled={actionLoading === appId}
                                                className="rounded-xl bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 shadow-2xs"
                                            >
                                                Shortlist
                                            </button>
                                        )}

                                        {status !== "ACCEPTED" && (
                                            <button
                                                type="button"
                                                onClick={() => handleAccept(appId)}
                                                disabled={actionLoading === appId}
                                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold shadow-2xs transition disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                        )}

                                        {status !== "REJECTED" && status !== "ACCEPTED" && (
                                            <button
                                                type="button"
                                                onClick={() => handleReject(appId)}
                                                disabled={actionLoading === appId}
                                                className="rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FULL CANDIDATE DOSSIER MODAL */}
            {viewingDossier && (
                <RecruiterCandidateDossierModal
                    candidate={viewingDossier}
                    onClose={() => setViewingDossier(null)}
                />
            )}

            {/* COVER NOTE MODAL */}
            {selectedApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {selectedApplicant.applicantName || "Candidate"}
                                </h3>
                                <p className="text-[11px] text-slate-500">Submitted Cover Note</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedApplicant(null)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {selectedApplicant.coverLetter}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedApplicant(null)}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterJobDetails;
