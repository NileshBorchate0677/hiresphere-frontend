import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/constants";
import { Link } from "react-router-dom";
import {
    FiSearch,
    FiFilter,
    FiBriefcase,
    FiMapPin,
    FiDollarSign,
    FiClock,
    FiAward,
    FiExternalLink,
    FiDownload,
    FiRefreshCw,
    FiCheckCircle,
    FiX,
    FiAlertCircle,
    FiSliders,
    FiUsers
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { searchCandidates } from "../../services/recruiterService";
import { getMyJobs } from "../../services/jobService";
import { analyzeCandidateMatchAI } from "../../services/aiService";
import RecruiterCandidateDossierModal from "../../components/recruiter/RecruiterCandidateDossierModal";

const RecruiterCandidates = () => {
    // Search form state
    const [searchFilters, setSearchFilters] = useState({
        skill: "",
        location: "",
        minExp: "",
        maxExp: "",
        designation: "",
        company: "",
        noticePeriod: "",
        workMode: "",
    });

    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    // Active quick chip filter
    const [quickFilter, setQuickFilter] = useState("ALL");

    // Modal state for viewing candidate dossier
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // AI Match Modal state
    const [aiMatchCandidate, setAiMatchCandidate] = useState(null);
    const [selectedJobIdForMatch, setSelectedJobIdForMatch] = useState("");
    const [isAiCalculating, setIsAiCalculating] = useState(false);
    const [aiMatchResult, setAiMatchResult] = useState(null);

    // Initial Load: Fetch candidate pool and recruiter's active jobs
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [candidatesData, jobsData] = await Promise.all([
                    searchCandidates({}),
                    getMyJobs().catch(() => []),
                ]);
                setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
                const activeJobsList = Array.isArray(jobsData)
                    ? jobsData.filter((j) => j.status === "OPEN" || !j.status)
                    : [];
                setJobs(activeJobsList);
                if (activeJobsList.length > 0) {
                    setSelectedJobIdForMatch(String(activeJobsList[0].id));
                }
            } catch (err) {
                console.error("Failed to load initial candidates:", err);
                setError("Unable to retrieve candidate pool. Please verify network connectivity.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Handle Search Submit
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setSearching(true);
        setError("");
        try {
            const data = await searchCandidates(searchFilters);
            setCandidates(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Search failed:", err);
            setError("Failed to execute search. Please adjust filters.");
        } finally {
            setSearching(false);
        }
    };

    // Reset filters
    const handleReset = async () => {
        const emptyFilters = {
            skill: "",
            location: "",
            minExp: "",
            maxExp: "",
            designation: "",
            company: "",
            noticePeriod: "",
            workMode: "",
        };
        setSearchFilters(emptyFilters);
        setQuickFilter("ALL");
        setSearching(true);
        try {
            const data = await searchCandidates({});
            setCandidates(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Reset failed:", err);
        } finally {
            setSearching(false);
        }
    };

    // Filter change handler
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Quick filter chip handler
    const applyQuickFilter = (type) => {
        setQuickFilter(type);
        const newFilters = { ...searchFilters };
        if (type === "ALL") {
            newFilters.minExp = "";
            newFilters.maxExp = "";
            newFilters.noticePeriod = "";
            newFilters.workMode = "";
        } else if (type === "IMMEDIATE") {
            newFilters.noticePeriod = "Immediate";
        } else if (type === "FRESHER") {
            newFilters.minExp = "0";
            newFilters.maxExp = "2";
        } else if (type === "MID") {
            newFilters.minExp = "3";
            newFilters.maxExp = "5";
        } else if (type === "SENIOR") {
            newFilters.minExp = "5";
            newFilters.maxExp = "";
        } else if (type === "REMOTE") {
            newFilters.workMode = "Remote";
        }
        setSearchFilters(newFilters);
        searchCandidates(newFilters).then((res) => {
            setCandidates(Array.isArray(res) ? res : []);
        });
    };

    // Run AI Match Fit against selected job
    const handleRunAiMatch = async () => {
        if (!aiMatchCandidate || !selectedJobIdForMatch) return;
        const targetJob = jobs.find((j) => String(j.id) === String(selectedJobIdForMatch));
        if (!targetJob) return;

        setIsAiCalculating(true);
        try {
            const result = await analyzeCandidateMatchAI({
                candidate: {
                    fullName: aiMatchCandidate.fullName,
                    experience: aiMatchCandidate.experience,
                    skills: aiMatchCandidate.skills,
                },
                job: {
                    title: targetJob.title,
                    experienceRequired: targetJob.experienceRequired,
                    requiredSkills: targetJob.requiredSkills,
                },
            });
            setAiMatchResult({
                ...result,
                jobTitle: targetJob.title,
                candidateName: aiMatchCandidate.fullName,
            });
        } catch (err) {
            console.error("AI Match error:", err);
        } finally {
            setIsAiCalculating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
            {/* HERO BANNER */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10">
                <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                                <HiSparkles className="text-purple-400" /> Naukri Resdex Talent Search
                            </span>
                            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                                Live Database
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Talent Pool & Candidate Sourcing
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                            Directly search and screen thousands of tech professionals by skills, experience, location, and notice period with AI-powered match fit.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/recruiter/jobs/create"
                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
                        >
                            + Post New Job Opening
                        </Link>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
                <form onSubmit={handleSearch} className="space-y-4">
                    {/* Primary Row: Skills & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6 relative">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Keywords / Key Skills
                            </label>
                            <div className="relative">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    name="skill"
                                    value={searchFilters.skill}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Java, React.js, Python, AWS, Docker..."
                                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-4 relative">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Preferred Location / City
                            </label>
                            <div className="relative">
                                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    name="location"
                                    value={searchFilters.location}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Pune, Bengaluru, Mumbai, Remote..."
                                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex items-end">
                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                            >
                                <FiSearch size={14} className={searching ? "animate-spin" : ""} />
                                {searching ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>

                    {/* Secondary Row: Experience, Designation, Notice Period, Work Mode */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Min Exp (Yrs)
                            </label>
                            <input
                                type="number"
                                name="minExp"
                                min="0"
                                max="30"
                                value={searchFilters.minExp}
                                onChange={handleFilterChange}
                                placeholder="0"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Max Exp (Yrs)
                            </label>
                            <input
                                type="number"
                                name="maxExp"
                                min="0"
                                max="30"
                                value={searchFilters.maxExp}
                                onChange={handleFilterChange}
                                placeholder="Any"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Designation / Role
                            </label>
                            <input
                                type="text"
                                name="designation"
                                value={searchFilters.designation}
                                onChange={handleFilterChange}
                                placeholder="e.g. Backend Dev"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Current Company
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={searchFilters.company}
                                onChange={handleFilterChange}
                                placeholder="e.g. TCS, Infosys"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                Notice Period
                            </label>
                            <select
                                name="noticePeriod"
                                value={searchFilters.noticePeriod}
                                onChange={handleFilterChange}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option value="">All Notices</option>
                                <option value="Immediate">Immediate / Serving</option>
                                <option value="15 Days">15 Days or less</option>
                                <option value="30 Days">30 Days (1 Month)</option>
                                <option value="60 Days">60 Days (2 Months)</option>
                                <option value="90 Days">90 Days (3 Months)</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full rounded-xl border border-slate-200 hover:bg-slate-100 py-2 text-xs font-bold text-slate-600 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </form>

                {/* Quick Filters Pill Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                        Quick Tags:
                    </span>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("ALL")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "ALL"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        All Candidates ({candidates.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("IMMEDIATE")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "IMMEDIATE"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        ⚡ Immediate Joiners
                    </button>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("FRESHER")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "FRESHER"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        🎓 0-2 Yrs Experience
                    </button>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("MID")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "MID"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        💼 3-5 Yrs Experience
                    </button>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("SENIOR")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "SENIOR"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        👑 5+ Yrs Leads
                    </button>
                    <button
                        type="button"
                        onClick={() => applyQuickFilter("REMOTE")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                            quickFilter === "REMOTE"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        🏠 Remote Ready
                    </button>
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <FiAlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* RESULTS LIST */}
            {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                    <div className="mx-auto w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-600">Querying HireSphere Talent Database...</p>
                </div>
            ) : candidates.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center font-bold text-2xl">
                        <FiUsers />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900">No candidates found for these filters</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Try expanding your skill search terms or resetting the experience and location filters.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span className="font-bold text-slate-700">
                            Showing {candidates.length} active candidates
                        </span>
                        <span>Resdex Talent Sourcing</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {candidates.map((cand) => {
                            const candName = cand.fullName || "Candidate";
                            const role = cand.currentDesignation || cand.headline || "Software Engineer";
                            const comp = cand.currentCompany || "Previous Tech Employer";
                            const exp = cand.experience !== undefined ? cand.experience : 0;
                            const loc = cand.location || "India";
                            const notice = cand.noticePeriod || "Immediate / Serving Notice";
                            const skillsArr = cand.skills
                                ? cand.skills.split(",").map((s) => s.trim()).filter(Boolean)
                                : [];

                            return (
                                <div
                                    key={cand.jobSeekerProfileId || cand.id}
                                    className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all hover:border-purple-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
                                >
                                    {/* Left: Avatar & Basic Information */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0 group-hover:scale-105 transition-transform">
                                            {candName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-extrabold text-slate-900 truncate">
                                                    <Link
                                                        to={`/recruiter/candidates/${cand.jobSeekerProfileId || cand.id}`}
                                                        className="hover:text-purple-600 transition"
                                                    >
                                                        {candName}
                                                    </Link>
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase border border-purple-200">
                                                    {notice}
                                                </span>
                                                {cand.highestQualification && (
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                        {cand.highestQualification}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs font-semibold text-purple-700">
                                                {role} {comp ? `• ${comp}` : ""}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <FiBriefcase size={13} className="text-slate-400" />
                                                    {exp} {exp === 1 ? "year" : "years"} experience
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <FiMapPin size={13} className="text-slate-400" />
                                                    {loc}
                                                </span>
                                                {cand.expectedSalary && (
                                                    <span className="flex items-center gap-1 font-medium text-emerald-700">
                                                        <FiDollarSign size={13} />
                                                        Exp. CTC: ₹{(cand.expectedSalary / 100000).toFixed(1)} LPA
                                                    </span>
                                                )}
                                            </div>

                                            {/* Skills Tags */}
                                            {skillsArr.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {skillsArr.slice(0, 6).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] font-semibold"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {skillsArr.length > 6 && (
                                                        <span className="px-2 py-1 rounded-lg text-slate-400 text-[11px]">
                                                            +{skillsArr.length - 6} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                        {/* AI Match Fit Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAiMatchCandidate(cand);
                                                setAiMatchResult(null);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition shadow-xs"
                                        >
                                            <HiSparkles size={14} className="text-purple-600" />
                                            <span>AI Match Fit</span>
                                        </button>

                                        {/* View Dossier Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCandidate(cand)}
                                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/20"
                                        >
                                            <FiUsers size={14} />
                                            <span>View Dossier</span>
                                        </button>

                                        {/* Resume PDF */}
                                        {cand.resumeUrl && (
                                            <a
                                                href={cand.resumeUrl.startsWith("http") ? cand.resumeUrl : `${API_BASE_URL}/recruiter/resume/download/${cand.resumeUrl.replace(/^\/?(jobseeker|recruiter)\/resume\/download\//, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                                            >
                                                <FiDownload size={13} />
                                                <span>Resume PDF</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CANDIDATE DOSSIER MODAL */}
            {selectedCandidate && (
                <RecruiterCandidateDossierModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                />
            )}

            {/* AI MATCH FIT MODAL */}
            {aiMatchCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <HiSparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Naukri AI Match Assessment
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Assessing fit for {aiMatchCandidate.fullName}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setAiMatchCandidate(null);
                                    setAiMatchResult(null);
                                }}
                                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Select Job to Test Against */}
                        <div className="space-y-1.5 text-xs">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                Select Opening to Compare Fit Against
                            </label>
                            {jobs.length > 0 ? (
                                <select
                                    value={selectedJobIdForMatch}
                                    onChange={(e) => {
                                        setSelectedJobIdForMatch(e.target.value);
                                        setAiMatchResult(null);
                                    }}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                >
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} ({job.experienceRequired} yrs exp req)
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">
                                    You have no open job postings to benchmark against. Please post a job opening first.
                                </div>
                            )}
                        </div>

                        {/* Calculate Trigger */}
                        {!aiMatchResult && jobs.length > 0 && (
                            <button
                                type="button"
                                onClick={handleRunAiMatch}
                                disabled={isAiCalculating}
                                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                            >
                                <HiSparkles size={16} className={isAiCalculating ? "animate-spin" : ""} />
                                {isAiCalculating ? "Evaluating Candidate Fit with AI..." : "Compute AI Match Score"}
                            </button>
                        )}

                        {/* Result Display */}
                        {aiMatchResult && (
                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                                            Fit Assessment for {aiMatchResult.jobTitle}
                                        </span>
                                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                                            {aiMatchResult.recommendation}
                                        </p>
                                    </div>
                                    <div className="text-3xl font-black text-purple-700">
                                        {aiMatchResult.score}%
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                                        ✓ Core Strengths
                                    </span>
                                    <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                                        {aiMatchResult.strengths}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                                        ⚠ Areas of Inquiry
                                    </span>
                                    <p className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                                        {aiMatchResult.skillGaps}
                                    </p>
                                </div>

                                {aiMatchResult.insights && (
                                    <p className="text-[11px] text-slate-500 italic">
                                        {aiMatchResult.insights}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setAiMatchCandidate(null);
                                    setAiMatchResult(null);
                                }}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterCandidates;
