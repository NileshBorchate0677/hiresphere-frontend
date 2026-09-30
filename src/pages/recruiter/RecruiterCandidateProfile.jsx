import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/constants";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FiArrowLeft,
    FiUser,
    FiBriefcase,
    FiBookOpen,
    FiCode,
    FiMapPin,
    FiDollarSign,
    FiClock,
    FiMail,
    FiPhone,
    FiDownload,
    FiCalendar,
    FiCheckCircle,
    FiExternalLink,
    FiFileText,
    FiPrinter,
    FiSend,
    FiCopy,
    FiCheck
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { getCandidateProfileById } from "../../services/recruiterService";
import { getMyJobs } from "../../services/jobService";
import { analyzeCandidateMatchAI, callGeminiLLM } from "../../services/aiService";

const RecruiterCandidateProfile = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview"); // overview | experience | education | projects | ai_invite

    // AI Fit & Match Modal
    const [jobs, setJobs] = useState([]);
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [fitResult, setFitResult] = useState(null);
    const [evaluatingFit, setEvaluatingFit] = useState(false);

    // AI Call Letter Generator
    const [callLetterJobTitle, setCallLetterJobTitle] = useState("");
    const [interviewMode, setInterviewMode] = useState("VIDEO");
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [customNote, setCustomNote] = useState("");
    const [generatedCallLetter, setGeneratedCallLetter] = useState(null);
    const [generatingLetter, setGeneratingLetter] = useState(false);
    const [copiedLetter, setCopiedLetter] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getCandidateProfileById(candidateId);
                setCandidate(data);
                if (data.desiredJobTitle) {
                    setCallLetterJobTitle(data.desiredJobTitle);
                }
            } catch (err) {
                console.error("Failed to load candidate profile:", err);
                setError("Unable to find candidate profile in talent database. It may have been removed or set to private.");
            } finally {
                setLoading(false);
            }
        };

        const fetchJobs = async () => {
            try {
                const jobList = await getMyJobs();
                const list = Array.isArray(jobList) ? jobList : [];
                setJobs(list);
                if (list.length > 0) {
                    setSelectedJob(list[0]);
                    if (!callLetterJobTitle) {
                        setCallLetterJobTitle(list[0].title);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch recruiter jobs:", e);
            }
        };

        if (candidateId) {
            fetchCandidate();
            fetchJobs();
        }
    }, [candidateId]);

    // Handle AI Candidate Fit
    const handleEvaluateFit = async (jobToEvaluate) => {
        const targetJob = jobToEvaluate || selectedJob;
        if (!targetJob || !candidate) return;
        setEvaluatingFit(true);
        try {
            const result = await analyzeCandidateMatchAI({
                job: targetJob,
                candidate: {
                    fullName: candidate.fullName,
                    skills: candidate.skills || candidate.itSkills,
                    experience: candidate.experienceYears || candidate.totalExperienceYears,
                },
            });
            setFitResult(result);
        } catch (e) {
            console.error("AI evaluation failed:", e);
        } finally {
            setEvaluatingFit(false);
        }
    };

    // Handle AI Call Letter Generation
    const handleGenerateCallLetter = async () => {
        if (!candidate) return;
        setGeneratingLetter(true);
        try {
            const prompt = `Write an official, warm, and professional interview invitation letter from a corporate recruiter to candidate ${candidate.fullName || "Candidate"} for the position of ${callLetterJobTitle || "Technical Role"}.
Interview Format: ${interviewMode}
Proposed Date & Time: ${interviewDate || "Next week"}
Additional Note: ${customNote || "We were impressed by your background."}

Return clear subject line and body text.`;

            const body = await callGeminiLLM(prompt, () => {
                return `Dear ${candidate.fullName || "Candidate"},

Thank you for your interest in joining our engineering team. We recently reviewed your professional background and accomplishments, and we were very impressed by your domain expertise and career trajectory.

We would like to formally invite you for a ${interviewMode === "VIDEO" ? "technical video discussion" : interviewMode === "PHONE" ? "telephonic screening" : "face-to-face interview"} for the ${callLetterJobTitle || "Software Engineer"} position.

Proposed Schedule:
• Format: ${interviewMode === "VIDEO" ? "Video Conference (Google Meet / Teams)" : interviewMode === "PHONE" ? "Telephonic Round" : "Office Visit"}
• Proposed Date & Time: ${interviewDate || "To be confirmed based on your availability"}
${customNote ? `• Note from Hiring Manager: ${customNote}` : ""}

Please confirm your availability by replying to this email or suggesting an alternative slot that fits your schedule.

Warm regards,
Talent Acquisition & Hiring Team`;
            });

            setGeneratedCallLetter({
                subject: `Interview Invitation: ${callLetterJobTitle || "Role"} at HireSphere Enterprise`,
                body,
            });
        } catch (e) {
            console.error("Failed to generate call letter:", e);
        } finally {
            setGeneratingLetter(false);
        }
    };

    const handleCopyLetter = () => {
        if (!generatedCallLetter) return;
        navigator.clipboard.writeText(
            `Subject: ${generatedCallLetter.subject}\n\n${generatedCallLetter.body}`
        );
        setCopiedLetter(true);
        setTimeout(() => setCopiedLetter(false), 2500);
    };

    const formatSalary = (amt) => {
        if (!amt) return "Undisclosed";
        return `₹${(amt / 100000).toFixed(1)} LPA`;
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-20 text-center text-xs font-semibold text-slate-400">
                <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Loading candidate profile dossier & career records...</p>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4 font-sans">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <FiUser size={22} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Candidate Dossier Unavailable</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                    {error || "The requested candidate profile is no longer available in the talent search database."}
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/recruiter/candidates")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                >
                    <FiArrowLeft size={14} />
                    Back to Talent Search (Resdex)
                </button>
            </div>
        );
    }

    const initials = (candidate.fullName || "Candidate")
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const skillsList = (candidate.skills || candidate.itSkills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const educations = candidate.educations || candidate.educationList || [];
    const experiences = candidate.experiences || candidate.experienceList || [];
    const projects = candidate.projects || candidate.projectList || [];
    const resumeUrl = candidate.resumeUrl;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
            {/* TOP BAR / BREADCRUMB */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-600 transition self-start"
                >
                    <FiArrowLeft size={14} />
                    Back
                </button>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    >
                        <FiPrinter size={13} />
                        Print Dossier
                    </button>

                    {resumeUrl && (
                        <a
                            href={resumeUrl.startsWith("http") ? resumeUrl : `${API_BASE_URL}/recruiter/resume/download/${resumeUrl.replace(/^\/?(jobseeker|recruiter)\/resume\/download\//, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
                        >
                            <FiDownload size={13} />
                            Resume PDF
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setMatchModalOpen(true);
                            if (jobs.length > 0 && !fitResult) {
                                handleEvaluateFit(jobs[0]);
                            }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:from-purple-500 hover:to-indigo-500 transition shadow-sm"
                    >
                        <HiSparkles size={14} />
                        AI Job Match Fit
                    </button>
                </div>
            </div>

            {/* HERO IDENTITY CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
                            {initials}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {candidate.fullName}
                                </h1>
                                {candidate.noticePeriod && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                        {candidate.noticePeriod}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm font-semibold text-purple-700">
                                {candidate.currentDesignation || candidate.designation || "Software Professional"}
                                {candidate.currentCompany ? ` @ ${candidate.currentCompany}` : ""}
                            </p>

                            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <FiMapPin size={13} className="text-slate-400" />
                                    {candidate.currentCity || candidate.location || "Location not disclosed"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <FiClock size={13} className="text-slate-400" />
                                    {candidate.experienceYears != null ? `${candidate.experienceYears} Years Exp` : "Fresher"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <FiDollarSign size={13} className="text-slate-400" />
                                    Expected: {formatSalary(candidate.expectedSalary)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto">
                        {candidate.email && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                <FiMail size={12} className="text-purple-600" />
                                {candidate.email}
                            </span>
                        )}
                        {candidate.phone && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                <FiPhone size={12} className="text-purple-600" />
                                {candidate.phone}
                            </span>
                        )}
                    </div>
                </div>

                {/* PROFILE SUMMARY BIO */}
                {candidate.bio && (
                    <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                        <p className="font-bold text-slate-900 mb-1">Executive Summary</p>
                        <p className="whitespace-pre-line">{candidate.bio}</p>
                    </div>
                )}
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {[
                    { id: "overview", label: "Skills & Overview", icon: FiUser },
                    { id: "experience", label: `Work History (${experiences.length})`, icon: FiBriefcase },
                    { id: "education", label: `Education (${educations.length})`, icon: FiBookOpen },
                    { id: "projects", label: `Projects (${projects.length})`, icon: FiCode },
                    { id: "ai_invite", label: "AI Interview Invite", icon: HiSparkles },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                isActive
                                    ? "bg-purple-600 text-white shadow-xs"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            <Icon size={13} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SKILLS CARD */}
                    <div className="md:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900">Technical Skills & Expertise</h3>
                            <span className="text-[11px] text-slate-400 font-semibold">{skillsList.length} skills listed</span>
                        </div>
                        {skillsList.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No specific skills enumerated.</p>
                        ) : (
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
                        )}
                    </div>

                    {/* CANDIDATE QUICK METRICS */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                            Candidate Snapshot
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Notice Period:</span>
                                <span className="font-bold text-slate-800">{candidate.noticePeriod || "Immediate"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Experience:</span>
                                <span className="font-bold text-slate-800">{candidate.experienceYears != null ? `${candidate.experienceYears} Yrs` : "N/A"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Expected CTC:</span>
                                <span className="font-bold text-slate-800">{formatSalary(candidate.expectedSalary)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Work Mode:</span>
                                <span className="font-bold text-slate-800">{candidate.workMode || "Flexible / Hybrid"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Resume Attached:</span>
                                <span className={`font-bold ${resumeUrl ? "text-emerald-600" : "text-slate-400"}`}>
                                    {resumeUrl ? "Yes (PDF)" : "No"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "experience" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Work Experience Timeline
                    </h3>
                    {experiences.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                            <FiBriefcase size={22} className="mx-auto text-slate-300" />
                            <p>No prior work experience recorded.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {experiences.map((exp, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-purple-200 space-y-1.5">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-900">{exp.designation || exp.title}</h4>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            {exp.startDate || "Past"} - {exp.endDate || "Present"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-purple-700">{exp.companyName || exp.company}</p>
                                    {exp.description && (
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pt-1">
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "education" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Academic Background & Qualifications
                    </h3>
                    {educations.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                            <FiBookOpen size={22} className="mx-auto text-slate-300" />
                            <p>No educational credentials recorded.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {educations.map((edu, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                    <h4 className="text-xs font-bold text-slate-900">{edu.degree || edu.qualification}</h4>
                                    <p className="text-xs text-purple-700 font-semibold">{edu.collegeName || edu.institution}</p>
                                    <p className="text-[11px] text-slate-500">
                                        Batch: {edu.passingYear || edu.year || "Completed"} {edu.percentage && `• Score: ${edu.percentage}%`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "projects" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Technical & Academic Projects Portfolio
                    </h3>
                    {projects.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                            <FiCode size={22} className="mx-auto text-slate-300" />
                            <p>No projects attached to this profile.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {projects.map((proj, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-900">{proj.projectTitle || proj.title}</h4>
                                        {proj.projectLink && (
                                            <a
                                                href={proj.projectLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-purple-600 hover:text-purple-800"
                                            >
                                                <FiExternalLink size={13} />
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies && (
                                        <p className="text-[11px] text-purple-700 font-semibold">{proj.technologies}</p>
                                    )}
                                    {proj.description && (
                                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{proj.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "ai_invite" && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <HiSparkles size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                1-Click AI Interview Call Letter & Outreach Generator
                            </h3>
                            <p className="text-xs text-slate-500">
                                Draft personalized interview invitations tailored for {candidate.fullName}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Job Role</label>
                            <input
                                type="text"
                                value={callLetterJobTitle}
                                onChange={(e) => setCallLetterJobTitle(e.target.value)}
                                placeholder="e.g. Senior Java Backend Developer"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Interview Round Mode</label>
                            <select
                                value={interviewMode}
                                onChange={(e) => setInterviewMode(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="VIDEO">Google Meet / MS Teams Video</option>
                                <option value="PHONE">Telephonic Technical Screening</option>
                                <option value="FACE_TO_FACE">In-Person Office Discussion</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Proposed Date / Window</label>
                            <input
                                type="text"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                placeholder="e.g. Next Tuesday, 3:00 PM IST"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Special Recruiter Note (Optional)</label>
                        <input
                            type="text"
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            placeholder="e.g. We were very impressed by your microservices project."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleGenerateCallLetter}
                            disabled={generatingLetter}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:from-purple-500 hover:to-indigo-500 transition shadow-xs disabled:opacity-50"
                        >
                            <HiSparkles size={14} />
                            {generatingLetter ? "Drafting AI Invitation..." : "Generate Interview Letter"}
                        </button>
                    </div>

                    {generatedCallLetter && (
                        <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/30 p-5 space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                                <span className="text-xs font-bold text-purple-900">
                                    Subject: {generatedCallLetter.subject}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyLetter}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-700 hover:bg-purple-50 transition"
                                >
                                    {copiedLetter ? <FiCheck size={12} className="text-emerald-600" /> : <FiCopy size={12} />}
                                    {copiedLetter ? "Copied!" : "Copy Text"}
                                </button>
                            </div>
                            <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-4 rounded-xl border border-purple-100">
                                {generatedCallLetter.body}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI MATCH FIT MODAL */}
            {matchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <HiSparkles size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">AI Candidate Match Fit</h3>
                                    <p className="text-[11px] text-slate-500">Compare with your active openings</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMatchModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {jobs.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-amber-50 text-amber-800 text-xs">
                                You don't have any active job openings posted yet. Post a job first to test candidate match fit.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-slate-700">Select Job Opening:</label>
                                <select
                                    value={selectedJob?.id || ""}
                                    onChange={(e) => {
                                        const j = jobs.find((x) => String(x.id) === e.target.value);
                                        setSelectedJob(j);
                                        handleEvaluateFit(j);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                                >
                                    {jobs.map((j) => (
                                        <option key={j.id} value={j.id}>
                                            {j.title} ({j.location || "Remote"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {evaluatingFit ? (
                            <div className="py-8 text-center text-xs font-semibold text-purple-600">
                                <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p>Analyzing skills, experience, and role alignment...</p>
                            </div>
                        ) : fitResult ? (
                            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-700">Fitment Score:</span>
                                        <span className="text-xs text-slate-400 block font-normal">Based on skills & exp</span>
                                    </div>
                                    <span className="text-2xl font-black text-purple-700">
                                        {fitResult.score || fitResult.matchScore || 85}%
                                    </span>
                                </div>

                                {fitResult.summary && (
                                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                                        {fitResult.summary}
                                    </p>
                                )}
                            </div>
                        ) : null}

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setMatchModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterCandidateProfile;
