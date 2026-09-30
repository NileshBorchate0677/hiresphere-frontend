import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiEye,
    FiCompass,
    FiMapPin,
    FiBriefcase,
    FiArrowRight,
    FiCheck,
    FiDownload,
    FiExternalLink
} from "react-icons/fi";
import { getMyApplications, withdrawApplication } from "../../services/applicationService";
import { API_BASE_URL } from "../../utils/constants";

const JobSeekerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [actionLoading, setActionLoading] = useState(null);

    // Selected application modal
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApplications = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getMyApplications();
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch applications error:", err);
            setError("Unable to load your application history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        const q = search.trim().toLowerCase();
        return applications.filter((app) => {
            const title = String(app.jobTitle || app.job?.title || "").toLowerCase();
            const company = String(app.companyName || app.job?.companyName || "").toLowerCase();
            const status = String(app.status || "APPLIED").toUpperCase();

            const matchesSearch = !q || title.includes(q) || company.includes(q);
            const matchesStatus = statusFilter === "ALL" || status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, search, statusFilter]);

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;

        setActionLoading(appId);
        try {
            await withdrawApplication(appId);
            setApplications((prev) =>
                prev.map((a) => {
                    const id = a.applicationId || a.id;
                    return id === appId ? { ...a, status: "WITHDRAWN" } : a;
                })
            );
            if (selectedApp && (selectedApp.applicationId || selectedApp.id) === appId) {
                setSelectedApp((prev) => ({ ...prev, status: "WITHDRAWN" }));
            }
        } catch (err) {
            console.error("Withdraw application error:", err);
            alert("Failed to withdraw application. It may have already been reviewed or accepted.");
        } finally {
            setActionLoading(null);
        }
    };

    const countApplied = applications.filter((a) => String(a.status || "").toUpperCase() === "APPLIED").length;
    const countShortlisted = applications.filter((a) => String(a.status || "").toUpperCase() === "SHORTLISTED").length;
    const countAccepted = applications.filter((a) => String(a.status || "").toUpperCase() === "ACCEPTED").length;
    const countRejected = applications.filter((a) => String(a.status || "").toUpperCase() === "REJECTED").length;
    const countWithdrawn = applications.filter((a) => String(a.status || "").toUpperCase() === "WITHDRAWN").length;

    // Helper for ATS Stepper
    const getStageNumber = (status) => {
        const s = String(status || "").toUpperCase();
        if (s === "ACCEPTED") return 4;
        if (s === "SHORTLISTED") return 3;
        if (s === "APPLIED") return 2;
        if (s === "REJECTED" || s === "WITHDRAWN") return 1;
        return 1;
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            My Applications
                        </h1>
                        <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            {applications.length} Total
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Track ATS hiring stages, recruiter evaluations, and interview outcomes in real-time
                    </p>
                </div>

                <Link
                    to="/jobseeker/jobs"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:scale-[1.02]"
                >
                    <FiCompass size={14} />
                    Browse Openings
                </Link>
            </div>

            {/* 2. Filter & Search Bar */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by role title or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            statusFilter === "ALL"
                                ? "bg-white text-indigo-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        All ({applications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("APPLIED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            statusFilter === "APPLIED"
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Applied ({countApplied})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("SHORTLISTED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            statusFilter === "SHORTLISTED"
                                ? "bg-white text-purple-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Shortlisted ({countShortlisted})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("ACCEPTED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            statusFilter === "ACCEPTED"
                                ? "bg-white text-emerald-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Accepted ({countAccepted})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("REJECTED")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                            statusFilter === "REJECTED"
                                ? "bg-white text-rose-700 shadow-xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Rejected ({countRejected})
                    </button>
                    {countWithdrawn > 0 && (
                        <button
                            type="button"
                            onClick={() => setStatusFilter("WITHDRAWN")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                                statusFilter === "WITHDRAWN"
                                    ? "bg-white text-slate-600 shadow-xs"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            Withdrawn ({countWithdrawn})
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* 3. Applications Stream */}
            {loading ? (
                <div className="py-20 text-center text-xs font-semibold text-slate-400">
                    Loading your application history...
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <FiFileText size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No Applications Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {search || statusFilter !== "ALL"
                            ? "No applications match your active search or status filter."
                            : "You haven't submitted any job applications yet."}
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
                    {filteredApplications.map((app) => {
                        const appId = app.applicationId || app.id;
                        const status = String(app.status || "APPLIED").toUpperCase();
                        const title = app.jobTitle || app.job?.title || "Engineering Role";
                        const company = app.companyName || app.job?.companyName || "Tech Enterprise";
                        const jobId = app.job?.id || app.job?.jobId || app.jobId;

                        return (
                            <div
                                key={appId}
                                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Company Avatar */}
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                                        {company.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <h2 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition">
                                                {jobId ? (
                                                    <Link to={`/jobseeker/jobs/${jobId}`}>{title}</Link>
                                                ) : (
                                                    title
                                                )}
                                            </h2>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                    status === "ACCEPTED"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : status === "SHORTLISTED"
                                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                        : status === "REJECTED"
                                                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                        : status === "WITHDRAWN"
                                                        ? "bg-slate-100 text-slate-500 border border-slate-200"
                                                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                                }`}
                                            >
                                                {status}
                                            </span>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-500">{company}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                            {app.appliedAt && (
                                                <span className="flex items-center gap-1.5 text-[11px]">
                                                    <FiClock size={12} />
                                                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {app.coverLetter && (
                                                <span className="text-[11px] text-indigo-600 font-medium">
                                                    • Cover Letter Attached
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                                    {jobId && (
                                        <Link
                                            to={`/jobseeker/jobs/${jobId}`}
                                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition"
                                            title="View Job Post"
                                        >
                                            <FiExternalLink size={13} />
                                            <span className="hidden sm:inline">Job Post</span>
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setSelectedApp(app)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs"
                                    >
                                        <FiEye size={13} />
                                        ATS Status
                                    </button>

                                    {status !== "WITHDRAWN" && status !== "REJECTED" && status !== "ACCEPTED" && (
                                        <button
                                            type="button"
                                            onClick={() => handleWithdraw(appId)}
                                            disabled={actionLoading === appId}
                                            className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 px-3 py-2 text-xs font-bold transition disabled:opacity-50"
                                            title="Withdraw Candidacy"
                                        >
                                            {actionLoading === appId ? "..." : "Withdraw"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 4. Application Details / ATS Pipeline Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {selectedApp.jobTitle || selectedApp.job?.title || "Application"}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedApp.companyName || selectedApp.job?.companyName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedApp(null)}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* ATS Pipeline Stepper */}
                        <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                Hiring Process Timeline
                            </span>
                            <div className="flex items-center justify-between relative">
                                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>

                                {[
                                    { step: 1, label: "Submitted" },
                                    { step: 2, label: "In Review" },
                                    { step: 3, label: "Shortlisted" },
                                    { step: 4, label: "Offer / Hired" }
                                ].map(({ step, label }) => {
                                    const currentStage = getStageNumber(selectedApp.status);
                                    const isDone = currentStage >= step;
                                    const isCurrent = currentStage === step;

                                    return (
                                        <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                                                    isDone
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "bg-white border-slate-300 text-slate-400"
                                                }`}
                                            >
                                                {isDone ? <FiCheck size={12} /> : step}
                                            </div>
                                            <span
                                                className={`text-[10px] font-semibold ${
                                                    isCurrent
                                                        ? "text-indigo-600 font-bold"
                                                        : isDone
                                                        ? "text-slate-700"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Details Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-2xl">
                                <span className="text-slate-400 text-[11px] block">Current Stage</span>
                                <p className="font-bold text-indigo-700 mt-0.5">
                                    {String(selectedApp.status || "APPLIED").toUpperCase()}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl">
                                <span className="text-slate-400 text-[11px] block">Application Date</span>
                                <p className="font-bold text-slate-800 mt-0.5">
                                    {selectedApp.appliedAt
                                        ? new Date(selectedApp.appliedAt).toLocaleDateString()
                                        : "Recent"}
                                </p>
                            </div>
                        </div>

                        {/* Cover Letter Section */}
                        {selectedApp.coverLetter && (
                            <div className="space-y-1 text-xs">
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                                    Cover Letter Sent to Recruiter
                                </span>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-slate-700 leading-relaxed whitespace-pre-line text-xs max-h-40 overflow-y-auto">
                                    {selectedApp.coverLetter}
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {(selectedApp.job?.id || selectedApp.jobId) && (
                                <Link
                                    to={`/jobseeker/jobs/${selectedApp.job?.id || selectedApp.jobId}`}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    View Full Job Details <FiArrowRight size={12} />
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedApp(null)}
                                className="ml-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold transition shadow-xs"
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

export default JobSeekerApplications;
