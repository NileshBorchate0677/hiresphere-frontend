import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiSearch,
    FiMapPin,
    FiBriefcase,
    FiDollarSign,
    FiArrowRight,
    FiUsers,
    FiTrendingUp,
    FiCheckCircle,
    FiLayers,
    FiShield
} from "react-icons/fi";
import { getAllJobs } from "../../services/jobService";
import { getJobFreshness, formatSalaryLPA } from "../../utils/helpers";

const PublicHome = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeJobs = async () => {
            try {
                const data = await getAllJobs();
                const list = Array.isArray(data) ? data : data?.data || [];
                setJobs(list);
            } catch (err) {
                console.error("Home jobs load error:", err);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.append("keyword", keyword.trim());
        if (location.trim()) params.append("location", location.trim());
        navigate(`/jobs?${params.toString()}`);
    };

    const trendingKeywords = [
        "React",
        "Java",
        "Spring Boot",
        "Full Stack",
        "DevOps",
        "Python",
        "Pune",
        "Bengaluru",
        "Remote"
    ];

    // Extract unique companies from live jobs
    const topCompanies = Array.from(
        new Set(jobs.map((j) => j.companyName).filter(Boolean))
    ).slice(0, 8);

    return (
        <div className="flex flex-col font-sans">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
                {/* Glow Background */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-5xl text-center space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-400/30 px-3.5 py-1 text-xs font-bold text-indigo-300">
                        <span>✨ Discover {jobs.length}+ Verified Tech Opportunities</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
                        Find the career that elevates your potential.
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                        Explore verified openings from top enterprise leaders and hyper-growth technology companies with instant application feedback.
                    </p>

                    {/* DUAL-INPUT SEARCH BAR */}
                    <form
                        onSubmit={handleSearch}
                        className="mx-auto max-w-3xl rounded-2xl bg-white p-2.5 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-slate-100"
                    >
                        <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:flex-1">
                            <FiSearch size={18} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Job title, skills, or tech stack..."
                                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
                            />
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-slate-200" />

                        <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:flex-1">
                            <FiMapPin size={18} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City (e.g. Pune, Bengaluru, Remote)..."
                                className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0"
                        >
                            Search Jobs
                        </button>
                    </form>

                    {/* TRENDING PILLS */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                        <span className="text-slate-400 text-[11px] font-semibold">Popular Searches:</span>
                        {trendingKeywords.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                    setKeyword(tag);
                                    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
                                }}
                                className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* LIVE PLATFORM METRICS */}
            <section className="border-y border-slate-200/80 bg-white py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900">{jobs.length}+</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Live Job Openings</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-indigo-600">{topCompanies.length}+</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Top Tech Employers</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900">Direct ATS</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">1-Click Application Flow</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-black text-emerald-600">Instant</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Status Tracking Alerts</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED LIVE EMPLOYERS */}
            {topCompanies.length > 0 && (
                <section className="py-10 bg-slate-50/80 border-b border-slate-200/60">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Verified Tech Hiring Partners
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {topCompanies.map((comp) => (
                                <button
                                    key={comp}
                                    type="button"
                                    onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(comp)}`)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-indigo-300 hover:text-indigo-600 hover:scale-105 transition-all"
                                >
                                    {comp}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* LATEST OPENINGS GRID */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Latest Job Openings</h2>
                        <p className="text-xs text-slate-500 mt-1">Live vacancies published directly by hiring partners</p>
                    </div>

                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                    >
                        Browse All Jobs ({jobs.length})
                        <FiArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-xs font-semibold text-slate-400">
                        Loading live opportunities from database...
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                            <FiBriefcase size={22} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">No Job Openings Currently Available</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Employers are currently preparing new vacancies. Check back shortly.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.slice(0, 6).map((job) => {
                            const jobId = job.jobId || job.id;
                            const companyName = job.companyName || "Hiring Partner";
                            const freshnessInfo = getJobFreshness(job.createdAt);

                            return (
                                <div
                                    key={jobId}
                                    className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-base flex items-center justify-center border border-indigo-100">
                                                {companyName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${freshnessInfo.badgeClass}`}>
                                                    {freshnessInfo.label}
                                                </span>
                                                {job.workplaceType && (
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                        {job.workplaceType.replace("_", " ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                                                {job.title}
                                            </h3>
                                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{companyName}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <FiMapPin size={12} className="text-slate-400" />
                                                {job.location || "Remote"}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 font-bold text-slate-700">
                                                <FiDollarSign size={12} className="text-indigo-600" />
                                                {formatSalaryLPA(job.minSalary, job.maxSalary)}
                                            </span>
                                        </div>

                                        {job.requiredSkills && (
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {job.requiredSkills.split(",").slice(0, 3).map((s, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                                                    >
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400">
                                            {job.experienceRequired != null ? `${job.experienceRequired}+ Yrs Exp` : "Fresher"}
                                        </span>
                                        <Link
                                            to={`/jobs/${jobId}`}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition"
                                        >
                                            View Details
                                            <FiArrowRight size={13} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* DUAL PROPOSITION BANNER */}
            <section className="bg-slate-100/70 border-t border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">For Candidates</span>
                            <h3 className="text-xl font-bold text-slate-900">Elevate your career journey</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Create your profile, upload your resume, bookmark jobs, and apply directly with real-time status tracking.
                            </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <Link
                                to="/jobs"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                            >
                                Browse Jobs Now
                                <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">For Employers</span>
                            <h3 className="text-xl font-bold text-slate-900">Hire top engineering talent</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Post open positions in minutes, screen candidates via an intuitive ATS pipeline, and shortlist the best candidates.
                            </p>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                            >
                                Start Hiring Today
                                <FiArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHome;
