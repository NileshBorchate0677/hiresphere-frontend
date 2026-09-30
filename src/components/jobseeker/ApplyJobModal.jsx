import { useState } from "react";
import { Link } from "react-router-dom";
import {
    FiX,
    FiFileText,
    FiUploadCloud,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiSend,
    FiZap,
    FiRefreshCw
} from "react-icons/fi";
import { applyForJob } from "../../services/applicationService";
import { uploadResume, getJobSeekerProfile } from "../../services/jobSeekerService";
import { generateAICoverLetter } from "../../utils/aiHelper";
import { API_BASE_URL } from "../../utils/constants";

const ApplyJobModal = ({
    job,
    profile,
    isOpen,
    onClose,
    onSuccess,
    onProfileUpdated
}) => {
    const [coverLetter, setCoverLetter] = useState("");
    const [applying, setApplying] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [applySuccess, setApplySuccess] = useState("");
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [aiGenerating, setAiGenerating] = useState(false);

    // Keep currentProfile synchronized with prop
    if (profile && (!currentProfile || profile.resumeFileName !== currentProfile.resumeFileName)) {
        setCurrentProfile(profile);
    }

    if (!isOpen || !job) return null;

    const jobId = job.id || job.jobId;
    const hasResume = Boolean(
        currentProfile?.resumeUrl || currentProfile?.resumePath || currentProfile?.resumeFileName
    );
    const resumeFileName =
        currentProfile?.resumeFileName || (hasResume ? "Candidate_Profile_Resume.pdf" : null);

    const getFullResumeUrl = () => {
        const path = currentProfile?.resumeUrl || currentProfile?.resumePath;
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
    };

    // AI Cover letter generator
    const handleGenerateAiCoverLetter = () => {
        setAiGenerating(true);
        setTimeout(() => {
            const letter = generateAICoverLetter(job, currentProfile);
            setCoverLetter(letter);
            setAiGenerating(false);
        }, 400);
    };

    // In-modal quick resume upload
    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setApplyError("Please select a PDF file only.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setApplyError("Resume file size must be less than 5MB.");
            return;
        }

        setUploadingResume(true);
        setApplyError("");

        try {
            const res = await uploadResume(file);
            const freshProfile = await getJobSeekerProfile().catch(() => null);
            const updated = freshProfile || {
                ...currentProfile,
                resumeUrl: res.resumeUrl || res.resumePath,
                resumePath: res.resumeUrl || res.resumePath,
                resumeFileName: file.name
            };

            setCurrentProfile(updated);
            if (onProfileUpdated) {
                onProfileUpdated(updated);
            }
        } catch (err) {
            console.error("Resume upload error:", err);
            setApplyError(err?.response?.data?.message || "Failed to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    // Submit Application
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApplying(true);
        setApplyError("");
        setApplySuccess("");

        try {
            const res = await applyForJob(jobId, { coverLetter: coverLetter.trim() });
            setApplySuccess("Application submitted successfully! Recruiter has received your candidacy.");

            if (onSuccess) {
                onSuccess(res || { jobId, status: "APPLIED" });
            }

            setTimeout(() => {
                onClose();
                setApplySuccess("");
                setCoverLetter("");
            }, 1800);
        } catch (err) {
            console.error("Apply error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to submit application. Please ensure your profile is complete.";
            setApplyError(msg);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
                {/* MODAL HEADER */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                            Candidate ATS Application
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                            Apply to {job.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {job.companyName || "Hiring Partner"} • {job.location || "Remote / On-site"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        aria-label="Close apply modal"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* RESUME TRANSPARENCY SECTION (NAUKRI STANDARD) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <FiFileText size={15} className={hasResume ? "text-emerald-600" : "text-amber-600"} />
                            Attached Candidate Resume:
                        </span>

                        {hasResume && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <FiCheckCircle size={11} /> Ready to Forward
                            </span>
                        )}
                    </div>

                    {hasResume ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center border border-red-200">
                                    PDF
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-800 truncate max-w-xs">
                                        {resumeFileName}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        Will be shared directly with the recruiter ATS
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {getFullResumeUrl() && (
                                    <a
                                        href={getFullResumeUrl()}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <FiDownload size={12} />
                                        Preview
                                    </a>
                                )}

                                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer transition">
                                    <FiUploadCloud size={12} />
                                    <span>{uploadingResume ? "Uploading..." : "Replace"}</span>
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
                        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 text-center space-y-2">
                            <p className="text-xs font-bold text-amber-900">
                                No resume attached to your profile yet!
                            </p>
                            <p className="text-[11px] text-amber-700">
                                Upload a PDF resume now so recruiters can review your portfolio.
                            </p>
                            <label className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition">
                                <FiUploadCloud size={14} />
                                <span>{uploadingResume ? "Uploading PDF..." : "Upload Resume PDF Now"}</span>
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

                {/* SUCCESS NOTIFICATION */}
                {applySuccess ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center space-y-2">
                        <FiCheckCircle size={32} className="text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-black text-emerald-900">Application Submitted!</h4>
                        <p className="text-xs font-semibold text-emerald-800">{applySuccess}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {applyError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                                <FiAlertCircle size={15} className="shrink-0" />
                                <span>{applyError}</span>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Cover Letter / Pitch Note (Optional)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAiCoverLetter}
                                    disabled={aiGenerating}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 transition"
                                >
                                    <FiZap size={12} className="text-amber-500" />
                                    <span>{aiGenerating ? "Drafting..." : "✨ AI Write Pitch"}</span>
                                </button>
                            </div>

                            <textarea
                                rows={5}
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Highlight your relevant experience, top projects, and why you are excited about this opening, or click ✨ AI Write Pitch above..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition resize-none leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={applying || uploadingResume}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
                            >
                                <FiSend size={13} />
                                {applying ? "Submitting Application..." : "Submit Application"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ApplyJobModal;
