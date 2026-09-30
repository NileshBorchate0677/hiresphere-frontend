import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/constants";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiBriefcase,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiDollarSign,
    FiFileText,
    FiTrash2,
    FiAlertCircle,
    FiExternalLink
} from "react-icons/fi";
import { getApplicationById, withdrawApplication } from "../../services/applicationService";

const ApplicationDetails = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getApplicationById(applicationId);
                setApplication(data);
            } catch (err) {
                console.error("Failed to load application details:", err);
                setError("Unable to find application record. It may have been withdrawn or removed.");
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            fetchDetails();
        }
    }, [applicationId]);

    const handleConfirmWithdraw = async () => {
        setWithdrawing(true);
        try {
            await withdrawApplication(applicationId);
            navigate("/jobseeker/applications", { replace: true });
        } catch (err) {
            console.error("Withdraw error:", err);
            setError("Failed to withdraw application. Please try again.");
        } finally {
            setWithdrawing(false);
        }
    };

    const getStatusTheme = (status) => {
        switch (status) {
            case "SHORTLISTED":
                return {
                    badge: "bg-purple-100 text-purple-700 border-purple-200",
                    step: 2,
                    label: "Shortlisted for Interview",
                };
            case "ACCEPTED":
                return {
                    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    step: 3,
                    label: "Offer Accepted",
                };
            case "REJECTED":
                return {
                    badge: "bg-rose-100 text-rose-700 border-rose-200",
                    step: -1,
                    label: "Application Closed",
                };
            default:
                return {
                    badge: "bg-sky-100 text-sky-700 border-sky-200",
                    step: 1,
                    label: "Application Submitted",
                };
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans animate-in fade-in duration-300">
            {/* Back button */}
                <div className="flex items-center gap-3">
                    <Link
                        to="/jobseeker/applications"
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                    >
                        <FiArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Application Dossier
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Track evaluation milestones and review submitted materials.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-32 bg-white rounded-3xl border border-slate-200" />
                        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
                    </div>
                ) : error ? (
                    <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
                        <FiAlertCircle size={32} className="mx-auto text-rose-500" />
                        <p className="text-xs font-bold text-rose-800">{error}</p>
                        <Link
                            to="/jobseeker/applications"
                            className="inline-block px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                        >
                            Return to Applications
                        </Link>
                    </div>
                ) : application ? (
                    <div className="space-y-6">
                        {/* Status Timeline Banner */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                                            getStatusTheme(application.status).badge
                                        }`}
                                    >
                                        {application.status || "APPLIED"}
                                    </span>
                                    <h2 className="text-lg font-black text-slate-900 mt-2">
                                        {getStatusTheme(application.status).label}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Application ID: #{application.applicationId} • Submitted on{" "}
                                        {application.appliedAt
                                            ? new Date(application.appliedAt).toLocaleDateString()
                                            : "Recent"}
                                    </p>
                                </div>

                                {application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition"
                                    >
                                        <FiTrash2 size={13} />
                                        Withdraw
                                    </button>
                                )}
                            </div>

                            {/* Timeline steps */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                        Stage 1
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">Application Submitted</p>
                                    <p className="text-[11px] text-slate-500">Profile forwarded to recruiter</p>
                                </div>

                                <div
                                    className={`p-4 rounded-2xl border space-y-1 ${
                                        application.status === "SHORTLISTED" || application.status === "ACCEPTED"
                                            ? "bg-purple-50/70 border-purple-200"
                                            : "bg-slate-50 border-slate-100 opacity-60"
                                    }`}
                                >
                                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                        Stage 2
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">Recruiter Review</p>
                                    <p className="text-[11px] text-slate-500">Shortlisted for interview round</p>
                                </div>

                                <div
                                    className={`p-4 rounded-2xl border space-y-1 ${
                                        application.status === "ACCEPTED"
                                            ? "bg-emerald-50/70 border-emerald-200"
                                            : application.status === "REJECTED"
                                            ? "bg-rose-50/70 border-rose-200"
                                            : "bg-slate-50 border-slate-100 opacity-60"
                                    }`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Stage 3
                                    </span>
                                    <p className="text-xs font-bold text-slate-800">Final Outcome</p>
                                    <p className="text-[11px] text-slate-500">
                                        {application.status === "ACCEPTED"
                                            ? "Hired / Offer Extended"
                                            : application.status === "REJECTED"
                                            ? "Not moving forward"
                                            : "Pending evaluation"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Submission Details */}
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                                Submitted Credentials
                            </h3>

                            {/* Candidate info grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Applicant Name
                                    </span>
                                    <p className="font-bold text-slate-800 text-sm mt-0.5">{application.applicantName}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Contact Email
                                    </span>
                                    <p className="font-semibold text-slate-800 mt-0.5">{application.email}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Phone Number
                                    </span>
                                    <p className="font-semibold text-slate-800 mt-0.5">{application.phoneNumber || "Not provided"}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Experience Benchmark
                                    </span>
                                    <p className="font-semibold text-slate-800 mt-0.5">{application.experience !== undefined ? `${application.experience} Years` : "Fresher"}</p>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            {application.coverLetter && (
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Cover Letter / Personal Pitch
                                    </span>
                                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line mt-1.5">
                                        {application.coverLetter}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {application.skills && (
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Skills Provided
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {application.skills.split(",").map((s, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold"
                                            >
                                                {s.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resume PDF link */}
                            {application.resumeUrl && (
                                <div className="pt-2">
                                    <a
                                        href={application.resumeUrl.startsWith("http") ? application.resumeUrl : `${API_BASE_URL}/jobseeker/resume/download/${application.resumeUrl.replace(/^\/?(jobseeker|recruiter)\/resume\/download\//, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                                    >
                                        <FiFileText size={15} />
                                        View Attached Resume PDF
                                        <FiExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* WITHDRAW MODAL */}
                {withdrawModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                <FiTrash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Withdraw Application?</h3>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                Are you sure you want to withdraw this application? The hiring team will no longer review your profile for this opening.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawModalOpen(false)}
                                    disabled={withdrawing}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmWithdraw}
                                    disabled={withdrawing}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition"
                                >
                                    {withdrawing ? "Withdrawing..." : "Confirm Withdraw"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ApplicationDetails;
