import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    FiSearch,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiFilter,
    FiX,
    FiBookmark,
    FiArrowRight,
    FiCheck
} from "react-icons/fi";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { getAllJobs } from "../../services/jobService";
import { saveJob, removeSavedJob, getMySavedJobs } from "../../services/savedJobService";
import { useAuth } from "../../context/AuthContext";

const JobSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated, userRole } = useAuth();
    const isJobSeeker = userRole === "JOB_SEEKER";

    const [jobs, setJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Filter states
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [location, setLocation] = useState(searchParams.get("location") || "");
    const [selectedWorkplace, setSelectedWorkplace] = useState(searchParams.get("workplace") || "ALL");
    const [selectedJobType, setSelectedJobType] = useState("ALL");
    const [selectedExp, setSelectedExp] = useState("ALL");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [jobsData, savedData] = await Promise.all([
                    getAllJobs().catch(() => []),
                    isAuthenticated && isJobSeeker ? getMySavedJobs().catch(() => []) : Promise.resolve([])
                ]);

                const jobList = Array.isArray(jobsData) ? jobsData : jobsData?.data || [];
                setJobs(jobList);

                if (Array.isArray(savedData)) {
                    setSavedJobIds(new Set(savedData.map((s) => s.jobId)));
                }
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [isAuthenticated, isJobSeeker]);

    // Handle Bookmark Toggle
    const handleToggleSave = async (jobId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated || !isJobSeeker) {
            alert("Please sign in as a Job Seeker to bookmark this job.");
            return;
        }

        const isSaved = savedJobIds.has(jobId);
        try {
            if (isSaved) {
                await removeSavedJob(jobId);
                setSavedJobIds((prev) => {
                    const next = new Set(prev);
                    next.delete(jobId);
                    return next;
                });
            } else {
                await saveJob(jobId);
                setSavedJobIds((prev) => new Set(prev).add(jobId));
            }
        } catch (err) {
            console.error("Toggle bookmark error:", err);
        }
    };

    // Client-side filtering across live jobs
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            // Keyword filter
            if (keyword.trim()) {
                const q = keyword.toLowerCase();
                const titleMatch = (job.title || "").toLowerCase().includes(q);
                const descMatch = (job.description || "").toLowerCase().includes(q);
                const skillMatch = (job.requiredSkills || "").toLowerCase().includes(q);
                const companyMatch = (job.companyName || "").toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !skillMatch && !companyMatch) return false;
            }

            // Location filter
            if (location.trim()) {
                const loc = location.toLowerCase();
                const locMatch = (job.location || "").toLowerCase().includes(loc);
                if (!locMatch) return false;
            }

            // Workplace filter
            if (selectedWorkplace !== "ALL") {
                if (String(job.workplaceType || "").toUpperCase() !== selectedWorkplace) return false;
            }

            // Job Type filter
            if (selectedJobType !== "ALL") {
                if (String(job.jobType || "").toUpperCase() !== selectedJobType) return false;
            }

            // Experience filter
            if (selectedExp !== "ALL") {
                const exp = job.experienceRequired != null ? Number(job.experienceRequired) : 0;
                if (selectedExp === "FRESHER" && exp > 0) return false;
                if (selectedExp === "1-3" && (exp < 1 || exp > 3)) return false;
                if (selectedExp === "3-5" && (exp < 3 || exp > 5)) return false;
                if (selectedExp === "5+" && exp < 5) return false;
            }

            return true;
        });
    }, [jobs, keyword, location, selectedWorkplace, selectedJobType, selectedExp]);

    const formatSalary = (min, max) => {
        if (!min && !max) return "Undisclosed";
        const minLPA = min ? (min / 100000).toFixed(1) : null;
        const maxLPA = max ? (max / 100000).toFixed(1) : null;
        if (minLPA && maxLPA) return `₹${minLPA} - ₹${maxLPA} LPA`;
        if (minLPA) return `From ₹${minLPA} LPA`;
        return `Up to ₹${maxLPA} LPA`;
    };

    const clearFilters = () => {
        setKeyword("");
        setLocation("");
        setSelectedWorkplace("ALL");
        setSelectedJobType("ALL");
        setSelectedExp("ALL");
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            {/* TOP COMPACT SEARCH BAR */}
            <div className="border-b border-slate-200/80 bg-white py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Job title, designation, or skill..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                    </div>

                    <div className="relative flex-1 w-full">
                        <FiMapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, region, or Remote..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileFilterOpen(true)}
                        className="sm:hidden flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                    >
                        <FiFilter size={14} />
                        Filter Openings
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA: 2-COLUMN SPLIT */}
            <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-start gap-8">
                    {/* LEFT FILTER SIDEBAR (DESKTOP) */}
                    <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <FiFilter size={14} className="text-indigo-600" />
                                    Refine Results
                                </h3>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                                >
                                    Reset All
                                </button>
                            </div>

                            {/* WORKPLACE FLEXIBILITY */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-800">Workplace</label>
                                <div className="space-y-1.5 text-xs">
                                    {[
                                        { val: "ALL", label: "All Environments" },
                                        { val: "REMOTE", label: "Fully Remote" },
                                        { val: "HYBRID", label: "Hybrid" },
                                        { val: "ON_SITE", label: "On-Site / Office" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setSelectedWorkplace(opt.val)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
                                                selectedWorkplace === opt.val
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {selectedWorkplace === opt.val && <FiCheck size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* EMPLOYMENT TYPE */}
                            <div className="space-y-2.5 border-t border-slate-100 pt-4">
                                <label className="block text-xs font-bold text-slate-800">Job Type</label>
                                <div className="space-y-1.5 text-xs">
                                    {[
                                        { val: "ALL", label: "All Types" },
                                        { val: "FULL_TIME", label: "Full Time" },
                                        { val: "PART_TIME", label: "Part Time" },
                                        { val: "CONTRACT", label: "Contract" },
                                        { val: "INTERNSHIP", label: "Internship" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setSelectedJobType(opt.val)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
                                                selectedJobType === opt.val
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {selectedJobType === opt.val && <FiCheck size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* EXPERIENCE LEVEL */}
                            <div className="space-y-2.5 border-t border-slate-100 pt-4">
                                <label className="block text-xs font-bold text-slate-800">Experience</label>
                                <div className="space-y-1.5 text-xs">
                                    {[
                                        { val: "ALL", label: "Any Experience" },
                                        { val: "FRESHER", label: "Fresher (0 Yrs)" },
                                        { val: "1-3", label: "1 - 3 Years" },
                                        { val: "3-5", label: "3 - 5 Years" },
                                        { val: "5+", label: "5+ Years (Senior)" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.val}
                                            type="button"
                                            onClick={() => setSelectedExp(opt.val)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition ${
                                                selectedExp === opt.val
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span>{opt.label}</span>
                                            {selectedExp === opt.val && <FiCheck size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT JOB RESULTS STREAM */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Showing {filteredJobs.length} {filteredJobs.length === 1 ? "Opening" : "Openings"}
                            </span>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center text-xs font-semibold text-slate-400">
                                Loading live vacancies from database...
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                    <FiBriefcase size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">No Openings Match Your Filters</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                                    Try clearing selected filters or searching with different keywords.
                                </p>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredJobs.map((job) => {
                                    const jobId = job.jobId || job.id;
                                    const isSaved = savedJobIds.has(jobId);
                                    const companyName = job.companyName || "Hiring Partner";

                                    return (
                                        <div
                                            key={jobId}
                                            className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                        >
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                                                            {companyName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                to={`/jobs/details/${jobId}`}
                                                                className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition"
                                                            >
                                                                {job.title}
                                                            </Link>
                                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                                {companyName}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Bookmark Save Icon */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleToggleSave(jobId, e)}
                                                        className={`p-2 rounded-xl transition ${
                                                            isSaved
                                                                ? "bg-indigo-50 text-indigo-600"
                                                                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
                                                        }`}
                                                        title={isSaved ? "Saved to your list" : "Bookmark job"}
                                                    >
                                                        <FiBookmark
                                                            size={18}
                                                            className={isSaved ? "fill-indigo-600" : ""}
                                                        />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <FiMapPin size={13} className="text-slate-400" />
                                                        {job.location || "Remote"}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <FiDollarSign size={13} className="text-slate-400" />
                                                        {formatSalary(job.minSalary, job.maxSalary)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <FiBriefcase size={13} className="text-slate-400" />
                                                        {job.experienceRequired != null
                                                            ? `${job.experienceRequired}+ Yrs Exp`
                                                            : "Fresher"}
                                                    </span>
                                                    {job.workplaceType && (
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                            {job.workplaceType.replace("_", " ")}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Skills Tags */}
                                                {job.requiredSkills && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {job.requiredSkills.split(",").slice(0, 5).map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                                                            >
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details CTA */}
                                            <div className="pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                                                <Link
                                                    to={`/jobs/details/${jobId}`}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 text-xs font-bold transition shadow-xs"
                                                >
                                                    View Details
                                                    <FiArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default JobSearch;
