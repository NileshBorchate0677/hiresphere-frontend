import { useState } from "react";
import { API_BASE_URL } from "../../utils/constants";
import {
    FiX,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiAward,
    FiExternalLink,
    FiDownload,
    FiCalendar,
    FiDollarSign,
    FiClock,
    FiCheckCircle,
    FiCopy,
    FiSend,
    FiCode
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { callGeminiLLM } from "../../services/aiService";

const RecruiterCandidateDossierModal = ({ candidate, onClose, onShortlist, onScheduleInterview }) => {
    const [activeTab, setActiveTab] = useState("overview"); // overview, experience, education, projects, aiInvite
    const [inviteMode, setInviteMode] = useState("Google Meet (Video Round)");
    const [inviteDate, setInviteDate] = useState("");
    const [inviteDraft, setInviteDraft] = useState("");
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!candidate) return null;

    const candidateName = candidate.fullName || candidate.applicantName || "Candidate";
    const designation = candidate.currentDesignation || candidate.headline || "Software Engineer";
    const company = candidate.currentCompany || "Previous Organization";
    const expYears = candidate.experience !== undefined ? candidate.experience : 0;
    const location = candidate.location || "Not specified";
    const noticePeriod = candidate.noticePeriod || "Serving Notice / Immediate";
    const expectedSalary = candidate.expectedSalary ? `₹${(candidate.expectedSalary / 100000).toFixed(1)} LPA` : "As per company norms";
    const resumeUrl = candidate.resumeUrl;

    const skillsList = candidate.skills
        ? candidate.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const educations = candidate.educations || [];
    const experiences = candidate.experiences || [];
    const projects = candidate.projects || [];

    // AI Interview Invite Generator
    const handleGenerateAIInvite = async () => {
        setIsGeneratingInvite(true);
        try {
            const prompt = `Write a polite, professional technical interview invitation email from an IT Recruiter to a candidate:
Candidate: ${candidateName}
Role Applied/Considered: ${designation}
Interview Format: ${inviteMode}
Suggested Time/Window: ${inviteDate || "This week (flexible timing)"}

Include warm greeting, role interest confirmation, interview round details, instructions to join, and RSVP request. Keep it crisp, corporate, and engaging.`;

            const fallback = () => {
                return `Dear ${candidateName},

Greetings from HireSphere Talent Acquisition Team!

We reviewed your profile and recent engineering credentials for the ${designation} opportunity. Your background in ${skillsList.slice(0, 3).join(", ") || "software development"} closely aligns with the technical milestones we are looking to achieve.

We would love to invite you for a Technical Assessment & Conversation round.

Interview Details:
• Format: ${inviteMode}
• Proposed Date / Window: ${inviteDate || "Upcoming business days (please confirm your availability)"}
• Focus: System architecture, code problem-solving, and practical project discussion

Please let us know your preferred time slots so we can send the calendar invite and meeting link.

Looking forward to speaking with you!

Warm regards,
Talent Acquisition & Hiring Team
HireSphere Enterprise`;
            };

            const result = await callGeminiLLM(prompt, fallback);
            setInviteDraft(result);
            setActiveTab("aiInvite");
        } catch (err) {
            console.error("AI invite generation error:", err);
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    const handleCopyInvite = () => {
        if (!inviteDraft) return;
        navigator.clipboard.writeText(inviteDraft);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-100 my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* MODAL HEADER */}
                <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-600/30 shrink-0">
                            {candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-black tracking-tight">{candidateName}</h2>
                                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-300 border border-purple-400/30">
                                    {noticePeriod}
                                </span>
                                {candidate.status && (
                                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                                        ATS: {candidate.status}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-semibold text-indigo-200">
                                {designation} • {company}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-1">
                                <span className="flex items-center gap-1">
                                    <FiBriefcase size={13} className="text-purple-400" /> {expYears} yrs exp
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiMapPin size={13} className="text-purple-400" /> {location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiDollarSign size={13} className="text-purple-400" /> {expectedSalary}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* TAB NAVIGATION */}
                <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === "overview"
                                ? "border-purple-600 text-purple-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiBriefcase size={14} /> Candidate Overview
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("experience")}
                        className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === "experience"
                                ? "border-purple-600 text-purple-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiClock size={14} /> Work History ({experiences.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("education")}
                        className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === "education"
                                ? "border-purple-600 text-purple-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiAward size={14} /> Education ({educations.length || (candidate.highestQualification ? 1 : 0)})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("projects")}
                        className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === "projects"
                                ? "border-purple-600 text-purple-700 bg-white"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FiCode size={14} /> Projects ({projects.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("aiInvite")}
                        className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            activeTab === "aiInvite"
                                ? "border-purple-600 text-purple-700 bg-white"
                                : "border-transparent text-indigo-600 hover:text-indigo-800"
                        }`}
                    >
                        <HiSparkles size={14} className="text-purple-600" /> AI Interview Invite
                    </button>
                </div>

                {/* TAB CONTENT (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="space-y-6 animate-in fade-in duration-150">
                            {/* CONTACT BAR */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div>
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Email</span>
                                    <span className="font-semibold text-slate-800 break-all">{candidate.email || "Not shared"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Phone</span>
                                    <span className="font-semibold text-slate-800">{candidate.phoneNumber || "Not shared"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Work Mode</span>
                                    <span className="font-semibold text-slate-800">{candidate.preferredWorkMode || "Any (Flexible)"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Notice Period</span>
                                    <span className="font-semibold text-indigo-600">{noticePeriod}</span>
                                </div>
                            </div>

                            {/* SOCIALS & REPOSITORIES */}
                            {(candidate.githubUrl || candidate.linkedinUrl || candidate.portfolioUrl) && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Profiles:</span>
                                    {candidate.linkedinUrl && (
                                        <a
                                            href={candidate.linkedinUrl.startsWith("http") ? candidate.linkedinUrl : `https://${candidate.linkedinUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 flex items-center gap-1 transition"
                                        >
                                            <FiExternalLink size={12} /> LinkedIn Profile
                                        </a>
                                    )}
                                    {candidate.githubUrl && (
                                        <a
                                            href={candidate.githubUrl.startsWith("http") ? candidate.githubUrl : `https://${candidate.githubUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold hover:bg-slate-200 flex items-center gap-1 transition"
                                        >
                                            <FiExternalLink size={12} /> GitHub Repositories
                                        </a>
                                    )}
                                    {candidate.portfolioUrl && (
                                        <a
                                            href={candidate.portfolioUrl.startsWith("http") ? candidate.portfolioUrl : `https://${candidate.portfolioUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 flex items-center gap-1 transition"
                                        >
                                            <FiExternalLink size={12} /> Portfolio Website
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* EXECUTIVE SUMMARY */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Candidate Profile Summary
                                </h4>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                                    {candidate.summary || candidate.bio || "No detailed summary provided by candidate."}
                                </div>
                            </div>

                            {/* SKILLS */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Key Skills & Competencies
                                </h4>
                                {skillsList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {skillsList.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No skills listed.</p>
                                )}
                            </div>

                            {/* COVER LETTER / APPLICANT NOTE (IF PRESENT) */}
                            {candidate.coverLetter && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                                        Applicant Note / Cover Letter
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                        {candidate.coverLetter}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: WORK HISTORY */}
                    {activeTab === "experience" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            {experiences.length > 0 ? (
                                <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
                                    {experiences.map((exp, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow-xs" />
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <h5 className="text-sm font-bold text-slate-900">{exp.designation || "Engineer"}</h5>
                                                        <p className="text-xs font-semibold text-purple-600">{exp.companyName}</p>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                        {exp.startDate || "Joined"} - {exp.isCurrentJob ? "Present" : exp.endDate || "Relieved"}
                                                    </span>
                                                </div>
                                                {exp.location && (
                                                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                        <FiMapPin size={11} /> {exp.location}
                                                    </p>
                                                )}
                                                {exp.responsibilities && (
                                                    <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                                                        {exp.responsibilities}
                                                    </p>
                                                )}
                                                {exp.techStack && (
                                                    <p className="text-[11px] font-semibold text-indigo-700 pt-1">
                                                        Stack: {exp.techStack}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : candidate.currentCompany ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <h5 className="text-sm font-bold text-slate-900">{candidate.currentDesignation || "Current Role"}</h5>
                                    <p className="text-xs font-semibold text-purple-600">{candidate.currentCompany}</p>
                                    <p className="text-xs text-slate-600">Total Industry Track Record: {expYears} years</p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No detailed work experience records added by candidate yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: EDUCATION */}
                    {activeTab === "education" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            {educations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {educations.map((edu, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                            <span className="px-2 py-0.5 rounded bg-purple-100 text-[10px] font-black text-purple-700 uppercase">
                                                {edu.educationLevel || "Degree"}
                                            </span>
                                            <h5 className="text-sm font-bold text-slate-900">{edu.degree}</h5>
                                            <p className="text-xs text-slate-600">{edu.institution || edu.university}</p>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                                                <span>Passing Year: {edu.passingYear || "N/A"}</span>
                                                {edu.score && (
                                                    <span className="font-bold text-emerald-600">
                                                        Score: {edu.score} {edu.scoreType || "%"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : candidate.highestQualification || candidate.collegeName ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                    <span className="px-2 py-0.5 rounded bg-purple-100 text-[10px] font-black text-purple-700 uppercase">
                                        {candidate.highestQualification || "Higher Education"}
                                    </span>
                                    <h5 className="text-sm font-bold text-slate-900">{candidate.course || candidate.highestQualification}</h5>
                                    <p className="text-xs text-slate-600">{candidate.collegeName || "Accredited University"}</p>
                                    {candidate.passingYear && (
                                        <p className="text-[11px] text-slate-500">Graduation Year: {candidate.passingYear}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No formal education records provided.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: PROJECTS */}
                    {activeTab === "projects" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            {projects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {projects.map((proj, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-900">{proj.title}</h5>
                                                {proj.techStack && (
                                                    <p className="text-xs font-semibold text-purple-600 mt-0.5">
                                                        {proj.techStack}
                                                    </p>
                                                )}
                                                {proj.description && (
                                                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                                        {proj.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 text-xs">
                                                {proj.githubUrl && (
                                                    <a
                                                        href={proj.githubUrl.startsWith("http") ? proj.githubUrl : `https://${proj.githubUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        <FiExternalLink size={12} /> Source Code
                                                    </a>
                                                )}
                                                {proj.liveDemoUrl && (
                                                    <a
                                                        href={proj.liveDemoUrl.startsWith("http") ? proj.liveDemoUrl : `https://${proj.liveDemoUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        <FiExternalLink size={12} /> Live Preview
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    No technical projects portfolio submitted by candidate.
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: AI INTERVIEW INVITE GENERATOR */}
                    {activeTab === "aiInvite" && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                                        <HiSparkles className="text-purple-600" />
                                        Naukri-Style AI Interview Call Letter Generator
                                    </h4>
                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                        Draft personalized technical interview invites with one click.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateAIInvite}
                                    disabled={isGeneratingInvite}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 shrink-0 flex items-center gap-1.5"
                                >
                                    <HiSparkles size={14} className={isGeneratingInvite ? "animate-spin" : ""} />
                                    {isGeneratingInvite ? "Generating Invite..." : "Draft / Regenerate"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                                        Interview Format
                                    </label>
                                    <select
                                        value={inviteMode}
                                        onChange={(e) => setInviteMode(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    >
                                        <option value="Google Meet (Virtual Video)">Google Meet (Virtual Video)</option>
                                        <option value="Microsoft Teams Technical Round">Microsoft Teams Technical Round</option>
                                        <option value="In-Person Office Technical Round">In-Person Office Technical Round</option>
                                        <option value="Telephonic Screening">Telephonic Screening</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                                        Proposed Time Slot / Window
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tomorrow at 3:00 PM IST"
                                        value={inviteDate}
                                        onChange={(e) => setInviteDate(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {inviteDraft && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 uppercase">
                                            Generated Invitation Email Draft
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyInvite}
                                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                                        >
                                            {copied ? <FiCheckCircle className="text-emerald-600" /> : <FiCopy />}
                                            {copied ? "Copied!" : "Copy Email"}
                                        </button>
                                    </div>
                                    <textarea
                                        rows={10}
                                        value={inviteDraft}
                                        onChange={(e) => setInviteDraft(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-mono text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    {resumeUrl ? (
                        <a
                            href={resumeUrl.startsWith("http") ? resumeUrl : `${API_BASE_URL}/recruiter/resume/download/${resumeUrl.replace(/^\/?(jobseeker|recruiter)\/resume\/download\//, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
                        >
                            <FiDownload size={14} />
                            Download Resume PDF
                        </a>
                    ) : (
                        <span className="text-xs text-slate-400 italic">No resume PDF uploaded</span>
                    )}

                    <div className="flex items-center gap-2">
                        {activeTab !== "aiInvite" && (
                            <button
                                type="button"
                                onClick={handleGenerateAIInvite}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5"
                            >
                                <HiSparkles size={14} className="text-purple-600" />
                                Draft Interview Invite
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterCandidateDossierModal;
