import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
    FiSearch,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiFilter,
    FiBookmark,
    FiArrowRight,
    FiX,
    FiCheck,
    FiLogIn,
    FiClock,
    FiZap,
    FiChevronLeft,
    FiChevronRight,
    FiSliders,
    FiCheckCircle,
    FiRotateCcw
} from "react-icons/fi";
import { getAllJobs } from "../../services/jobService";
import { getJobFreshness, formatSalaryLPA, parseSafeDate } from "../../utils/helpers";

const PublicExploreJobs = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Primary Filters
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "");
    const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
    const [workplaceType, setWorkplaceType] = useState("ALL");
    const [jobType, setJobType] = useState("ALL");
    const [experienceLevel, setExperienceLevel] = useState("ALL"); // ALL | FRESHER | MID | SENIOR
    const [salaryRange, setSalaryRange] = useState("ALL"); // ALL | 0-6 | 6-12 | 12-20 | 20+
    const [freshness, setFreshness] = useState("ALL"); // ALL | 24H | 3D | 7D | 14D | 30D
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [sortBy, setSortBy] = useState("newest"); // newest | oldest | salary_desc | salary_asc | exp_asc | exp_desc

    // Mobile filter modal / toggle
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // Login prompt modal
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [modalActionText, setModalActionText] = useState("");

    // Load jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAllJobs();
                const list = Array.isArray(data) ? data : data?.data || [];
                setAllJobs(list);
            } catch (err) {
                console.error("Failed to load jobs:", err);
                setAllJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Extract dynamic freshness counts
    const freshnessCounts = useMemo(() => {
        const now = new Date();
        const counts = { ALL: allJobs.length, "24H": 0, "3D": 0, "7D": 0, "14D": 0, "30D": 0 };

        allJobs.forEach((job) => {
            const jobDate = parseSafeDate(job.createdAt);
            if (!jobDate) return;
            const diffHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);
            if (diffHours <= 24) counts["24H"]++;
            if (diffHours <= 72) counts["3D"]++;
            if (diffHours <= 168) counts["7D"]++;
            if (diffHours <= 336) counts["14D"]++;
            if (diffHours <= 720) counts["30D"]++;
        });

        return counts;
    }, [allJobs]);

    // Extract dynamic unique companies
    const availableCompanies = useMemo(() => {
        const counts = {};
        allJobs.forEach((j) => {
            if (j.companyName) {
                counts[j.companyName] = (counts[j.companyName] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [allJobs]);

    // Extract dynamic top skills
    const topSkills = useMemo(() => {
        const map = {};
        allJobs.forEach((j) => {
            if (j.requiredSkills) {
                j.requiredSkills.split(",").forEach((s) => {
                    const clean = s.trim();
                    if (clean.length > 1) {
                        map[clean] = (map[clean] || 0) + 1;
                    }
                });
            }
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill]) => skill);
    }, [allJobs]);

    // Filter and Sort Logic
    const filteredJobs = useMemo(() => {
        const now = new Date();

        const filtered = allJobs.filter((job) => {
            // Keyword match (Title, Company, Skills, Description)
            if (searchKeyword.trim()) {
                const kw = searchKeyword.toLowerCase();
                const matchTitle = job.title?.toLowerCase().includes(kw);
                const matchCompany = job.companyName?.toLowerCase().includes(kw);
                const matchSkills = job.requiredSkills?.toLowerCase().includes(kw);
                const matchDesc = job.description?.toLowerCase().includes(kw);
                if (!matchTitle && !matchCompany && !matchSkills && !matchDesc) return false;
            }

            // Location match
            if (locationFilter.trim()) {
                const loc = locationFilter.toLowerCase();
                if (!job.location?.toLowerCase().includes(loc)) return false;
            }

            // Workplace Type
            if (workplaceType !== "ALL" && job.workplaceType !== workplaceType) {
                return false;
            }

            // Job Type
            if (jobType !== "ALL" && job.jobType !== jobType) {
                return false;
            }

            // Experience Level
            if (experienceLevel === "FRESHER") {
                if (job.experienceRequired != null && job.experienceRequired > 1) return false;
            } else if (experienceLevel === "MID") {
                if (job.experienceRequired == null || job.experienceRequired < 2 || job.experienceRequired > 5) return false;
            } else if (experienceLevel === "SENIOR") {
                if (job.experienceRequired == null || job.experienceRequired < 5) return false;
            }

            // Salary Range in LPA (1 LPA = 1,00,000)
            if (salaryRange !== "ALL") {
                const maxLPA = (job.maxSalary || job.minSalary || 0) / 100000;
                if (salaryRange === "0-6" && maxLPA > 6) return false;
                if (salaryRange === "6-12" && (maxLPA < 6 || maxLPA > 12)) return false;
                if (salaryRange === "12-20" && (maxLPA < 12 || maxLPA > 20)) return false;
                if (salaryRange === "20+" && maxLPA < 20) return false;
            }

            // Job Freshness (Date Posted)
            if (freshness !== "ALL") {
                const jobDate = parseSafeDate(job.createdAt);
                if (!jobDate) return false;
                const diffHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);

                if (freshness === "24H" && diffHours > 24) return false;
                if (freshness === "3D" && diffHours > 72) return false;
                if (freshness === "7D" && diffHours > 168) return false;
                if (freshness === "14D" && diffHours > 336) return false;
                if (freshness === "30D" && diffHours > 720) return false;
            }

            // Company Multi-Select Filter
            if (selectedCompanies.length > 0) {
                if (!job.companyName || !selectedCompanies.includes(job.companyName)) {
                    return false;
                }
            }

            return true;
        });

        // Sorting
        return filtered.sort((a, b) => {
            if (sortBy === "newest") {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            }
            if (sortBy === "oldest") {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            }
            if (sortBy === "salary_desc") {
                return (b.maxSalary || b.minSalary || 0) - (a.maxSalary || a.minSalary || 0);
            }
            if (sortBy === "salary_asc") {
                return (a.minSalary || a.maxSalary || 0) - (b.minSalary || b.maxSalary || 0);
            }
            if (sortBy === "exp_asc") {
                return (a.experienceRequired || 0) - (b.experienceRequired || 0);
            }
            if (sortBy === "exp_desc") {
                return (b.experienceRequired || 0) - (a.experienceRequired || 0);
            }
            return 0;
        });
    }, [
        allJobs,
        searchKeyword,
        locationFilter,
        workplaceType,
        jobType,
        experienceLevel,
        salaryRange,
        freshness,
        selectedCompanies,
        sortBy
    ]);

    // Reset pagination when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchKeyword,
        locationFilter,
        workplaceType,
        jobType,
        experienceLevel,
        salaryRange,
        freshness,
        selectedCompanies,
        sortBy
    ]);

    // Paginated subset
    const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredJobs.slice(start, start + pageSize);
    }, [filteredJobs, currentPage]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchKeyword.trim()) count++;
        if (locationFilter.trim()) count++;
        if (workplaceType !== "ALL") count++;
        if (jobType !== "ALL") count++;
        if (experienceLevel !== "ALL") count++;
        if (salaryRange !== "ALL") count++;
        if (freshness !== "ALL") count++;
        if (selectedCompanies.length > 0) count += selectedCompanies.length;
        return count;
    }, [
        searchKeyword,
        locationFilter,
        workplaceType,
        jobType,
        experienceLevel,
        salaryRange,
        freshness,
        selectedCompanies
    ]);

    const resetAllFilters = () => {
        setSearchKeyword("");
        setLocationFilter("");
        setWorkplaceType("ALL");
        setJobType("ALL");
        setExperienceLevel("ALL");
        setSalaryRange("ALL");
        setFreshness("ALL");
        setSelectedCompanies([]);
        setSortBy("newest");
        setSearchParams({});
    };

    const toggleCompany = (companyName) => {
        setSelectedCompanies((prev) =>
            prev.includes(companyName)
                ? prev.filter((c) => c !== companyName)
                : [...prev, companyName]
        );
    };

    const triggerGuestAuthPrompt = (action) => {
        setModalActionText(action);
        setAuthModalOpen(true);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-sans">
            {/* TOP HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 mb-2">
                        <FiZap size={13} className="text-indigo-600" />
                        <span>Public Job Marketplace</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Explore Verified Tech Opportunities
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Discover open engineering, product, and leadership roles from verified tech enterprises.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs"
                    >
                        <FiSliders size={14} className="text-indigo-600" />
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-2xs">
                        <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort jobs by"
                            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                        >
                            <option value="newest">🕒 Most Recent / Fresh</option>
                            <option value="salary_desc">💰 Salary: High to Low</option>
                            <option value="salary_asc">📉 Salary: Low to High</option>
                            <option value="exp_asc">🎯 Experience: Fresher First</option>
                            <option value="exp_desc">🏆 Experience: High to Low</option>
                            <option value="oldest">📅 Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* SEARCH BAR (DUAL INPUT + RESET) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-6 relative flex items-center">
                        <FiSearch size={16} className="absolute left-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="Job title, company, skills (e.g. Java, React, Python)..."
                            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                        {searchKeyword && (
                            <button
                                type="button"
                                onClick={() => setSearchKeyword("")}
                                className="absolute right-3 text-slate-400 hover:text-slate-600"
                                aria-label="Clear keyword search"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>

                    <div className="sm:col-span-4 relative flex items-center">
                        <FiMapPin size={16} className="absolute left-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            placeholder="Location (e.g. Pune, Bengaluru, Remote)..."
                            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                        {locationFilter && (
                            <button
                                type="button"
                                onClick={() => setLocationFilter("")}
                                className="absolute right-3 text-slate-400 hover:text-slate-600"
                                aria-label="Clear location filter"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>

                    <div className="sm:col-span-2 flex items-center">
                        <button
                            type="button"
                            onClick={resetAllFilters}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-600 transition"
                        >
                            <FiRotateCcw size={13} />
                            Reset All
                        </button>
                    </div>
                </div>

                {/* TECH SKILLS QUICK PILLS */}
                {topSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100 text-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Popular Skills:
                        </span>
                        {topSkills.map((skill) => {
                            const isSelected = searchKeyword.toLowerCase().includes(skill.toLowerCase());
                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            setSearchKeyword("");
                                        } else {
                                            setSearchKeyword(skill);
                                        }
                                    }}
                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                        isSelected
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ACTIVE FILTER CHIPS ROW */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                        <FiFilter size={13} /> Active Filters ({activeFilterCount}):
                    </span>

                    {searchKeyword && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            Keyword: "{searchKeyword}"
                            <button type="button" onClick={() => setSearchKeyword("")} className="hover:text-red-500" aria-label="Remove keyword filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {locationFilter && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            Location: "{locationFilter}"
                            <button type="button" onClick={() => setLocationFilter("")} className="hover:text-red-500" aria-label="Remove location filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {freshness !== "ALL" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs">
                            ⚡ {freshness === "24H" ? "Last 24 Hours" : freshness === "3D" ? "Last 3 Days" : freshness === "7D" ? "Past Week" : freshness === "14D" ? "Past 2 Weeks" : "Past Month"}
                            <button type="button" onClick={() => setFreshness("ALL")} className="hover:text-red-500" aria-label="Remove freshness filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {salaryRange !== "ALL" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            💰 Salary: {salaryRange === "0-6" ? "0 - 6 LPA" : salaryRange === "6-12" ? "6 - 12 LPA" : salaryRange === "12-20" ? "12 - 20 LPA" : "20+ LPA"}
                            <button type="button" onClick={() => setSalaryRange("ALL")} className="hover:text-red-500" aria-label="Remove salary range filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {workplaceType !== "ALL" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            {workplaceType.replace("_", " ")}
                            <button type="button" onClick={() => setWorkplaceType("ALL")} className="hover:text-red-500" aria-label="Remove workplace type filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {jobType !== "ALL" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            {jobType.replace("_", " ")}
                            <button type="button" onClick={() => setJobType("ALL")} className="hover:text-red-500" aria-label="Remove job type filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {experienceLevel !== "ALL" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            Exp: {experienceLevel}
                            <button type="button" onClick={() => setExperienceLevel("ALL")} className="hover:text-red-500" aria-label="Remove experience filter">
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {selectedCompanies.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-2xs">
                            🏢 {c}
                            <button type="button" onClick={() => toggleCompany(c)} className="hover:text-red-500" aria-label={`Remove ${c} filter`}>
                                <FiX size={12} />
                            </button>
                        </span>
                    ))}

                    <button
                        type="button"
                        onClick={resetAllFilters}
                        className="text-[11px] font-black text-indigo-700 underline hover:text-indigo-900 ml-auto"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SIDEBAR FILTERS (DESKTOP & MOBILE TOGGLE) */}
                <div className={`lg:col-span-1 space-y-6 ${mobileFiltersOpen ? "block" : "hidden lg:block"}`}>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <FiFilter size={16} className="text-indigo-600" />
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Filters
                                </h2>
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* 1. JOB FRESHNESS (DATE POSTED) FILTER */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                <FiClock size={13} className="text-emerald-600" />
                                <span>Date Posted / Freshness</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                {[
                                    { id: "ALL", label: "All Time", badge: null },
                                    { id: "24H", label: "Past 24 Hours", badge: "⚡ Hot" },
                                    { id: "3D", label: "Past 3 Days", badge: null },
                                    { id: "7D", label: "Past Week (7 Days)", badge: null },
                                    { id: "14D", label: "Past 2 Weeks (14 Days)", badge: null },
                                    { id: "30D", label: "Past Month (30 Days)", badge: null }
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center justify-between cursor-pointer p-1.5 rounded-xl transition ${
                                            freshness === item.id ? "bg-emerald-50 text-emerald-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="freshness"
                                                checked={freshness === item.id}
                                                onChange={() => setFreshness(item.id)}
                                                className="text-emerald-600 focus:ring-emerald-500 rounded"
                                            />
                                            <span>{item.label}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                                ({freshnessCounts[item.id] || 0})
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                                {item.badge}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. SALARY RANGE (LPA) */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                <FiDollarSign size={13} className="text-indigo-600" />
                                <span>Salary Bracket (LPA)</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                {[
                                    { id: "ALL", label: "Any Salary" },
                                    { id: "0-6", label: "Up to ₹6 LPA" },
                                    { id: "6-12", label: "₹6 - ₹12 LPA" },
                                    { id: "12-20", label: "₹12 - ₹20 LPA" },
                                    { id: "20+", label: "₹20+ LPA (Lead / Executive)" }
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-xl transition ${
                                            salaryRange === item.id ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="salaryRange"
                                            checked={salaryRange === item.id}
                                            onChange={() => setSalaryRange(item.id)}
                                            className="text-indigo-600 focus:ring-indigo-500 rounded"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. WORKPLACE TYPE */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                Workplace
                            </label>
                            <div className="space-y-1 text-xs">
                                {[
                                    { id: "ALL", label: "All Workplaces" },
                                    { id: "REMOTE", label: "Remote Only" },
                                    { id: "HYBRID", label: "Hybrid" },
                                    { id: "ON_SITE", label: "On-site / Office" }
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-xl transition ${
                                            workplaceType === item.id ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="workplaceType"
                                            checked={workplaceType === item.id}
                                            onChange={() => setWorkplaceType(item.id)}
                                            className="text-indigo-600 focus:ring-indigo-500 rounded"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 4. EXPERIENCE LEVEL */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                Experience
                            </label>
                            <div className="space-y-1 text-xs">
                                {[
                                    { id: "ALL", label: "Any Experience" },
                                    { id: "FRESHER", label: "Fresher / Entry (0-1 yrs)" },
                                    { id: "MID", label: "Mid-Level (2-5 yrs)" },
                                    { id: "SENIOR", label: "Senior (5+ yrs)" }
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-xl transition ${
                                            experienceLevel === item.id ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="experienceLevel"
                                            checked={experienceLevel === item.id}
                                            onChange={() => setExperienceLevel(item.id)}
                                            className="text-indigo-600 focus:ring-indigo-500 rounded"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 5. EMPLOYMENT TYPE */}
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                Employment Type
                            </label>
                            <div className="space-y-1 text-xs">
                                {[
                                    { id: "ALL", label: "All Types" },
                                    { id: "FULL_TIME", label: "Full Time" },
                                    { id: "PART_TIME", label: "Part Time" },
                                    { id: "INTERNSHIP", label: "Internship" }
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-center gap-2 cursor-pointer p-1.5 rounded-xl transition ${
                                            jobType === item.id ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="jobType"
                                            checked={jobType === item.id}
                                            onChange={() => setJobType(item.id)}
                                            className="text-indigo-600 focus:ring-indigo-500 rounded"
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 6. TOP HIRING PARTNERS (COMPANIES) */}
                        {availableCompanies.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                        Companies ({availableCompanies.length})
                                    </label>
                                    {selectedCompanies.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCompanies([])}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1 text-xs pr-1">
                                    {availableCompanies.map((comp) => {
                                        const isChecked = selectedCompanies.includes(comp.name);
                                        return (
                                            <label
                                                key={comp.name}
                                                className={`flex items-center justify-between cursor-pointer p-1.5 rounded-xl transition ${
                                                    isChecked ? "bg-indigo-50 text-indigo-900 font-bold" : "hover:bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleCompany(comp.name)}
                                                        className="text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="truncate">{comp.name}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-semibold px-1">
                                                    {comp.count}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CANDIDATE CALLOUT BANNER */}
                    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                            Apply with 1-Click
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">Sign Up as a Candidate</h3>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Upload your resume, get discovered by verified enterprise recruiters, and track applications in real-time.
                        </p>
                        <Link
                            to="/register"
                            className="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </div>

                {/* JOB LISTING CARDS (RIGHT COLUMN) */}
                <div className="lg:col-span-3 space-y-4">
                    {/* RESULTS BAR */}
                    <div className="flex items-center justify-between bg-white border border-slate-200/80 px-4 py-3 rounded-2xl shadow-2xs">
                        <p className="text-xs font-bold text-slate-700">
                            Showing <span className="text-indigo-600">{filteredJobs.length}</span> matching{" "}
                            {filteredJobs.length === 1 ? "position" : "positions"}
                            {filteredJobs.length > 0 && ` (Page ${currentPage} of ${totalPages})`}
                        </p>

                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                            Live updates from enterprise hiring partners
                        </span>
                    </div>

                    {loading ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center space-y-3">
                            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-500">Loading verified openings from database...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                <FiBriefcase size={26} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-slate-800">No Jobs Match Your Selected Filters</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Try expanding your date range, broadening your salary or experience criteria, or clearing specific company filters.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetAllFilters}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
                            >
                                <FiRotateCcw size={13} />
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        paginatedJobs.map((job) => {
                            const jobId = job.jobId || job.id;
                            const companyName = job.companyName || "HireSphere Partner";
                            const freshnessInfo = getJobFreshness(job.createdAt);

                            return (
                                <div
                                    key={jobId}
                                    className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all space-y-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            {/* Company Avatar with initial */}
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center border border-indigo-200/60 shrink-0">
                                                {companyName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link
                                                        to={`/jobs/${jobId}`}
                                                        className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition"
                                                    >
                                                        {job.title}
                                                    </Link>

                                                    {/* Job Freshness Badge */}
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${freshnessInfo.badgeClass}`}
                                                    >
                                                        {freshnessInfo.label}
                                                    </span>
                                                </div>

                                                <p className="text-xs font-semibold text-slate-500">
                                                    {companyName}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 pt-1">
                                                    <span className="flex items-center gap-1">
                                                        <FiMapPin size={12} className="text-slate-400" />
                                                        {job.location || "Remote"}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 font-bold text-slate-700">
                                                        <FiDollarSign size={12} className="text-indigo-600" />
                                                        {formatSalaryLPA(job.minSalary, job.maxSalary)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {job.experienceRequired != null
                                                            ? `${job.experienceRequired}+ Yrs Exp`
                                                            : "Fresher Welcome"}
                                                    </span>
                                                    {job.vacancies && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-emerald-700 font-semibold">
                                                                {job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Workplace & Job Type Badges */}
                                        <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                                            {job.workplaceType && (
                                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                    {job.workplaceType.replace("_", " ")}
                                                </span>
                                            )}
                                            {job.jobType && (
                                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                                                    {job.jobType.replace("_", " ")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description Snippet */}
                                    {job.description && (
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>
                                    )}

                                    {/* Required Skills Badges */}
                                    {job.requiredSkills && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {job.requiredSkills.split(",").slice(0, 5).map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setSearchKeyword(s.trim())}
                                                    className="rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition"
                                                >
                                                    {s.trim()}
                                                </button>
                                            ))}
                                            {job.requiredSkills.split(",").length > 5 && (
                                                <span className="text-[10px] text-slate-400 font-semibold self-center">
                                                    +{job.requiredSkills.split(",").length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* ACTIONS ROW */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => triggerGuestAuthPrompt("save this job")}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
                                        >
                                            <FiBookmark size={14} />
                                            <span>Save Job</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/jobs/${jobId}`}
                                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
                                            >
                                                View Specs
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => triggerGuestAuthPrompt("apply for this role")}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                                            >
                                                Apply Now
                                                <FiArrowRight size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => {
                                    setCurrentPage((p) => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                            >
                                <FiChevronLeft size={14} />
                                Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((page, idx, arr) => (
                                        <div key={page} className="flex items-center">
                                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                <span className="px-1 text-slate-400 text-xs">...</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentPage(page);
                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                }}
                                                className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                                                    currentPage === page
                                                        ? "bg-indigo-600 text-white shadow-xs"
                                                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => {
                                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                            >
                                Next
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* GUEST AUTHENTICATION PROMPT MODAL */}
            {authModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 space-y-5">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FiLogIn size={20} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setAuthModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                aria-label="Close authentication modal"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-base font-black text-slate-900">Sign In to Continue</h3>
                            <p className="text-xs text-slate-500">
                                You need a candidate account to {modalActionText}. Registering takes less than 30 seconds and is completely free.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                to="/login"
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 text-center transition shadow-2xs"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white text-center shadow-md shadow-indigo-600/20 transition"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicExploreJobs;
