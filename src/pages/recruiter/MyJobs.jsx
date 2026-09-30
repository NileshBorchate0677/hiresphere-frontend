import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiBriefcase,
    FiPlus,
    FiSearch,
    FiMapPin,
    FiDollarSign,
    FiClock,
    FiUsers,
    FiEdit3,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiCalendar,
    FiExternalLink,
    FiEye
} from "react-icons/fi";
import { getMyJobs, closeJob, deleteJob } from "../../services/jobService";

const MyJobs = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, OPEN, CLOSED

    // Action modals state
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteModalJob, setDeleteModalJob] = useState(null);
    const [closeModalJob, setCloseModalJob] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getMyJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch recruiter jobs:", err);
            setError("Unable to load job postings. Please verify your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const showToast = (text, type = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const handleConfirmClose = async () => {
        if (!closeModalJob) return;
        setActionLoading(true);
        try {
            await closeJob(closeModalJob.id);
            showToast(`Job "${closeModalJob.title}" closed successfully.`);
            setCloseModalJob(null);
            fetchJobs();
        } catch (err) {
            console.error("Failed to close job:", err);
            showToast("Failed to close job. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModalJob) return;
        setActionLoading(true);
        try {
            await deleteJob(deleteModalJob.id);
            showToast(`Job "${deleteModalJob.title}" removed permanently.`);
            setDeleteModalJob(null);
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job:", err);
            showToast("Failed to delete job. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter logic
    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ? true : job.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Counts
    const totalCount = jobs.length;
    const openCount = jobs.filter((j) => j.status === "OPEN").length;
    const closedCount = jobs.filter((j) => j.status === "CLOSED").length;

    const formatSalary = (min, max) => {
        if (!min && !max) return "Competitive";
        const minLpa = (min / 100000).toFixed(1);
        const maxLpa = (max / 100000).toFixed(1);
        return `₹${minLpa} - ₹${maxLpa} LPA`;
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

                {/* HEADER & QUICK STATS */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Job Openings
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Create, update, monitor applications, and manage hiring pipeline statuses.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={fetchJobs}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                            title="Refresh postings"
                        >
                            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>

                        <Link
                            to="/recruiter/jobs/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                        >
                            <FiPlus size={16} />
                            Post New Job
                        </Link>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Postings</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{totalCount}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active (Open)</p>
                        <p className="mt-1 text-2xl font-black text-emerald-700">{openCount}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-100/60 p-4 shadow-xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Closed / Expired</p>
                        <p className="mt-1 text-2xl font-black text-slate-600">{closedCount}</p>
                    </div>
                </div>

                {/* SEARCH & FILTER CONTROLS */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Filter by title, skills, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-slate-200">
                        {["ALL", "OPEN", "CLOSED"].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                    statusFilter === filter
                                        ? "bg-white text-indigo-700 shadow-xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {filter === "ALL" ? "All" : filter === "OPEN" ? "Active" : "Closed"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* JOB LISTING STREAM */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50 text-center">
                        <FiAlertCircle size={32} className="mx-auto text-rose-500 mb-2" />
                        <p className="text-xs font-bold text-rose-800">{error}</p>
                        <button
                            type="button"
                            onClick={fetchJobs}
                            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-12 rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <FiBriefcase size={26} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No Job Postings Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            {searchTerm || statusFilter !== "ALL"
                                ? "No postings match your current filter criteria. Try adjusting your query."
                                : "You have not published any job openings yet. Click below to start hiring talent."}
                        </p>
                        <div className="mt-5">
                            {searchTerm || statusFilter !== "ALL" ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("ALL");
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <Link
                                    to="/recruiter/jobs/create"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                                >
                                    <FiPlus size={15} />
                                    Post Your First Opening
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => {
                            const isOpen = job.status === "OPEN";

                            return (
                                <div
                                    key={job.id}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-5"
                                >
                                    {/* Left Details */}
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    isOpen
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {job.status || "OPEN"}
                                            </span>

                                            {job.jobType && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                                    {job.jobType.replace("_", " ")}
                                                </span>
                                            )}

                                            {job.workplaceType && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                                                    {job.workplaceType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h2 className="text-base font-extrabold text-slate-900 leading-tight hover:text-indigo-600 transition">
                                                <Link to={`/recruiter/jobs/${job.id}`}>
                                                    {job.title}
                                                </Link>
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {job.description}
                                            </p>
                                        </div>

                                        {/* Meta row */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <FiMapPin size={13} className="text-slate-400" />
                                                {job.location || "Remote"}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-bold text-slate-900">
                                                <FiDollarSign size={13} className="text-slate-400" />
                                                {formatSalary(job.minSalary, job.maxSalary)}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <FiClock size={13} className="text-slate-400" />
                                                {job.experienceRequired !== undefined ? `${job.experienceRequired}+ Yrs Exp` : "Fresher"}
                                            </span>
                                            {job.applicationDeadline && (
                                                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                                                    <FiCalendar size={13} className="text-slate-400" />
                                                    Deadline: {job.applicationDeadline}
                                                </span>
                                            )}
                                        </div>

                                        {/* Skills tags */}
                                        {job.requiredSkills && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {job.requiredSkills.split(",").slice(0, 5).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                                                    >
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                                {job.requiredSkills.split(",").length > 5 && (
                                                    <span className="text-[10px] text-slate-400 font-medium self-center">
                                                        +{job.requiredSkills.split(",").length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center md:flex-col lg:flex-row gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/50 transition"
                                            title="View opening specifications & pipeline"
                                        >
                                            <FiEye size={15} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/recruiter/applications?jobId=${job.id}`)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
                                            title="View applications for this role"
                                        >
                                            <FiUsers size={14} />
                                            Candidates
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/recruiter/jobs/edit?id=${job.id}`, { state: { job } })}
                                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition"
                                            title="Edit job opening"
                                        >
                                            <FiEdit3 size={15} />
                                        </button>

                                        {isOpen && (
                                            <button
                                                type="button"
                                                onClick={() => setCloseModalJob(job)}
                                                className="p-2 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                                                title="Mark opening as closed"
                                            >
                                                <FiXCircle size={15} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setDeleteModalJob(job)}
                                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                            title="Delete opening permanently"
                                        >
                                            <FiTrash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CONFIRM CLOSE MODAL */}
                {closeModalJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                                <FiAlertCircle size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Close Job Opening?</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Are you sure you want to close <span className="font-semibold text-slate-700">"{closeModalJob.title}"</span>? Job seekers will no longer be able to submit new applications. Existing applicants will remain accessible.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCloseModalJob(null)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmClose}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 transition"
                                >
                                    {actionLoading ? "Closing..." : "Confirm Close"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONFIRM DELETE MODAL */}
                {deleteModalJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                <FiTrash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Delete Job Permanently?</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                This will permanently delete <span className="font-semibold text-slate-700">"{deleteModalJob.title}"</span> and all associated candidate records. This action cannot be reversed.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalJob(null)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition"
                                >
                                    {actionLoading ? "Deleting..." : "Permanently Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default MyJobs;
